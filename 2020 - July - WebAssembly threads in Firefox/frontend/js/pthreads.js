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
    // Determine the scale needed to draw the image so that it fits in the 
    // canvas
    const width = originalImage.width;
    const height = originalImage.height;
    const originalCanvas = $("#originalCanvas")[0];
    let scale = Math.min(originalCanvas.width / width,
      originalCanvas.height / height);
    
    // If the image is smaller than the canvas, draw at its original size
    if (scale > 1.0) { scale = 1; }

    // Render the image to the canvas
    const sizeDetails = { width: width, height: height, scale: scale };
    renderImage(originalCanvas, originalImage, sizeDetails);
    
    // Display the dimensions
    $("#originalImageDimensions").text(`Dimensions: ${width} x ${height}`);


    // You need to get the image bytes but the original canvas now holds an
    // image that is at most 250x250. Because you want all the original 
    // pixels, create a temporary canvas that's not attached to the DOM and
    // draw the image at its full size.
    const $canvas = $("<canvas />");
    $canvas.prop({ width: width, height: height });
    const canvasContext = $canvas[0].getContext("2d");
    canvasContext.drawImage(originalImage, 0, 0, width, height);

    // Grab the image data from the temporary canvas, have the data modified by
    // the JavaScript code and WebAssembly module, and then render the modified
    // images. Note that adjustImageJS and adjustImageWasm are async.
    const originalImageData = canvasContext.getImageData(0, 0, width, height);
    adjustImageJS(originalImageData, sizeDetails, "nonThreadedJSCanvas");
    adjustImageWasm(originalImageData, sizeDetails, "nonThreadedWasmCanvas");
    adjustImageWasm(originalImageData, sizeDetails, "threadedWasmCanvas");
  }
  originalImage.src = url;
}


function renderImage(canvas, imageSource, sizeDetails) {
  // Clear any previous image from the canvas, adjust the scale so the image
  // will fit the display size of the canvas, draw the original image, and
  // then reset the scale (setTransform call).
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, 250, 250);
  context.scale(sizeDetails.scale, sizeDetails.scale);    
  context.drawImage(imageSource, 0, 0, sizeDetails.width, sizeDetails.height);
  context.setTransform(1, 0, 0, 1, 0, 0);
}


async function adjustImageJS(imageData, sizeDetails, destinationCanvasId) {
  // Get a copy of the imageData and the number of bytes it contains.
  const imageDataBytes = Uint8ClampedArray.from(imageData.data);
  const bufferSize = imageDataBytes.byteLength;

  // Adjust the pixels using JavaScript and get the duration
  const Start = new Date();
  adjustPixels(imageDataBytes, 0, bufferSize);
  const duration = (new Date() - Start);
  console.log(`JavaScript version took ${duration} milliseconds to execute.`); 

  // Have the modified image displayed
  renderModifiedImage(destinationCanvasId, imageDataBytes, sizeDetails,
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


function renderModifiedImage(canvasId, byteArray, sizeDetails, duration) {
  // Create a temporary canvas that's the size of the image that was modified
  const $canvas = $("<canvas />");
  $canvas.prop({ width: sizeDetails.width, height: sizeDetails.height });
  const canvas = $canvas[0];
  const canvasContext = canvas.getContext("2d");

  // Get the image data of the temporary canvas and update it with the modified
  // pixel data.
  const modifiedImageData = canvasContext.getImageData(0, 0, 
    sizeDetails.width, sizeDetails.height);
  modifiedImageData.data.set(byteArray);
  canvasContext.putImageData(modifiedImageData, 0, 0);

  // Have the temporary canvas drawn onto the destination canvas
  const destinationCanvas = $(`#${canvasId}`)[0];
  renderImage(destinationCanvas, canvas, sizeDetails);

  // Indicate how long the code took to run
  $(`#${canvasId}Duration`).text(`${duration} milliseconds`);
}


async function adjustImageWasm(imageData, sizeDetails, destinationCanvasId) {
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
  renderModifiedImage(destinationCanvasId, byteCopy, sizeDetails, 
    Module._GetDuration());
}