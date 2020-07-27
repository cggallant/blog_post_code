function initializePage() {
  $("#fileUpload").on("change", processImageFile);
}


// Called when the user selects a file to upload
function processImageFile(e) {
  // Read in the file
  const reader = new FileReader();
  reader.onload = e => {
    // The file's data is returned as data URL with the image data as a
    // base64 string.
    renderOriginalImage(e.target.result);
  }
  reader.readAsDataURL(e.currentTarget.files[0]);
}


function renderOriginalImage(url) {
  const originalImage = new Image();
  originalImage.onload = () => {
    // Draw the original image
    const originalContext = $("#originalCanvas")[0].getContext("2d");
    originalContext.drawImage(originalImage, 0, 0, 250, 250);

    // Display the dimensions
    const width = originalImage.width;
    const height = originalImage.height;
    $("#originalImageDimensions").text(`Dimensions: ${width} x ${height}`);

    // Grab the image data from the canvas, have the data modified by the
    // JavaScript code and WebAssembly module, and then render the modified
    // images.
    const originalImageData = originalContext.getImageData(0, 0, width, height);
    adjustImageJS(originalImageData, width, height, "nonThreadedJSCanvas");
    adjustImageWasm(originalImageData, width, height, "nonThreadedWasmCanvas");
    adjustImageWasm(originalImageData, width, height, "threadedWasmCanvas");
  }
  originalImage.src = url;
}


function adjustImageJS(imageData, width, height, destinationCanvasId) {
  // Get a copy of the imageData and the number of bytes it contains.
  const imageDataBytes = Uint8ClampedArray.from(imageData.data);
  const bufferSize = imageDataBytes.byteLength;

  // Adjust the pixels using JavaScript and get the duration
  const Start = new Date();
  adjustPixels(imageDataBytes, 0, bufferSize);
  const duration = (new Date() - Start);
  console.log(`JavaScript version took ${duration} milliseconds to execute.`); 

  // Have the modified image displayed
  renderModifiedImage(destinationCanvasId, imageDataBytes, width, height,
    duration);
}


// Adjust a range of pixels
function adjustPixels(imageData, startIndex, stopIndex) {
  // Loop through every fourth byte because adjustColors operates on 4 bytes at
  // a time (RGBA data) 
  for (let index = startIndex; index < stopIndex; index += 4) {
    adjustColors(imageData, index);
  }
}


// Adjust a single pixel's colors
function adjustColors(imageData, index) {
  // Average out the colors
  const newColor = ((imageData[index] + imageData[index + 1] + 
    imageData[index + 2]) / 3); 

  // Set each channel's value to the new value to make the grey
  imageData[index] = newColor; // Red
  imageData[index + 1] = newColor; // Green
  imageData[index + 2] = newColor; // Blue
  // no need to adjust the Alpha channel value  
}


function renderModifiedImage(canvasId, byteArray, width, height, duration) {
  // Get the image data of the target canvas and update it with the modified 
  // data we received from the module. Put the image data back into the canvas.
  const modifiedContext = $(`#${canvasId}`)[0].getContext('2d');
  const modifiedImageData = modifiedContext.getImageData(0, 0, width, height);
  modifiedImageData.data.set(byteArray);
  modifiedContext.putImageData(modifiedImageData, 0, 0);

  // Indicate how long the code took to run
  $(`#${canvasId}Duration`).text(`${duration} milliseconds`);
}


function adjustImageWasm(imageData, width, height, destinationCanvasId) {
  // Get the number of bytes in the ImageData's Uint8ClampedArray and then 
  // reserve space in the module's memory for the image data. Copy the data in.
  const bufferSize = imageData.data.byteLength;
  const imageDataPointer = Module._CreateBuffer(bufferSize);
  Module.HEAPU8.set(imageData.data, 
    (imageDataPointer / Module.HEAPU8.BYTES_PER_ELEMENT));
  
  // Call the module's non-threaded function
  if (destinationCanvasId === "nonThreadedWasmCanvas") {
    Module._AdjustImageWithoutUsingThreads(imageDataPointer, bufferSize);
  }
  else { // Call the module's threaded function
    Module._AdjustImageUsingThreads(imageDataPointer, bufferSize);
  }

  // Copy the modified bytes from the module's memory (1st line gets a view of
  // a section of the HEAPU8's buffer. 2nd line makes a copy of the bytes 
  // because we're about to free that part of the module's memory)
  const byteView = new Uint8Array(Module.HEAPU8.buffer, imageDataPointer, 
    bufferSize);
  const byteCopy = new Uint8Array(byteView); // copies when given a typed array

  // Release the memory that was allocated for the image data
  Module._FreeBuffer(imageDataPointer);

  // Have the modified image displayed
  renderModifiedImage(destinationCanvasId, byteCopy, width, height, 
    Module._GetDuration());
}