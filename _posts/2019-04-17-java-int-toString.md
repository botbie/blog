---
layout: post
cover: 'assets/images/covers/cover3.jpg'
title: Java integer to String
date: 2019-04-17
tags: [Java, String]
author: jaken
description: >
  Làm thế nào chuyển một số thành chuỗi.
---

## 1. Bên trong Integer.toString(int)

cú pháp: 
```
public static String toString(int i)
```

Ví dụ:
```
    int a = 123456; 
    String str_a = Integer.toString(a); 
    System.out.println("String str_a = " + str_a); 
    // Output: String str_a = 123456
```

Sử dụng thật đơn giản phải ko nào, nhưng bên trong thì nó implement như thế nào nhỉ?

[Source của GNU Classpath](http://developer.classpath.org/doc/java/lang/Integer-source.html) khá đơn giản, nó sử dụng hàm String.valueOf(int) vì hàm này có sẵn trong libgcj và là hàm native nhanh :3
```
 221:   public static String toString(int i)
 222:   {
 223:     // This is tricky: in libgcj, String.valueOf(int) is a fast native
 224:     // implementation.  In Classpath it just calls back to
 225:     // Integer.toString(int, int).
 226:     return String.valueOf(i);
 227:   }
```
Hàm này được implement native thế nào, hãy để lại cho phần dưới và xem các lib khác toString(int) như thế nào đã. Xem qua [OpenJDK 8](http://hg.openjdk.java.net/jdk8/jdk8/jdk/file/687fd7c7986d/src/share/classes/java/lang/Integer.java) hàm toString dài hơn ta tưởng:

```
     * Returns a {@code String} object representing the
     * specified integer. The argument is converted to signed decimal
     * representation and returned as a string, exactly as if the
     * argument and radix 10 were given as arguments to the {@link
     * #toString(int, int)} method.
     *
     * @param   i   an integer to be converted.
     * @return  a string representation of the argument in base&nbsp;10.
     */
    public static String toString(int i) {
        if (i == Integer.MIN_VALUE)
            return "-2147483648";
        int size = (i < 0) ? stringSize(-i) + 1 : stringSize(i);
        char[] buf = new char[size];
        getChars(i, size, buf);
        return new String(buf, true);
    }
```
Với Integer.MIN_VALUE, vì -Integer.MIN_VALUE = Integer.MIN_VALUE, case đặc biệt này được fix cứng luôn, các số khác được tính từng ký tự và đổ vào một mảng char[] có kích thước tính theo hàm [stringSize](http://hg.openjdk.java.net/jdk8/jdk8/jdk/file/687fd7c7986d/src/share/classes/java/lang/Integer.java#l471):
```
    final static int [] sizeTable = { 9, 99, 999, 9999, 99999, 999999, 9999999,
                                      99999999, 999999999, Integer.MAX_VALUE };
    // Requires positive x
    static int stringSize(int x) {
        for (int i=0; ; i++)
            if (x <= sizeTable[i])
                return i+1;
    }
```
Để tăng tốc việc tính độ dài của chuỗi số, hàm không sử dụng phép chia cho 10 mà chỉ sử dụng toán tử + kèm so sánh với một bảng sizeTable có sẵn các kích thước của chuối số.

Xem tiếp hàm getChars nào :3
```
/**
     * Places characters representing the integer i into the
     * character array buf. The characters are placed into
     * the buffer backwards starting with the least significant
     * digit at the specified index (exclusive), and working
     * backwards from there.
     *
     * Will fail if i == Integer.MIN_VALUE
     */
    static void getChars(int i, int index, char[] buf) {
        int q, r;
        int charPos = index;
        char sign = 0;

        if (i < 0) {
            sign = '-';
            i = -i;
        }

        // Generate two digits per iteration
        while (i >= 65536) {
            q = i / 100;
        // really: r = i - (q * 100);
            r = i - ((q << 6) + (q << 5) + (q << 2));
            i = q;
            buf [--charPos] = DigitOnes[r];
            buf [--charPos] = DigitTens[r];
        }

        // Fall thru to fast mode for smaller numbers
        // assert(i <= 65536, i);
        for (;;) {
            q = (i * 52429) >>> (16+3);
            r = i - ((q << 3) + (q << 1));  // r = i-(q*10) ...
            buf [--charPos] = digits [r];
            i = q;
            if (i == 0) break;
        }
        if (sign != 0) {
            buf [--charPos] = sign;
        }
    }
```

Ở đây có vài trick được đưa vào để tăng tốc xử lý: khi số lớn hơn 65536, mỗi vòng lặp sinh ra 2 ký tự thay vì 1 (tại sao lại là 2 mà ko phải 3-4) với hai bảng [DigitOnes](http://hg.openjdk.java.net/jdk8/jdk8/jdk/file/687fd7c7986d/src/share/classes/java/lang/Integer.java#l355) và [DigitTens](http://hg.openjdk.java.net/jdk8/jdk8/jdk/file/687fd7c7986d/src/share/classes/java/lang/Integer.java#l342) cache sẵn giá trị. Ta thấy một trick khác là để tính phần dư, tác giả ko sử dụng phép modulo mà đi qua hai bước: thực hiện phép chia lấy kq q, trừ số gốc cho q x 100, thêm 1 trick khác để tăng tốc phép nhân cho 100 mà ko sử dụng toán tử nhân: dùng tổng của 3 phép dịch bit (100 = 2^6 + 2^5 + 2^2).

Với các số <= 65536, tác giả xử lý từng ký tự một, và sử dụng vài trick tăng tốc bao gồm:

Phép chia 10 được đổi thành tích với 52429 (số gần nhất với 2^19) và phép dịch logic 19 bit: 

```
q = (i * 52429) >>> (16+3);
```

(có lý do gì đặt 16 + 3 ở đây mà ko đặt 19 ko nhỉ, mình đoán là việc này sẽ tạo ra 2 phép dịch bit, dịch 16 sau đó dịch 3, sau đó compiler sẽ optimize tùy theo bộ xử lý sử dụng thanh ghi 16 hay 32 bit)
Phép nhân 52429 cũng có thể được đổi thành 3 lần cộng và dịch bit, nhưng có thể nó không nhanh hơn nên vẫn nhân bình thường.

Phép nhân 10 được đổi thành tổng 2 phép dịch bit 
```
(q << 3) + (q << 1)
```

Tới đây đã hết phần thuật toán + trick phức tạp trong việc tạo chuỗi, ta đã có một mảng char chứa từng ký tự của chuối số, tạo một String từ mảng đó là xong. 

## 2. Sử dụng String.valueOf(int)

Open JDK sử dụng hàm Integer.toString để implement [String.valueOf](http://hg.openjdk.java.net/jdk7u/jdk7u6/jdk/file/8c2c5d63a17e/src/share/classes/java/lang/String.java#l2958), không có gì để nói thêm, hãy xem thử hàm [String.valueOf của libgcj](https://gnu.googlesource.com/gcc/+/gcc-5_3_0-release/libjava/java/lang/String.java#1261):

```
  /**
   * Returns a String representing an integer.
   *
   * @param i the integer
   * @return String containing the integer in base 10
   * @see Integer#toString(int)
   */
  public static native String valueOf(int i);
```

Nó là [hàm native](https://gnu.googlesource.com/gcc/+/gcc-5_3_0-release/libjava/Makefile.in#376) được implement trong [natString.cc](https://gnu.googlesource.com/gcc/+/gcc-5_3_0-release/libjava/java/lang/natString.cc#401) của lib java gcc, thuật toán đơn giản dễ hiểu:

```
/* Put printed (decimal) representation of NUM in a buffer.
   BUFEND marks the end of the buffer, which must be at least 11 jchars long.
   Returns the COUNT of jchars written.  The result is in
   (BUFEND - COUNT) (inclusive) upto (BUFEND) (exclusive). */
jint
_Jv_FormatInt (jchar* bufend, jint num)
{
  register jchar* ptr = bufend;
  jboolean isNeg;
  if (num < 0)
    {
      isNeg = true;
      if (num != (jint) -2147483648U)
	num = -(num);
      else
	{
	  // Handle special case of MIN_VALUE.
	  *--ptr = '8';
	  num = 214748364;
	}
      }
    else
      isNeg = false;
    do
      {
        *--ptr = (jchar) ((int) '0' + (num % 10));
        num /= 10;
      }
    while (num > 0);
    if (isNeg)
      *--ptr = '-';
    return bufend - ptr;
}
jstring
java::lang::String::valueOf (jint num)
{
  // Use an array large enough for "-2147483648"; i.e. 11 chars.
  jchar buffer[11];
  int i = _Jv_FormatInt (buffer+11, num);
  return _Jv_NewString (buffer+11-i, i);
}
```

## Refs:

http://openjdk.java.net/

http://www.gnu.org/software/classpath/

http://www.docjar.com/