---
layout: post
cover: 'assets/images/covers/cover4.jpg'
subclass: 'post tag-test tag-content'
navigation: True
title: Xin chào Swift
date: 2016-07-08
tags: [swift]
author: nguquen
comments: true
---

Swift là ngôn ngữ lập trình được phát triển bởi Apple, release vào năm 2014, phiên bản mới nhất tại thời điểm viết bài này là 3.0 Preview 2. Apple đã tạo ra một điểm nhấn khi quyết định open source Swift vào ngày 3-12-2015, Swift hiện tại có thể develop và thực thi trên cả môi trường Linux lẫn Mac, mở ra cơ hội tiếp cận ngôn ngữ này cho những người dùng Linux. Swift đã không còn là một ngôn ngữ chỉ để thay thế objective-c khi phát triển ứng dụng cho Mac/iOS mà giờ đây chúng ta hoàn toàn có thể viết bất kì chương trình nào với nó, ví dụ như các ứng dụng Server-Side cho Linux. Hiện đã có một vài web framework cho Swift như [Kitura](https://github.com/IBM-Swift/Kitura) được phát triển bởi IBM, hay [Perfect](http://www.perfect.org/).

### Cài đặt:
1. Cài đặt dependencies:
```
$ sudo apt-get install clang libicu-dev
```
2. Tải về phiên bản release mới nhất (3.0 Preview 2):
```
$ wget https://swift.org/builds/swift-3.0-preview-2/ubuntu1510/swift-3.0-PREVIEW-2/swift-3.0-PREVIEW-2-ubuntu15.10.tar.gz
```
3. Giải nén file vừa tải về:
```
$ tar xzf swift-3.0-PREVIEW-2-ubuntu15.10.tar.gz
```
4. Add Swift toolchain vào PATH:
```
$ export PATH="/<path>/swift-3.0-PREVIEW-2-ubuntu15.10/usr/bin:$PATH"
```
5. Kiểm tra swift đã cài đúng chưa:
```
$ swift --version
Swift version 3.0 (swift-3.0-PREVIEW-2)
Target: x86_64-unknown-linux-gnu
```

### Sử dụng REPL:
Gõ lệnh swift không kèm theo tham số nào, chúng ta sẽ có được một shell tương tác có khả năng đọc, evaluate và in kết quả của bất kì đoạn code Swift nào mà bạn nhập vào:
```
$ swift
Welcome to Swift version 3.0 (swift-3.0-PREVIEW-2). Type :help for assistance.
  1> 1 + 1
$R0: Int = 2
  2> let greet = "Xin chao Swift"
greet: String = "Xin chao Swift"
  3> print(greet)
Xin chao Swift
  4>
```
Chúng ta còn có thể import các module của hệ thống như `Darwin` trên Mac hay `Glibc` trên Linux:
```
1> import Glibc
2> random() % 10
$R0: Int = 3
```

### Tạo Package và build file thực thi với `Build System`
1. Kiểm tra phiên bản Swift có hỗ trợ build hay không:
```
$ swift build --help
OVERVIEW: Build sources into binary products
USAGE: swift build [mode] [options]
...
```
2. Tạo package:
```
$ mkdir Hello
$ cd Hello
```
Mọi package cần có một file Package.swift trong thư mục gốc:
```
touch Package.swift
```
Tạo thư mục chứa source code:
```
$ mkdir Sources
```
3. Build file thực thi:

Tạo file main.swift trong `Sources/` với nội dung sau bằng text editor bất kỳ:
```
print("Xin chào Swift")
```
Biên dịch package bằng lệnh `swift build`:
```
$ swift build
Compile Swift Module 'Hello' (1 sources)
Linking .build/debug/Hello
```
Chạy thử nào:
```
$ .build/debug/Hello
Xin chào Swift
```
Kiểm tra file build ra thuộc loại nào:
```
$ file .build/debug/Hello
.build/debug/Hello: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=becde89d40e02d3c9d9ca147580844d632f1c8f4, not stripped
```
Chúng ta có thể thấy file được build ra có định dạng ELF, đây là định dạng file thực thi của Linux, điều đó có nghĩa Swift biên dịch source code qua native code -> chương trình sẽ được chạy trực tiếp trên máy thật chứ không phải thông qua VM như Java hay .NET :cool:

Nói đến Swift thì chắc chắn đó là một câu chuyện dài, bài viết này chỉ nhằm mục đích "Hello World" nên xin tạm dừng tại đây, hẹn gặp các bạn vào những bài viết sau :grin:
