#include <stdlib.h>

#ifdef __EMSCRIPTEN__
  #include <emscripten.h>
#endif

EMSCRIPTEN_KEEPALIVE
int Add(int value1, int value2) 
{
  return (value1 + value2); 
}