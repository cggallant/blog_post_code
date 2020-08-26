# 2020 - July - WebAssembly threads in Firefox

  <img src="https://1.bp.blogspot.com/-20aC9uX8oPc/XyAh6PICkBI/AAAAAAAALOI/C4SMdZl69YA4pqkfTcaYRwvYfU0l_MA6ACLcBGAsYHQ/w400-h174/9%2B-%2BScreen%2Bshot%2Bof%2Bfinal%2Bproduct%2Bwith%2Bimages%2Bshown.png" width="350" align="right" /> In my book book, "[WebAssembly in Action](https://www.manning.com/books/webassembly-in-action)", I show you how to use WebAssembly threads but, at the time of the book's writing, they were only available in Firefox behind a flag. They're no longer behind a flag but Firefox has added a requirement: To enable the SharedArrayBuffer, you need to include two response headers.

  This repository holds the code for the following article that walks you through returning the response headers, including the crossorigin attribute, and using WebAssembly threads to convert a user-supplied image to greyscale: [https://cggallant.blogspot.com/2020/07/webassembly-threads-in-firefox.html](https://cggallant.blogspot.com/2020/07/webassembly-threads-in-firefox.html)

  At the moment, this is Firefox specific but will soon be a requirement for all browsers that support WebAssembly threads including Chrome for Android _(November 2020)_, Firefox for Android _(soon)_, and Chrome desktop _(March 2021)_.

 