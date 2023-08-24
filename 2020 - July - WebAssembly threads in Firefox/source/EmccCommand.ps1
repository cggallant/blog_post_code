# Pulling the docker image... (https://hub.docker.com/r/emscripten/emsdk/tags)
#
#   For this code, we're using 3.1.33 so: docker pull emscripten/emsdk:3.1.33
#
#   If you wanted the latest version: docker pull emscripten/emsdk:latest


# On Windows, can run this file by opening it with the Windows PowerShell ISE or you can run it from the command line: powershell -File EmccCommand.ps1

# Similar to running Emscripten directly, with the docker image you just map the folder that has the files you want to build (I've included 
# the Emscripten version used for the docker image because sometimes later versions of Emscripten don't handle things the same way and the
# code needs to be updated)
docker run --rm -v ${pwd}:/src emscripten/emsdk:3.1.33 emcc pthreads.cpp -std=c++11 -s INITIAL_MEMORY=67108864 -s ALLOW_MEMORY_GROWTH=1 -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=4 -O3 -o emscripten_pthread.js

# Copy the generated files to the frontend/js folder
xcopy emscripten_pthread.js ..\frontend\js\emscripten_pthread.js /y /q
xcopy emscripten_pthread.wasm ..\frontend\js\emscripten_pthread.wasm /y /q
xcopy emscripten_pthread.worker.js ..\frontend\js\emscripten_pthread.worker.js /y /q

# Delete the generated files from this folder
del emscripten_pthread.js
del emscripten_pthread.wasm
del emscripten_pthread.worker.js