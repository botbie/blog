---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Bitcoin genesis block
date: 2016-06-16
tags: [bitcoin, bài dịch, cryptocurrency, blockchain]
author: jaken
description: >
  Trong bitcoin, genesis block hay khối nguyên thủy là block đầu tiên của chuỗi block. Các phiên bản mới của bitcoin đánh số 0 cho block này, những phiên bản cũ hơn thì đánh số 1. Khối nguyên thủy luôn được lưu cứng trong các phần mềm sử dụng bitcoin. Nó là block duy nhất không có block đi trước, và trong bitcoin cũng như một số đồng tiền tương tự, nó tạo ra một món tiền không dùng được.
---

Trong bitcoin, genesis block hay khối nguyên thủy là block đầu tiên của chuỗi block. Các phiên bản mới của bitcoin đánh số 0 cho block này, những phiên bản cũ hơn thì đánh số 1. Khối nguyên thủy luôn được lưu cứng trong các phần mềm sử dụng bitcoin. Nó là block duy nhất không có block đi trước, và trong bitcoin cũng như một số đồng tiền tương tự, nó tạo ra [một món tiền không dùng được](https://www.reddit.com/r/Bitcoin/comments/1nc13r/the_first_50btc_block_reward_cant_be_spend_why/).

### Khối nguyên thủy
Dưới đây là nội dung của khối nguyên thủy, và nó xuất hiên trong một comment của một phiên bản Bitcoin cũ (dòng 1613). Đoạn thứ nhất liệt kê tất cả các biến cần thiết để tái tạo lại block. Đoạn thứ hai của block được ghi dưới dạng ngắn, chứa một bản rút gọn của đoạn đầu.
```
GetHash()      = 0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
hashMerkleRoot = 0x4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b
txNew.vin[0].scriptSig     = 486604799 4 0x736B6E616220726F662074756F6C69616220646E6F63657320666F206B6E697262206E6F20726F6C6C65636E61684320393030322F6E614A2F33302073656D695420656854
txNew.vout[0].nValue       = 5000000000
txNew.vout[0].scriptPubKey = 0x5F1DF16B2B704C8A578D0BBAF74D385CDE12C11EE50455F3C438EF4C3FBCF649B6DE611FEAE06279A60939E028A8D65C10B73071A6F16719274855FEB0FD8A6704 OP_CHECKSIG
block.nVersion = 1
block.nTime    = 1231006505
block.nBits    = 0x1d00ffff
block.nNonce   = 2083236893

CBlock(hash=000000000019d6, ver=1, hashPrevBlock=00000000000000, hashMerkleRoot=4a5e1e, nTime=1231006505, nBits=1d00ffff, nNonce=2083236893, vtx=1)
  CTransaction(hash=4a5e1e, ver=1, vin.size=1, vout.size=1, nLockTime=0)
    CTxIn(COutPoint(000000, -1), coinbase 04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73)
    CTxOut(nValue=50.00000000, scriptPubKey=0x5F1DF16B2B704C8A578D0B)
  vMerkleTree: 4a5e1e
```
### Hash
Hash của khối nguyên thủy là 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f, dư hai số 0 so với yêu cầu của các khối đầu tiên.

### Coinbase
Tham số coinbase trong block chứa một [chuỗi như sau](http://web.archive.org/web/20140309004338/http://uk.reuters.com/article/2009/01/03/idUKPTIP32510920090103)
The Times 03/Jan/2009 Chancellor on brink of second bailout for banks

Đây là một bằng chứng về việc block đã được tạo ra ngày 3 tháng 1 năm 2009, cũng như một dự đoán về sự bất ổn của hệ thống ngân hàng. Ngoài ra, nó cũng gợi ý rằng Satoshi Nakamoto có thể đã sống ở nước Anh.

Bản gốc của tờ báo chứa tiêu đề này đã trởi thành một vật sưu tập, và chỉ có vài bản được tìm thấy.

50 đồng bit đầu tiên được trả cho địa chỉ 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa, tuy nhiên tiền này không thể dùng được do [cách xử lý khối nguyên thủy](https://github.com/bitcoin/bitcoin/blob/9546a977d354b2ec6cd8455538e68fe4ba343a44/src/main.cpp#L1668) của mã nguồn bitcoin. Và hiện nay không ai biết nó là chủ đích hay là mỗi lỗi của tác giả.

Tờ Times ngày 3 tháng 1 năm 2009:

![alt](https://en.bitcoin.it/w/images/en/1/1d/Jonny1000thetimes.png)

[Dữ liệu block dưới dạng hex](https://bitcointalk.org/index.php?topic=52706)
```
0000   01 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
0010   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
0020   00 00 00 00 3B A3 ED FD  7A 7B 12 B2 7A C7 2C 3E   ....;£íýz{.²zÇ,>
0030   67 76 8F 61 7F C8 1B C3  88 8A 51 32 3A 9F B8 AA   gv.a.È.ÃˆŠQ2:Ÿ¸ª
0040   4B 1E 5E 4A 29 AB 5F 49  FF FF 00 1D 1D AC 2B 7C   K.^J)«_Iÿÿ...¬+|
0050   01 01 00 00 00 01 00 00  00 00 00 00 00 00 00 00   ................
0060   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
0070   00 00 00 00 00 00 FF FF  FF FF 4D 04 FF FF 00 1D   ......ÿÿÿÿM.ÿÿ..
0080   01 04 45 54 68 65 20 54  69 6D 65 73 20 30 33 2F   ..EThe Times 03/
0090   4A 61 6E 2F 32 30 30 39  20 43 68 61 6E 63 65 6C   Jan/2009 Chancel
00A0   6C 6F 72 20 6F 6E 20 62  72 69 6E 6B 20 6F 66 20   lor on brink of 
00B0   73 65 63 6F 6E 64 20 62  61 69 6C 6F 75 74 20 66   second bailout f
00C0   6F 72 20 62 61 6E 6B 73  FF FF FF FF 01 00 F2 05   or banksÿÿÿÿ..ò.
00D0   2A 01 00 00 00 43 41 04  67 8A FD B0 FE 55 48 27   *....CA.gŠý°þUH'
00E0   19 67 F1 A6 71 30 B7 10  5C D6 A8 28 E0 39 09 A6   .gñ¦q0·.\Ö¨(à9.¦
00F0   79 62 E0 EA 1F 61 DE B6  49 F6 BC 3F 4C EF 38 C4   ybàê.aÞ¶Iö¼?Lï8Ä
0100   F3 55 04 E5 1E C1 12 DE  5C 38 4D F7 BA 0B 8D 57   óU.å.Á.Þ\8M÷º..W
0110   8A 4C 70 2B 6B F1 1D 5F  AC 00 00 00 00            ŠLp+kñ._¬....
```

Dữ liệu chia theo từng phần:
```
01000000 - version
0000000000000000000000000000000000000000000000000000000000000000 - prev block
3BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A - merkle root
29AB5F49 - timestamp
FFFF001D - bits
1DAC2B7C - nonce
01 - number of transactions
01000000 - version
01 - input
0000000000000000000000000000000000000000000000000000000000000000FFFFFFFF - prev output
4D - script length
04FFFF001D0104455468652054696D65732030332F4A616E2F32303039204368616E63656C6C6F72206F6E206272696E6B206F66207365636F6E64206261696C6F757420666F722062616E6B73 - scriptsig
FFFFFFFF - sequence
01 - outputs
00F2052A01000000 - 50 BTC
43 - pk_script length
4104678AFDB0FE5548271967F1A67130B7105CD6A828E03909A67962E0EA1F61DEB649F6BC3F4CEF38C4F35504E51EC112DE5C384DF7BA0B8D578A4C702B6BF11D5FAC - pk_script
00000000 - lock time
```
Bạn có thể dùng [block explorer](https://blockexplorer.com/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f) hoặc [blockchain.info](https://blockchain.info/block/00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048) để xem khối nguyên thủy như những khối khác.

Dịch từ https://en.bitcoin.it/wiki/Genesis_block