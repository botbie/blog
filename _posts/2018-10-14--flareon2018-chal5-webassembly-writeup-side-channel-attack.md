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

Với vài dòng Google tối thiểu bạn có thể thoi thóm hi vọng decompile file binary này bằng [wasm2c](https://github.com/WebAssembly/wabt/tree/master/wasm2c). Sau vài phát gõ phím chúng ta nhanh chóng thấy một đoạn mã giả C dài hơn 2 ngàn dòng (cụ thể là 2144 dòng).

![flaron18_wasm_02.png]({{site.baseurl}}/assets/media/flaron18_wasm_02.png)

Đoạn mã giả với đầy những ký tự bí ẩn dạng như thế này:
~~~~
static u32 Match(u32 p0, u32 p1, u32 p2, u32 p3) {
  u32 l0 = 0, l1 = 0, l2 = 0, l3 = 0, l4 = 0, l5 = 0, l6 = 0, l7 = 0, 
      l8 = 0, l9 = 0, l10 = 0, l11 = 0, l12 = 0, l13 = 0, l14 = 0, l15 = 0, 
      l16 = 0, l17 = 0, l18 = 0, l19 = 0, l20 = 0, l21 = 0, l22 = 0, l23 = 0;
  FUNC_PROLOGUE;
  u32 i0, i1, i2, i3, i4;
  ...
  i0 = 11u;
  i0 = l2;
  i1 = l4;
  i0 += i1;
  l5 = i0;
  i0 = l5;
  l6 = i0;
  i0 = 0u;
  i32_store((&memory), (u64)(i0 + 24), i1);
  i0 = l2;
  i1 = p1;
  i32_store((&memory), (u64)(i0 + 20), i1);
  i0 = l2;
  i1 = p2;
  i32_store((&memory), (u64)(i0 + 16), i1);
  i0 = l2;
  i1 = p3;
~~~~

Trong một sự nổ lực, mình Google xem các tiền bối đi trước nói chuyện với các bài WASM thế nào, mọi thứ đều thật đẹp khi mình đọc thấy một writeup dài vài cây số [ở đây](https://github.com/balsn/ctf_writeup/tree/master/20180421-*ctf#wasm-sces60107), những hi vọng tốt lành nhanh chóng tan đi khi writeup bắt đầu bằng hơn 900 dòng mã C rồi bạn ấy dễ dàng phát biểu một dòng đầy thần kỳ.
> The first thing come out in my mind is that It's TEA.
But there some difference.

Mình không có đủ các kiên trì kiểu này. Nhưng thế giới có rất nhiều người tài và đầy thằng đểu. Nếu không làm được người tài thì mình làm thằng còn lại vậy. Trong thoi thóp mình nhớ lại một cách đểu trước đây từng dùng, [side channel attack](https://blog.botbie.io/2014/07/01/binary-analysis-next-chapter-of-the-game).

## Giải bài
Mục tiêu của mình là tìm một công cụ để đếm số instruction thực thi của WASM, bằng cách đếm sự khác nhau của các instruction thực thi mỗi khi thay đổi input đầu vào, bằng cách đó có thể dò ra flag. Chi tiết hơn về cách thức này bạn có thể đọc lại [bài cũ](https://blog.botbie.io/2014/07/01/binary-analysis-next-chapter-of-the-game) mình đã nói bên trên.
Mình tìm ra công cụ có cái tên rất cute là [wasabi](https://github.com/danleh/wasabi).

**wasabi** hỗ trợ đếm từng loại instruction, do chưa biết nên đếm loại nào, mình code đoạn cho đếm từng loại.

~~~~
/*
 * User-facing API for dynamic analyses.
 */

sa = {

};

function resetSA() {
    sa = {
        start: 0,
        nop: 0,
        unreachable: 0,
        if_: 0,
        br: 0,
        br_if: 0,
        br_table: 0,
        begin: 0,
        end: 0,
        drop: 0,
        select: 0,
        call_pre: 0,
        call_post: 0,
        return_: 0,
        load: 0,
        store: 0
    };
}

function printSA(prefix) {
    console.log(prefix, "sa:",
        "start=" , sa.start,
        "nop=" , sa.nop,
        "unreachable=" , sa.unreachable,
        "if_=" , sa.if_,
        "br=" , sa.br,
        "br_if=" , sa.br_if,
        "br_table=" , sa.br_table,
        "begin=" , sa.begin,
        "end=" , sa.end,
        "drop=" , sa.drop,
        "select=" , sa.select,
        "call_pre=" , sa.call_pre,
        "call_post=" , sa.call_post,
        "load=" , sa.load,
        "store=" , sa.store
        );
};

function getSAStr(prefix) {
    return JSON.stringify(sa);
};

Wasabi.analysis = {

    start(location) {
        sa.start++;
    },
    if_(location, condition) {
        sa.if_++;
    },
    br(location, target) {
        sa.br++;
    },
    br_if(location, conditionalTarget, condition) {
        sa.if_++;
    },
    br_table(location, table, defaultTarget, tableIdx) {
        sa.br_table++;
    },
    begin(location, type) {
        sa.begin++;
    },
    end(location, type, beginLocation, ifLocation) {
        sa.end++;
    },
    drop(location, value) {
        sa.drop++;
    },
    select(location, cond, first, second) {
        sa.select++;
    },
    call_pre(location, targetFunc, args, indirectTableIdx) {
        sa.call_pre++;
    },
    call_post(location, values) {
        sa.call_post++;
    },
    return_(location, values) {
        sa.return_++;
    },
    load(location, op, memarg, value) {
        sa.load++;
    },
    store(location, op, memarg, value) {
        sa.store++;
    },

};
~~~~


