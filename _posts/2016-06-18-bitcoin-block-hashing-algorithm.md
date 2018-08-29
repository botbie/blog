---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Block hashing algorithm - thuật toán băm khối
date: 2016-06-18
tags: [bitcoin,cryptography,cryptocurrency,hash,bài dịch]
author: jaken
description: >
  Quá trình đào bitcoin sử dụng thuật toán hashcash để tạo hash 'proof of work' https://en.bitcoin.it/wiki/Proof_of_work (bằng chứng về công việc)
---

Quá trình đào bitcoin sử dụng thuật toán hashcash để tạo hash ['proof of work'](https://en.bitcoin.it/wiki/Proof_of_work) (bằng chứng về công việc). Thuật toán hashcash yêu cầu những đối số sau: một chuỗi, một số nonce, và một biến đếm. Trong bitcoin chuỗi được mã hóa trong phần đầu cấu trúc dữ liệu của khối, bao gồm phiên bản, hash của khối trước đó, hash gốc của cây Merkle chứa tất cả các giao dịch trong khối, thời gian hiện tại, và độ khó. Bitcoin lưu trữ một số nonce khac trong trường extraNone, là một phần của giao dịch coinbase, nằm ở node lá trái nhất của cây Merkle (giao dịch coinbase là giao dịch đầu trong khối). Biến đếm Nonce khoảng 32 bit nên mỗi lần biến tràn, trường extraNonce phải tăng (hoặc thay đổi) để việc tính toán hash không bị lặp. Những khái niệm quanh thuật toán hashcash khá đơn giản, dễ hiểu và được trình bay chi tiết hơn [ở đây](https://web.archive.org/web/20170117040618/https://en.bitcoin.it/wiki/Hashcash). Khi đào bitcoin, thuật toán hashcash liên tục hash header của khối khi tăng dần biến đếm và trường nonce. Tăng trường extraNonce làm thay đổi nội dung giao dịch coinbase, dẫn đến thay đổi hash của cây merkle. Đôi khi block cũng thay đổi khi đang làm việc với nó (thêm transaction hoặc thay đổi timestamp).

### Block header chứa những trường sau

**Field**|**Purpose**|**Updated when...**|**Size (Bytes)**
:-----:|:-----:|:-----:|:-----:
Version|Block version number|You upgrade the software and it specifies a new version|4
hashPrevBlock|256-bit hash of the previous block header|A new block comes in|32
hashMerkleRoot|256-bit hash based on all of the transactions in the block|A transaction is accepted|32
Time|Current timestamp as seconds since 1970-01-01T00:00 UTC|Every few seconds|4
Bits|Current target in compact format|The difficulty is adjusted|4
Nonce|32-bit number (starts at 0)|A hash is tried (increments)|4

Phần thân của block chứa các giao dịch. Chúng được hash gián tiếp thông qua cây Merkle. Vì các giao dịch không được hash trực tiếp, việc hash một block với 1 giao dịch và một block chứa 10000 giao dịch tốn chi phí ngang nhau.
Định dạng gọn gàng trên là một biến thể của số chấm động dùng 3 byte [mantissa](https://en.wikipedia.org/wiki/Significand) (5 bytes thấp nhất dùng làm số mũ, cơ số 256). Hầu hết những trường trên giống nhau với tất cả thợ mỏ. Sẽ có vài khác biệt nhỏ về timestamp. Biến nonce luôn luôn khác, nhưng nó tăng dần chặt chẽ theo hàm tuyến tính. "Nonce" bắt đầu là 0 và tăng dần mỗi hash. Khi Nonce tràn (thường sẽ tràn), trường extraNonce của giao dịch tạo tiền tăng lên, và cây Merle thay đổi.

Hơn nữa, hai thợ mỏ không thể có cùng hash merkle, bởi vì transaction đầu tiên trong block là tạo ra tiền trong địa chỉ của thợ mỏ. Vì vậy mà block của mỗi thợ mỏ đều khác nhau. Nên các thợ mỏ sẽ sinh ra được các chuỗi hash khác nhau. Mọi hash mà bạn tính được có cơ hội tương đương với mọi người khác trên mạng bitcoin.

Bitcoin sử dụng hàm hash dạng SHA256(SHA256(Block_Header)), nhưng bạn nên cẩn thận về thứ tự byte.

Ví dụ, đoạn mã python này sẽ tính hash của một block có hash nhỏ nhất vào tháng sáu 2011, [Block 125552](http://blockexplorer.com/block/00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d). Header gồm sáu field dưới đây nối lại với nhau:
```
>>> import hashlib
>>> header_hex = ("01000000" +
 "81cd02ab7e569e8bcd9317e2fe99f2de44d49ab2b8851ba4a308000000000000" +
 "e320b6c2fffc8d750423db8b1eb942ae710e951ed797f7affc8892b0f1fc122b" +
 "c7f5d74d" +
 "f2b9441a" +
 "42a14695")
>>> header_bin = header_hex.decode('hex')
>>> hash = hashlib.sha256(hashlib.sha256(header_bin).digest()).digest()
>>> hash.encode('hex_codec')
'1dbd981fe6985776b644b173a4d0385ddc1aa2a829688d1e0000000000000000'
>>> hash[::-1].encode('hex_codec')
'00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d'
```
### Endianess
Chú ý rằng hash, là một số 256 bit, các bytes zero ở đầu chuỗi khi lưu trữ hoặc in dạng big-endian, nhưng nếu lưu ở dạng little-endian, những byte đó thành các byte cuối. Ví dụ, nếu chuyển một chuỗi thành hex, nếu các byte thấp nhất (byte bắt đầu) vẫn là bytes thấp nhất, nó là [little-endian](http://www.goldparser.org/doc/about/images/diagram-little-vs-big-endian.gif).

blockexplorer hiển thị hash dạng big-edian thường gặp: thứ tự các byte tính từ trái sang phải.

Trong một ví dụ khác , đây là một [phiên bản viết bằng C](http://pastebin.com/bW3fQA2a), không có tối ưu, đa luồng hay kiểm lỗi.

Dưới đây là một đoạn code tương tự nhưng viết bằng PHP
```
<?
  //This reverses and then swaps every other char
  function SwapOrder($in){
      $Split = str_split(strrev($in));
      $x='';
      for ($i = 0; $i < count($Split); $i+=2) {
          $x .= $Split[$i+1].$Split[$i];
      } 
      return $x;
  }
 
  //makes the littleEndian
  function littleEndian($value){
      return implode (unpack('H*',pack("V*",$value)));
  }
 
  $version = littleEndian(1);
  $prevBlockHash = SwapOrder('00000000000008a3a41b85b8b29ad444def299fee21793cd8b9e567eab02cd81');
  $rootHash = SwapOrder('2b12fcf1b09288fcaff797d71e950e71ae42b91e8bdb2304758dfcffc2b620e3');
  $time = littleEndian(1305998791);
  $bits = littleEndian(440711666); 
  $nonce = littleEndian(2504433986); 
 
  //concat it all
  $header_hex = $version . $prevBlockHash . $rootHash . $time . $bits . $nonce;
 
  //convert from hex to binary 
  $header_bin  = hex2bin($header_hex);
  //hash it then convert from hex to binary 
  $pass1 = hex2bin(  hash('sha256', $header_bin )  );
  //Hash it for the seconded time
  $pass2 = hash('sha256', $pass1);
  //fix the order
  $FinalHash = SwapOrder($pass2);
 
  echo   $FinalHash;
?>
```
Dịch từ https://en.bitcoin.it/wiki/Block_hashing_algorithm