#include <cstdio> // for uint8_t (emcc also needs C++11: -std=c++11 )
#include <chrono>
#include <pthread.h>
#include <emscripten.h>

#ifdef __cplusplus
extern "C" { // So that the C++ compiler doesn't adjust your function names
#endif

// Value that's set after the AdjustImageWithoutUsingThreads and
// AdjustImageUsingThreads functions run so that the caller can log or display
// the duration.
double execution_duration = 0.0;


EMSCRIPTEN_KEEPALIVE
uint8_t* CreateBuffer(int size)
{
  return new uint8_t[size];
}


EMSCRIPTEN_KEEPALIVE
void FreeBuffer(uint8_t* buffer)
{
  delete[] buffer;
}


EMSCRIPTEN_KEEPALIVE
double GetDuration()
{
  return execution_duration;
}


// Adjust a single pixel's colors
void AdjustColors(uint8_t* image_data, int index)
{
  // Average out the colors
  int new_color = ((image_data[index] + image_data[index + 1] + 
    image_data[index + 2]) / 3); 
  
  // Set each channel's value to the new value to make the grey
  image_data[index] = new_color; // Red
  image_data[index + 1] = new_color; // Green
  image_data[index + 2] = new_color; // Blue
  // no need to adjust the Alpha channel value  
}


// Adjust a range of pixels
void AdjustPixels(uint8_t* image_data, int start_index, int stop_index)
{
  // Loop through every fourth byte because AdjustColors operates on 4 bytes at
  // a time (RGBA data) 
  for (int index = start_index; index < stop_index; index += 4)
  {
    AdjustColors(image_data, index);
  }
}


// Control version of the AdjustImageUsingThreads function so that we can see 
// the duration when not using threading.
//
// Rather than image_data_size, you could pass in width and height. Did it this
// way because the JavaScript already knew the buffer size so it saved doing
// the calculation here.
EMSCRIPTEN_KEEPALIVE
void AdjustImageWithoutUsingThreads(uint8_t* image_data, int image_data_size)
{
  // Not using 'clock_t start = clock()' because that returns the CPU clock
  // which includes how much CPU time each thread uses too. We want to know the
  // wall clock time that has passed.
  std::chrono::high_resolution_clock::time_point duration_start = 
    std::chrono::high_resolution_clock::now();

  AdjustPixels(image_data, 0, image_data_size);

  std::chrono::high_resolution_clock::time_point duration_end = 
    std::chrono::high_resolution_clock::now();
  std::chrono::duration<double, std::milli> duration = 
    (duration_end - duration_start);

  // Convert the value into a normal double
  execution_duration = duration.count();

  printf("AdjustImageWithoutUsingThreads took %f milliseconds to execute.\n", 
    duration.count());
}


struct thread_args 
{
  uint8_t* image_data;
  int start_index;
  int stop_index;
};

void* thread_func(void* arg) 
{
  struct thread_args* args = (struct thread_args*)arg;
  AdjustPixels(args->image_data, args->start_index, args->stop_index);
 
  return arg;
}

// Threading version of the AdjustImageWithoutUsingThreads function
EMSCRIPTEN_KEEPALIVE
void AdjustImageUsingThreads(uint8_t* image_data, int image_data_size)
{
  std::chrono::high_resolution_clock::time_point duration_start = 
    std::chrono::high_resolution_clock::now();

  // There are 4 bytes per pixel so make sure the threads are working on the 
  // data in multiples of 4
  pthread_t thread_ids[4];
  struct thread_args args[4];
  int grouping_size = (image_data_size / 4);
  int start_index = 0;

  // Spin up each thread...
  for (int i = 0; i < 4; i++) 
  {
    args[i].image_data = image_data;
    args[i].start_index = start_index;
    args[i].stop_index = (start_index + grouping_size);

    if (pthread_create(&thread_ids[i], NULL, thread_func, &args[i]))
    {
      perror("Thread create failed");
      return;
    }

    // thread_func will stop 1 less than the stop_index value so that's the
    // next start index
    start_index = args[i].stop_index;
  }

  // Wait for each of the threads to finish...
  for (int j = 0; j < 4; j++)
  {
    pthread_join(thread_ids[j], NULL);
  }

  std::chrono::high_resolution_clock::time_point duration_end = 
    std::chrono::high_resolution_clock::now();
  std::chrono::duration<double, std::milli> duration = 
    (duration_end - duration_start);

  // Convert the value into a normal double
  execution_duration = duration.count();

  printf("AdjustImageUsingThreads took %f milliseconds to execute.\n", 
    duration.count());
}

#ifdef __cplusplus
}
#endif