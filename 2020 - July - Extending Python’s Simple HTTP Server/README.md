# 2020 - July - Extending Python’s Simple HTTP Server
  
  In my book, "[WebAssembly in Action](https://www.manning.com/books/webassembly-in-action)", I used Python's Simple HTTP Server as a local web server because it was convenient due to the Emscripten toolkit needing Python for its installation. At the time, I wasn't aware that you could extend Python's web server which would have made things a bit easier during your setup because you can include the WebAssembly Media Type in the file rather than having to edit one of Python's files.
  
  This repository holds the code for the following article that shows you how to extend Python's web server: [https://cggallant.blogspot.com/2020/07/extending-pythons-simple-http-server.html](https://cggallant.blogspot.com/2020/07/extending-pythons-simple-http-server.html)
  
  This article is also a precursor for my next article "[WebAssembly threads in Firefox](https://cggallant.blogspot.com/2020/07/webassembly-threads-in-firefox.html)" because that article will need two response headers returned which isn't possible by using Python’s simple HTTP server.
 