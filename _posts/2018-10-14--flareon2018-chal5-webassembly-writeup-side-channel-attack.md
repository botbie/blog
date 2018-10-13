---
layout: post
date: '2018-10-14 02:05 +0700'
published: false
title: '[flareon2018] chal5 WebAssembly writeup: side channel attack'
---
## Đọc đề
Bài WebAssembly là một trang web nho nhỏ, một đoạn JavaScript vừa đủ gọn để gọi được viết bằng WebAssemly (tất nhiên rồi, đề nó vậy mà). Đoạn JavaScript nhỏ xinh để gọi như sau:

~~~~
fetch("test.wasm").then(response =>
  response.arrayBuffer()
).then(bytes =>
  WebAssembly.instantiate(bytes, {
    env: {
    /// comment
     },
      __syscall6: function __syscall6(n, a, b, c, d, e, f) { return syscall(instance, n, [a, b, c, d, e, f]); },

      putc_js: function (c) {
        c = String.fromCharCode(c);
        if (c == "\n") {
          console.log(wasm_stdout);
          wasm_stdout  = "";
        } else {
          wasm_stdout += c;
        }
      }
    }
  })
).then(results => {
    instance = results.instance;

    let a = new Uint8Array([
        0xE4, 0x47, 0x30, 0x10, 0x61, 0x24, 0x52, 0x21, 0x86, 0x40, 0xAD, 0xC1, 0xA0, 0xB4, 0x50, 0x22, 0xD0, 0x75, 0x32, 0x48, 0x24, 0x86, 0xE3, 0x48, 0xA1, 0x85, 0x36, 0x6D, 0xCC, 0x33, 0x7B, 0x6E, 0x93, 0x7F, 0x73, 0x61, 0xA0, 0xF6, 0x86, 0xEA, 0x55, 0x48, 0x2A, 0xB3, 0xFF, 0x6F, 0x91, 0x90, 0xA1, 0x93, 0x70, 0x7A, 0x06, 0x2A, 0x6A, 0x66, 0x64, 0xCA, 0x94, 0x20, 0x4C, 0x10, 0x61, 0x53, 0x77, 0x72, 0x42, 0xE9, 0x8C, 0x30, 0x2D, 0xF3, 0x6F, 0x6F, 0xB1, 0x91, 0x65, 0x24, 0x0A, 0x14, 0x21, 0x42, 0xA3, 0xEF, 0x6F, 0x55, 0x97, 0xD6
    ]);

    let b = new Uint8Array(new TextEncoder().encode(getParameterByName("q")));

    let pa = wasm_alloc(instance, 0x200);
    wasm_write(instance, pa, a);

    let pb = wasm_alloc(instance, 0x200);
    wasm_write(instance, pb, b);

    if (instance.exports.Match(pa, a.byteLength, pb, b.byteLength) == 1) {
        // PARTY POPPER
        document.getElementById("container").innerText = "🎉";
    } else {
        // PILE OF POO
        document.getElementById("container").innerText = "💩";
    }
});

~~~~

Đoạn code nhỏ xinh dễ đọc, dễ hiểu và lâu ra kết quả này như sau:
1. Lấy paramater truyền từ biến **"q"** nhập vào trên URL.
2. Ghi nó vào trong khối WASM, cùng với một cục init data trong biến **a** hardcode.
3. Gọi hàm Match trong WASM, nếu kết quả bằng 1 thì emoji 🎉 sẽ hiện ra khen thưởng cho bạn, nếu không thì một cục sh!t xinh 💩 sẽ đập vào mắt bạn. Ban tổ chức quên khi rõ bạn nên xem mấy emoji này trên Firefox để tăng độ sinh động.

WASM nhỏ nhắn thu mình trong kích thước 4.061 bytes với cái giản dị nhẹ nhàng va vào mắt thanh niên đọc đề **test.wasm**.
![flaron18_wasm_01.png]({{site.baseurl}}/assets/media/flaron18_wasm_01.png)

Với vài dòng Google tối thiểu bạn có thể thoi thóm hi vọng decompile file binary này bằng [wasm2c](https://github.com/WebAssembly/wabt/tree/master/wasm2c). Sau vài phát gõ phím chúng ta nhanh chóng:


Enter text in [Markdown](http://daringfireball.net/projects/markdown/). Use the toolbar above, or click the **?** button for formatting help.
