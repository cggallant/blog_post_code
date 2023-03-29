# 2023 - March - Safari 16.4 Support for WebAssembly fixed-width SIMD. How to use it with C#
  
  On March 27th, 2023, Safari 16.4 was released and with it came support for WebAssembly's fixed-width SIMD feature! With this update, all modern browsers now support this feature.

  The Uno Platform allows you to write an application that works on multiple systems including in the browser thanks to WebAssembly. The Uno Platform uses .NET and the ability to target WebAssembly fixed-width SIMD was added in .NET 7.0.

  I wrote the following article that walks you through creating an Uno Platform application and work with vectors to leverage SIMD. The article also explains how to compile your application ahead-of-time (AOT) with SIMD support: [https://platform.uno/blog/safari-16-4-support-for-webassembly-fixed-width-simd-how-to-use-it-with-c/](https://platform.uno/blog/safari-16-4-support-for-webassembly-fixed-width-simd-how-to-use-it-with-c/)


  This repository holds a Blazor WebAssembly version of that code. There are some slight differences between how the Uno Platform does things compared to Blazor WebAssembly especially around ahead-of-time (AOT) compilation. For more information on that, you can check out my related blog post here: [https://cggallant.blogspot.com/2023/03/safari-164-and-webassembly-fixed-width.html](https://cggallant.blogspot.com/2023/03/safari-164-and-webassembly-fixed-width.html)