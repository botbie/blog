---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Bitcoin mining
date: 2016-06-14
tags: [bitcoin, bài dịch, cryptocurrency, blockchain]
author: jaken
description: >
  Mining (đào mỏ) trong bitcoin là quá trình thêm các bản ghi giao dịch vào sổ ghi nợ công cộng bitcoin. Sổ ghi nợ này gọi là block chain, gồm một chuỗi các block. Block chain cho phép xác thực các giao dịch đã được thực hiện trong mạng bitcoin, các node bitcoin sử dụng nó để nhận ra các giao dịch hợp lệ, từ chối các giao dịch không hợp lệ như gửi một coin hai hoặc nhiều lần.
---

Mining (đào mỏ) trong bitcoin là quá trình thêm các bản ghi giao dịch vào sổ ghi nợ công cộng bitcoin. Sổ ghi nợ này gọi là block chain, gồm một chuỗi các block. Block chain cho phép xác thực các giao dịch đã được thực hiện trong mạng bitcoin, các node bitcoin sử dụng nó để nhận ra các giao dịch hợp lệ, từ chối các giao dịch không hợp lệ như gửi một coin hai hoặc nhiều lần.

Qúa trình Mining được thiết kế khó và tốn tài nguyên, với mục đích đảm bảo một số lượng ổn định block được tạo ra mỗi ngày. Mỗi block phải có một "bằng chứng công việc" để có thể được xem là hợp lệ. Bằng chứng này được kiểm tra bởi các bitcoin node khi nhận được block, và được tạo ra theo thuật toán hashcash.

Mục đích chính của mining là cho phép các bitcoin node có thể tìm ra một cách đồng bộ dữ liệu an toàn, chống giả mạo. Mining cũng là cách phát hành bitcoin: Các thợ mỏ được trả phí cho các giao dịch và được nhận coin mới như là một phần thưởng. Điều này cho phép phát hành tiền phi tập trung và thúc đẩy người dùng hỗ trợ bảo mật hệ thống.

Và như vậy ta thấy việc tạo ra bitcoin cũng giống như việc đào vàng: nó đòi hỏi công sức, tạo ra tiền tệ từ từ với một tốc độ tương tự với tốc độ mà vàng và các loại mỏ khác được đào từ lòng đất.

#### Độ khó
##### Vấn đề tính toán khó

Đào một block thì khó bởi vì hash SHA-256 của block cần phải nhỏ hơn hoặc bằng mục tiêu cho trước để block đó có thể được mạng bitcoin thừa nhận. Nói một cách đơn giản: hash phải bắt đầu với một dãy số 0 có độ dài cho trước. Xác xuất để tính được một hash bắt đầu với những số 0 là rất thấp, vì vậy phải thử lại nhiều lần. Để sinh ra một hash khác, số nonce trong block được tăng lên.

##### Tính độ khó
Độ khó được tính dựa trên mức độ khó khăn mà các thợ mỏ gặp phải khi tạo block mới. Mỗi 2016 block nó được tính lại: toàn bộ số block này có phải được tính trong vòng 2 tuần? Nếu việc tính toán của các thợ mỏ nhanh hơn, độ khó được tăng lên để đảm bảo ổn định tốc độ sinh block (trung bình 10 phút một block). Và như vậy khi càng nhiều thợ mỏ tham gia, tốc độ block sinh nhanh hơn, độ khó sẽ tăng lên để kìm tốc độ đó lại. Các block được những thợ mỏ xấu tính đưa ra, không đạt chỉ tiêu về độ khó sẽ bị mạng bitcoin từ chối sử dụng.

##### Phần thưởng
Khi một block được giải quyết, thợ mỏ được thưởng một số bitcoin vào địa chỉ anh ta đã thêm vào block, con số này ban đầu là 50 BTC, và giảm còn một nữa mỗi 210000 block, hiện tại thì số reward đó là 25 bitcoin.

Ngoài ra, thợ mỏ cũng được hưởng phần phí người giao dịch đồng ý chi. Mức phí này tạo động lực cho thợ mỏ thêm giao dịch vào block. Trong tương lai, khi số lượng bitcoind dược phát hành hết, phí giao dịch sẽ là phần thu nhập chính của các thợ mỏ bitcoin.

#### Hệ thống đào bitcoin
##### Phần cứng
Các thợ mỏ dùng nhiều loại phần cứng khác nhau cho việc đào các block. Thông số kỹ thuật cũng như hiệu suất của chúng có thể đọc ở đây

##### CPU
Những máy đào bitcoin đầu tiên dùng CPU để xử lý. Tuy nhiên sự ra đời của các máy đào GPU với tốc độ cao và tiêu tốn năng lượng thấp đã làm cho các phần mềm mining dùng CPU trở nên càng lúc càng hiếm thấy.

##### GPU
GPU mining nhanh và hiệu quả hơn hẳn khi so sánh với CPU, một số hệ thống nhiều GPU đã được tạo ra để phục vụ mining

##### FPGA
FPGA là một cách nhanh và hiệu quả, vượt trội so với CPU, và tương đương với GPU. Hơn nữa FPGA thường tốn năng lượng rất thấp, điều này làm cho nó khả thi và hiệu quả hơn GPU.

##### ASIC
ASIC là viết tắt của An application-specific integrated circuit (mạch tích hợp chuyên dụng), là một mạch được thiết kế cho một mục đích cụ thể. Các mạch ASIC thiết kế riêng cho việc đào bitcoin được phát hành vào năm 2013. NÓ là thiết bị phần cứng hiệu quả và tiết kiệm năng lượng nhất cho việc đào bitcoin hiện tại.

##### Dịch vụ mining (cloud mining)
Trong bitcoin cũng có các nhà thầu cho thuê sức tính toán tính cho các thợ mỏ khác. Mining as a service ...

##### Mining Pool
Khi càng lúc càng nhiều thợ mỏ cạnh tranh nhau một số lượng nhỏ các block, người ta nhận ra rằng họ phải làm việc hàng tháng mà không giải được block nào. Điều này làm cho việc đào bitcoin giống như là một trò cờ bạc. Để có một thu nhập ổn định hơn, các thợ mỏ kết nối với nhau thành pool, cùng nhau đào và chia sẻ phần thưởng.

#### Lịch sử
Sổ ghi nợ bitcoin (block chain) được [Satoshi Nakamoto](https://en.bitcoin.it/wiki/Satoshi_Nakamoto) khởi tạo vào khoảng 18:15 UTC ngày 3 tháng 1 năm 2009. Block đầu tiên, hay khối nguyên thủy chứa một giao dịch duy nhất là chi cho người tạo nó 50 bitcoin mới.

Dịch từ https://en.bitcoin.it/wiki/Mining