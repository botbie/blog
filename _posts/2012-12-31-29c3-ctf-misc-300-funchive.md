---
layout: post
cover: "assets/images/covers/cover2.jpg"
title: 29C3 CTF | MISC 300 FUNCHIVE
date: 2012-12-31
tags: [security, ctf]
author: khoai
description: >
  A late christmas present! Open it! Open it!
---

> A late christmas present! Open it! Open it!
> http://dl.ctftime.org/57/205/funchive.rar

Ta có một file nén rar, xả nén ta có một file mang tên flag với thông điệp như sau:

> 29C3_this_is_no_flag!

No flag, tất nhiên là vậy.

Coi kỹ hơn chút, file nặng 1103 byte nhưng chỉ để có nội dung file nhỏ vậy, như vậy còn gì trong đó nữa. Để ý chút là file dùng dạng nén rar, nhớ ra trước đây có đọc một bài viết nói về máy ảo của Rar mang tên là rarvm, google lại chút: http://blog.cmpxchg8b.com/2012/09/fun-with-constrained-programming.html

Tìm một source nào đó để decompile hoặc debug được cái rarvm nếu có, tìm thấy source giải nén rar: http://www.rarlab.com/rar/unrarsrc-4.2.4.tar.gz

Mở bằng Visual Studio ra và debug, chỉnh một chút về parameter truyền vào cho tiện debug.

F5 phát coi chạy được không cái đã.

Ok, chạy ổn, tiếp tục.

Đọc code một vòng và đặt break point, F5 và ta thấy một số thông tin quan trọng sau

Cái này cho thấy tới 960 byte trong file rar này là thuộc rarvm, có vẻ đi đúng hướng. Sâu hơn một chút:

Vùng code cho máy ảo rarvm có 209 mã lệnh.

Với lối suy nghĩ đơn giản là mọi dữ liệu xuất ra bên ngoài đều thông qua lệnh MOV (và họ hàng MOVB. MOVD), còn sau đó nó tính toán gì đi nữa thì cục dữ liệu vẫn nằm đó, nên ta đặt break point tại 3 mã lệnh máy ảo thực thi nó rồi liên tục xem thông tin debug trên memory tới vị trí đích nó cần move data tới.

Chú ý đoạn code sau:

Sau một hồi chạy ra debug có kết quả sau:

Copy nó lại, nó đã có thể là flag

F5 thêm chút nữa, dữ liệu tại địa chỉ này sẽ bị ghi đè lại và trở thành dữ liệu

29C3_this_is_no_flag!

như ta giải nén thấy bên trên.

Flag bài:

29C3_rarvm_is_awesome
