emcc pthreads.cpp -std=c++11 -s INITIAL_MEMORY=67108864 -s ALLOW_MEMORY_GROWTH=1 -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=4 -O3 -o ..\frontend\js\emscripten_pthread.js