---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: BINARY ANALYSIS - NEXT CHAPTER OF THE GAME
date: 2014-07-01
tags: [security, ctf]
author: khoai
description: >
  Trò chơi phân tích mã bắt đầu từ những ngày đầu ngành điện tử – tin học xuất hiện, từ vụ tháo mạch điện, chọc mũi hàn của các bạn làm điện tử, rồi sau này là các trình disassembler xuất hiện cho mảng tin học hí hoáy. Kéo dài từ các trình disassembler sơ khai cho đến IDA thần thánh thông dụng hiện tại...
---

**Tiêu đề ?**

Người viết tính đặt tiêu đề là Phân tích mã: Chương tiếp theo của trò chơi, nhưng nghe gượng gượng nên cuối cùng người viết bài chọn tên này, 1 cái tên Tây cho một bài viết Tiếng Việt, một sự kết hợp không đẹp lắm :”>

**Mở**

Trò chơi phân tích mã bắt đầu từ những ngày đầu ngành điện tử – tin học xuất hiện, từ vụ tháo mạch điện, chọc mũi hàn của các bạn làm điện tử, rồi sau này là các trình disassembler xuất hiện cho mảng tin học hí hoáy. Kéo dài từ các trình disassembler sơ khai cho đến IDA thần thánh thông dụng hiện tại.

Việc đọc mã thuần với các disassembler là chưa đủ, người ta muốn theo dõi chương trình đó chạy ra sao, làm cái gì. Vậy là các trình debugger ra đời để đáp ứng nhu cầu đó. Các debugger thật tuyệt vời, nó làm đơn giản hóa việc hiểu 1 đoạn mã làm cái gì thay vì chỉ ngồi tưởng tượng. Các tool debugger tiêu biểu: **Ollydbg**, **gdb**, **Windbg** …

Nhưng việc ngồi mòn mông để ngồi dò từng dòng lệnh asm của 1 chương trình, nhất là với các chương trình lớn và mã rối rắm thì là cả một thảm họa. Phải có gì đó giúp tự động hóa, giúp cuộc  đời này tươi đẹp hơn, giúp người lười có nhiều thời gian để ăn ngủ hơn thay vì phải ngồi debug cả buổi.

Người ta chia việc phân tích mã thực thi (**binary analysis**) thành 2 mảng khác nhau như sau:

- **Phân tích tĩnh (Static code analysis)**: Ngồi nhìn một đoạn code đứng im ru, bạn cố tìm hiểu, khi làm việc nó sẽ làm cái gì, việc này khá giống với việc bạn nói chuyện với một cục đá -_-
- **Phân tích động (Dynamic program analysis)**: Thay vì chỉ ngồi nhìn ngắm dung nhan đoạn code, bạn có thể xem quá trình đoạn code đó làm việc, xem nó buồn vui thế nào, hiếu động ra sao… một nhánh của phương pháp này là phân tích hành vi

Tất nhiên mỗi phương pháp đều có thế mạnh, yếu riêng :

**Phân tích tĩnh**:
- Đảm bảo phân tích trọn vẹn code, do suy cho cùng thì mọi hành vi của chương trình đều nằm cả trên 1 cục binary đó mà thôi, tất nhiên điều này là rất khó
- Tốc độ nhanh
- Nhưng phương pháp này sẽ phải rất mệt với đám làm rối code (obfuscation), pack … thậm chí theo quan điểm cá nhân của người viết thì với 1 bộ làm rối đủ tốt thì phân tích tĩnh là bất lực.

**Phân tích động**
- Sẽ thấy được những điều mà phương pháp tĩnh không cho thấy được, như tụi pack chẳng hạn
- Tuy nhiên do giả lập lại quá trình thực thi nên bị gặp vấp phải các vấn đề như không khó có thể thực thi đến mọi ngóc ngách của chương trình, các trick để loop vô cùng, các trick nhận dạng bị debug …
- Tốc độ chậm hơn phân tích tĩnh

Trong quá khứ, việc phân tích mã tĩnh chiếm ưu thế, nhưng càng gần đây việc phân tích mã động ngày càng phát triển do:
- Máy tính ngày càng mạnh, công nghệ ảo hóa ngày càng tốt, đảm bảo tốc  độ cho việc này
- Tụi binary sau này ngày càng đông và hung hãn, chưa kể nhiều đứa còn rất khó hiểu nếu chỉ nhìn mặt chúng nó (phân tích tĩnh), thôi thì cứ thả cho nó chạy xem nó làm gì cho trực quan

Bài viết này, người viết sẽ nói về việc tự động hóa trong việc phân tích mã động. Bước đầu làm quen với vấn đề này.

**Nhập**

Có nhiều sự lựa chọn để phân tích động, các công cụ cho phép thực thi file binary, theo dõi quá trình thực thi chi tiết từng mã thực thi (asm), bạn có thể tưởng tượng đơn giản là bạn đang dùng một cái **Ollydbg**, nhưng khác cái là bạn sẽ làm việc đó tự động hóa (bằng code) thay vì ngồi gõ từng phím nóng để debug code.

Các công cụ tiêu biểu: **pin**, **Valgrind**, **DynamoRIO** … nhưng mình thích nhất **pin** đơn giản do tên nó dễ nhớ và nhiều sample.

[pin](https://software.intel.com/en-us/articles/pin-a-dynamic-binary-instrumentation-tool) là một công cụ mạnh mẽ của Intel để phân tích động, với kho đồ chơi có sẵn gọi là **pintools**, một kho đồ chơi cực kỳ giá trị và rộng lớn, tìm hiểu cho hết công năng của mớ đồ cũng không phải dễ dàng.

Mỗi tool của pin là được lưu dưới dạng một tập tin liên kết động (dynamic library), mỗi thư viện này sẽ làm việc mà bạn lập trình cho nó (dựa trên framework của pin). Khi chương trình thực thi, bạn sẽ cần chọn thư viện tương ứng và nó sẽ tương tác với chương trình bạn cần phân tích trong quá trình thực thi.

Chúng ta sẽ quan sát 2 ứng dụng của **pin**

**A. Binary [Side channel attack](http://en.wikipedia.org/wiki/Side_channel_attack)**

**1. Sơ lược**

“Tấn công qua kênh phụ không đòi hỏi bất cứ một sự xâm nhập trực tiếp nào vào thiết bị. Cụ thể là người tấn công sẽ tìm cách đo các tín hiệu như năng lượng tiêu thụ điện, cường độ của trường điện từ phát ra từ thiết bị. Sau đó các thông tin này sẽ được quan sát và xử lý để tìm ra thông tin bí mật.”

Nguồn: http://tudien.vntelecom.org/Side_Channel_Attack

**2. Phương pháp**

**a. Lab**

- Với đoạn code sau:

```
int main(int argc, char** argv) {
  printf("Enter key: ");
  char szKey[128] = {0};
  gets(szKey);
  if (strcmp(szKey, "ikju") == 0)
    printf("Correct !\n");
  else
    printf("Wrong !\n");
  return 0;
}
```

Không xét tới độ phức tạp để reverse, pack hay cái gì ở đây, chúng ta nhìn nhận đoạn code này trên quan điểm brute-force. Đoạn code không quá khó để brute-force.
Chúng ta đều biết **strcmp** sẽ so sánh từng ký tự từ trái qua phải đến hết, do vậy với mỗi ký tự đúng bên trái thì ứng dụng này sẽ thay đổi một số thao tác so với khi sai.
Viết một đoạn code nhỏ để **đếm số lệnh ứng dụng thi hành với từng input** (một ký tự ‘a’ -> ‘z’) ta có bảng số liệu sau:
![alt text](/assets/images/posts/2014-07-01/table.png)

Không quá khó để nhận ra sự khác biệt của ký tự **i**. Thao tác này nên lặp lại vài lần để kiểm tra việc focus vào ký tự đó theo một rule nào đó là đúng hay sai.

**b. Break game**

Trong thực tế áp dụng, đã áp dụng phương pháp này để giải quyết bài SimpleVM ( http://reversing.kr/challenge.php ), một script nhỏ và phân tích các thông số thủ công trong vòng nửa giờ cho ra key: id3*nxx (phần xx dấu đi để bạn tự thực nghiệm)

Submit và kết quả chính xác.

**3. Code**

Script viết trên [Python](http://www.python.org/) kết hợp với [PINTool](http://software.intel.com/en-us/articles/pin-a-dynamic-binary-instrumentation-tool) để thực thi SimpleVM tự động cùng với key brute-force, hiện trong mỗi bước tăng chiều dài key thực hiện thủ công (hardcode), phân tích rule bằng mắt (+ niềm tin) :”>

**icount.so** : là một thư viện nhỏ trong example code của pin, nó làm nhiệm vụ đếm số mã lệnh thực hiện của một chương trình.

```
import popen2, string

INFILE = "fx"
CMD  = "../../../pin -t obj-ia32/icount.so -- target/SimpleVM <" + INFILE

def execlCommand(command):
  fin, fout = popen2.popen2(command)
  #print ">", command
  result1 = fin.readline()
  print result1
  result2 = fin.readline()
  print result2
  fin.close()

choices = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789 ~!@#$%^&*()_+[]\{}|;':<>?/,."

def writeFile(data):
  f = open(INFILE, 'w')
  f.write(data)
  f.close()

for entry in range(0, len(choices)):
  #id3*
  key = 'i' choices[entry:entry+1]
  print ">", key
  writeFile(key)
  execlCommand(CMD)
```

**B. Nhúng scripting trong pin**

**1. Sơ lược**

Dù có thể code các dynamic library như ở ví dụ trên, tuy nhiên việc này tốn nhiều thời gian cho mỗi lần điều chỉnh code phân tích (code, compile, chạy lại …).
Phần này người viết giới thiệu một wrapper giúp đơn giản hóa việc này. Scripting nhúng ở đây là sử dụng ngôn ngữ Lua.
Link project: https://github.com/hexgolems/pint
Mục tiêu cụ thể trong phần này khi sử dụng **pint: Tìm kiếm tất cả string có thể in được (printable) trên bộ nhớ của chương trình khi thực thi**

Các ứng dụng :

- Một số bài CTF binary đơn giản dùng các hình thức so sánh input với flag để kiểm tra đúng sai, tất nhiên là chuỗi flag này thường được mã hóa cẩn thận. Nhưng khi so sánh thì nó cũng phải giải mã, sau đó thì đọc vùng memory đó để so sánh. Điển hình nhất là tụi dùng hàm strcmp, memcmp…
- Do mục tiêu code chỉ tìm string printable tại các address chương trình đọc đến, nên gần như toàn bộ string printable được chương trình đọc tới đều bị nhận dạng, nên các hàm compare string tự chế, hay printf, hay LoadLibrary, hay mọi API khác nếu có dùng string đều bị nhận dạng, việc này cũng giúp phân tích phân tích dễ dàng hơn các string đã obfuscate hay các dạng phân tích malware động. Nói kiểu này thì nghe rất hoành tráng, nhưng thực ra thì không có gì cả.

Nói nhiều vây thôi, chứ tóm lại code nó nằm tại đây (bạn nên custom tùy theo nhu cầu): https://github.com/hexgolems/pint/blob/master/tools/strings.lua

**2. Sử dụng**

**a. Lab**

```
#include "stdio.h"
void writeWrong() {
  printf("wrong\n");
}
void writeKey() {
  printf("right\n");
}
int checkKey(char* s) {
  char cipher[] = {0xC1, 0xCF, 0xD3, 0xF5, 0xCC, 0xC5, 0xDF, 0xC4, 0xCE, 0xF5, 0xC7, 0xCF, 0xF5, 0xDA, 0xC6, 0xD0, 0xF5, 0x90, 0xD2};
  char plain[128] = {0};
  int i = 0;
  for (i=0; i<sizeof(cipher); i++) {
    plain[i] = (char)(cipher[i] ^ 0xAA);
  }
  if (!strcmp(s, plain))
    return 1;
  return 0;
}
int main(int argc, char *argv[]) {
  char test[256] = {0};
  printf("do you see me ???\n");
  if (argc != 2) {
    printf("error\n");
    return -1;
  }
  if (checkKey(argv[1])) {
    writeKey();
    return 0;
  }
  writeWrong();
  return 0;
}
```

Compile  tại: ./hook/hit

Command thực thi:
`./pin/pin -injection child -t runner.so -s tools/strings.lua -- ./hook/hit test >out.log`

Ta có một file kết quả: out.log

Có một trong đó chứa vài dòng như sau:

```
-- at b77a9968 used LC_ADDRESS=vi_VN
-- at b77a9968 used SSH_AGENT_PID=1661
-- at b77a9968 used LC_MONETARY=vi_VN
-- at b77a9968 used GPG_AGENT_INFO=/run/user/khoai/keyring-yZfjCc/gpg:0:1
....
-- at b5bb3e20 used do you see me
-- at b5bb3e20 used do you see me ?
-- at b5bb3e20 used do you see me ??
-- at b779d8c9 used strcmp
-- at b779d8ec used str
-- at b779d8ec used strc
-- at b779d8ec used strcm
-- at b5c84188 used key_found_me_plz_:x
```

**b. Break game**

Chúng ta sẽ cùng ngâm cứu lại một bài viết cũ: http://blog.botbie.com/2012/12/31/29c3-ctf-misc-300-funchive/ , bằng hướng tiếp cận mới này.

Một command nhỏ:
`./pin/pin -injection child -t runner.so -s tools/strings.lua -- rar p funchive.rar >out.log`

Và chúng ta cùng xem log và có những dòng sau:
```
-- at 413d86 used 29C3_rarvm_is_awel
-- at 413d8b used 29C3_rarvm_is_awela
-- at 413d98 used 29C3_rarvm_is_awe
-- at 413d9e used 29C3_rarvm_is_awelag
-- at 41428d used
-- at 4142a0 used
-- at 413d86 used 29C3_rarvm_is_awesome
```

:D , quá nhẹ nhàng cho 1 bài CTF 300 điểm :3
