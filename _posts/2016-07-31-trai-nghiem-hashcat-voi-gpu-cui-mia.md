---
layout: post
cover: 'assets/images/covers/cover4.jpg'
subclass: 'post tag-test tag-content'
title: Trải nghiệm hashcat với GPU cùi mía
date: 2016-07-31
tags: [gpu, hashcat]
author: nguquen
---

Số là mình vừa kiếm được một con card đồ họa cũ, GeForce 210:

> CUDA Cores: 16
> Graphics Clock (MHz): 589MHz
> Processor Clock (MHz): 1402MHz
> Graphics Performance: low-580

Với những card đồ họa hiện nay số lượng core đã lên tới cả ngàn thì specs này khá là khiêm tốn tương xứng với một món đồ cũ kỹ và giá rẻ ^^, 16 CUDA core chỉ bằng 8 * 2 = 2 MCU,  con CPU i7 của mình cũng đã = 8MCU rồi. Nhưng cũng không sao cả, với mục đích "trải nghiệm" thì như thế là đủ.

Nói về hashcat thì đó là một tool để crack password khá nổi tiếng, trước đây nó có 2 phiên bản:
- Hashcat: phiên bản sử dụng CPU
- oclHashcat/cudaHashcat: phiên bản sử dụng GPU (OpenCL hoặc CUDA)

Nhưng từ phiên bản 3.0, hashcat đã gộp chung hai phiên bản này làm một dưới cái tên thống nhất là hashcat :cat: . Tải về dùng thử thôi:
```
$ wget http://hashcat.net/files/hashcat-3.00.7z
$ 7zr x hashcat-3.00.7z
```
Chạy chế độ benchmark:
```
$ cd hashcat-3.00
$ ./hashcat64.bin -b
hashcat (v3.00-1-g67a8d97) starting in benchmark-mode...

OpenCL Platform #1: NVIDIA Corporation
======================================
- Device #1: WARNING: Device local mem size is too small
- Device #1: GeForce 210, skipped

OpenCL Platform #2: Intel(R) Corporation
========================================
- Device #2: Intel(R) Core(TM) i7-4790 CPU @ 3.60GHz, skipped



ERROR: No devices found/left

```
Mặc định hashcat sẽ sử dụng GPU để chạy, với lỗi này có thể hiểu là con card đồ họa này quá cùi nên hashcat không thèm dùng :cold_sweat: . Search thử thì thấy giang hồ bảo có thể dùng version cũ hơn cho GeForce 210, mình tải thử bản cuda 2.01:
```
$ wget https://hashcat.net/files_legacy/cudaHashcat-2.01.7z
$ 7zr x cudaHashcat-2.01.7z
```
Chạy thử nào:
```
$ cd cudaHashcat-2.01
$ ./cudaHashcat64.bin -b
cudaHashcat v2.01 starting in benchmark-mode...

Device #1: GeForce 210, 1023MB, 1230Mhz, 2MCU



ERROR: Shader Model 1.0 - 1.3 based GPU detected. Support for CUDA was dropped by NVidia.



       Remove it from your system or use -d and select only supported cards.
```
Không khá hơn mấy, dùng hàng cũ nó khổ thế đấy :dizzy_face: . Lại tìm kiếm thông tin trên mạng thì giang hồ bảo bản 1.31 có thể chạy tốt, lại thử xem sao:
```
$ wget https://hashcat.net/files_legacy/cudaHashcat-1.31.7z
$ 7zr x cudaHashcat-1.31.7z
```
Chạy thử lần nữa nào:
```
$ cd cudaHashcat-1.31
$ ./cudaHashcat64.bin -b
ERROR: This copy of cudaHashcat is outdated. Get a more recent version.
```
wtf? Lại tìm hiểu tiếp thì được biết bên trong hashcat có một thứ gọi là timebomb, khi chạy nó sẽ kiểm tra time hệ thống, nếu quá hạn sẽ không cho dùng nữa. OK thôi, cài sẵn IDA bữa giờ mà không dùng, cũng nên mang ra thử :angry:

Disassembly cudaHashcat-1.31, dễ dàng tìm thấy đoạn code sau:
```
.text:0000000000409A22                 lea     rdi, [rbp+timer] ; timer
.text:0000000000409A29                 call    _time
.text:0000000000409A2E                 mov     rax, qword ptr [rbp+timer]
.text:0000000000409A35                 lea     rdi, [rbp+timer] ; timer
.text:0000000000409A3C                 mov     cs:timer, rax
.text:0000000000409A43                 call    _localtime
.text:0000000000409A48                 cmp     dword ptr [rax+14h], 73h
.text:0000000000409A4C                 jg      loc_40A929
```
Có thể hiểu đơn giản là chương trình sẽ gọi hàm `localtime`, và kiểm tra số năm, nếu lớn hơn  2015 (1900 + 73h) thì sẽ báo lỗi. Patch ngay lệnh `jg` là có thể sử dụng chương trình được:

![patch](https://i.gyazo.com/39bc479a790662e2a8ec0b3f9e559dd4.png)

Lúc đó chương trình sẽ như sau:
```
.text:0000000000409A22                 lea     rdi, [rbp+timer] ; timer
.text:0000000000409A29                 call    _time
.text:0000000000409A2E                 mov     rax, qword ptr [rbp+timer]
.text:0000000000409A35                 lea     rdi, [rbp+timer] ; timer
.text:0000000000409A3C                 mov     cs:timer, rax
.text:0000000000409A43                 call    _localtime
.text:0000000000409A48                 cmp     dword ptr [rax+14h], 73h
.text:0000000000409A4C                 nop
.text:0000000000409A4D                 nop
.text:0000000000409A4E                 nop
.text:0000000000409A4F                 nop
.text:0000000000409A50                 nop
.text:0000000000409A51                 nop
.text:0000000000409A52                 xor     esi, esi
```

OK, lưu chương trình vừa patch lại và chạy thử:
```
$ ./cudaHashcat64.bin -b
cudaHashcat v1.31 starting in benchmark-mode...

Device #1: GeForce 210, 1023MB, 1230Mhz, 2MCU

WARNING: sm_12 based GPU detected. Treating them as sm_11
Hashtype: MD4
Workload: 1024 loops, 256 accel

Speed.GPU.#1.: 85782.8 kH/s
....
```

Có thể thấy là mặc dù đã sử dụng được hashcat với GPU GeForce 210, nhưng speed của nó vẫn không bằng CPU i7. Đây là benchmark khi chạy hashcat 3.0 chọn option chỉ dùng CPU:
```
$ ./hashcat64.bin -b -D 1
hashcat (v3.00-1-g67a8d97) starting in benchmark-mode...

OpenCL Platform #1: NVIDIA Corporation
======================================
- Device #1: WARNING: Device local mem size is too small
- Device #1: GeForce 210, skipped

OpenCL Platform #2: Intel(R) Corporation
========================================
- Device #2: Intel(R) Core(TM) i7-4790 CPU @ 3.60GHz, 3988/15953 MB allocatable, 8MCU

Hashtype: MD4

Speed.Dev.#2.:  1016.1 MH/s (96.05ms)
```

Tất nhiên bài viết này chỉ mang ý nghĩa trải nghiệm, nếu bạn có ý định tận dụng sức mạnh của GPU để crack password, hãy đầu tư một con card đồ họa khủng hơn ^^.

~ Hết ~
