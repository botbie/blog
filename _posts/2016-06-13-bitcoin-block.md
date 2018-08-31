---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Bitcoin block
date: 2016-06-13
tags: [bitcoin, bài dịch, cryptocurrency, blockchain]
author: jaken
description: >
  Dữ liệu giao dịch bitcoin được lưu trữ trên các tập tin gọi là block. Bạn có thể tưởng tượng mỗi block giống như là một trang trong cuốn sổ ghi nợ, với mỗi dòng ghi lại số lượng tiền một người đã mượn/ trả. Các block được sắp xếp thành một chuỗi theo thời gian ( block chain). Các giao dịch mới được các bitcoin miner sắp xếp vào các block mới, được đặt vào cuối chuỗi và không thể bị thay đổi hoặc xóa khi nó đã được mạng bitcoin thừa nhận (tuy nhiên một số phần mềm bỏ qua các block rác - block không có hiệu lực).
---

Dữ liệu giao dịch bitcoin được lưu trữ trên các tập tin gọi là block. Bạn có thể tưởng tượng mỗi block giống như là một trang trong cuốn sổ ghi nợ, với mỗi dòng ghi lại số lượng tiền một người đã mượn/ trả. Các block được sắp xếp thành một chuỗi theo thời gian ( block chain). Các giao dịch mới được các bitcoin miner sắp xếp vào các block mới, được đặt vào cuối chuỗi và không thể bị thay đổi hoặc xóa khi nó đã được mạng bitcoin thừa nhận (tuy nhiên một số phần mềm bỏ qua các block rác - block không có hiệu lực).

#### Cấu trúc một block
````
4 bytes đầu: magic number 0xD9B4BEF9
4 bytes kế: số byte trong block
80 bytes kế: Blockheader
1-9 bytes kế: transaction counter
Danh sách các transactions
```
#### Mô tả

Mỗi block là một bản ghi của một vài hoặc tất cả các giao dịch gần nhất, và một tham chiếu tới block trước nó. Nó cũng chứa một đáp án cho "bài toán đố khó giải", đáp án này khác nhau với mỗi block. Các block mới không thể được gửi tới mạng bitcoin mà không có đáp án này, quá trình "đào bitcoin" là cuộc thi giữa các thợ mỏ để "giải" block hiện tại, tìm ra câu trả lời sớm nhất. Bài toán trong mỗi block đặc biệt khó, nhưng khi một đáp án đúng được tìm thấy, việc kiểm tra tính đúng đắn của đáp án này lại rất dễ. Mỗi block có thể có vài đáp án đúng khác nhau, nhưng chỉ cần tìm được một đáp án để giải bài toán.

Vì có một phần thưởng: các bitcoin mới sẽ được phát hành như phần quà cho việc giải đố các block, mỗi block cũng chứa một record ghi địa chỉ bitcoin hoặc script nhận phần quà. Record này được gọi là generation transaction hoặc coinbase transaction, và luôn là giao dịch đầu của các block. Số bitcoin phát hành trong một block ban đầu là 50 và giảm còn một nữa mỗi 210000 block (khoảng bốn năm).

Các giao dịch bitcoin được người gửi công bố trên toàn hệ thống, và tất cả các máy đào trong mạng sẽ nhận, thêm nó vào block đang làm việc. Các thợ mỏ được khuyến khích thêm các transaction vào block bằng mức phí đính kèm giao dịch.

Độ khó của bài toán được thay đổi tự động bởi hệ thống bitcoin, ví dụ hệ thống đặt một mục tiêu là giải 6 block mỗi giờ, sau 2016 blocks (giải trong khoảng hai tuần), tất cả các máy bitcoin so sánh số block thực sự giải được với con số giả định ban đầu. Dựa vào đó, mạng bitcoin có thể đưa ra quyết định tăng hoặc giảm độ khó của các block sinh ra.

Vì mỗi block có chứa một tham chiếu tới block trước, tất cả các block kết nối với nhau thành một xâu chuỗi. Tuy nhiên, xâu chuỗi này không luôn thẳng mà đôi khi có những nhánh rẽ: ví dụ hai thợ mỏ cùng lúc giải được một block, độc lập với người kia. Mạng bitcoin được thiết kế để có thể xử lý những nhánh rẽ này, và chỉ có một trong hai nhánh sẽ là chuỗi chính được quyền sống sót.

Các client chọn nhánh "dài nhất" là nhánh hợp lệ. "Độ dài" của nhánh tính theo độ khó tổng của các blocks, chứ không phải số block. Điều ngày ngăn cản một kẻ tấn công tạo một số lượng lớn các block dễ và tạo nên một chuỗi "dài"

#### Các câu hỏi thường gặp về block

* [Hiện có bao nhiêu block](https://blockexplorer.com/api/status?q=getBlockCount)?

* Số lượng tối đa block là bao nhiêu?

    Không có một số block tối đa, các block liên tục được add vào block chain mỗi 10 phút

* Ngay cả khi 21 triệu bitcoin được phát hành hết?

    Đúng, các transaction sẽ còn được sinh ra chừng nào còn người sử dụng bitcoin

* Cần bao lâu để tạo ra một block bằng tay?

    Không có một con số chính xác, bạn thử đoán xem.

* Nếu tôi giải 1% của block và...?

    Không có khái niệm giải 1% của block. Bạn không có một "tiến độ giải block" dù đã giải bao lâu, sau 24 giờ làm việc, xác xuất bạn giải được bài toán vẫn bằng lúc bạn bắt đầu giải cách đây 24h. Giống như ảo tưởng của tay đánh bạc, giải bài toán tương tự như việc gieo xúc sắc, xác xuất bạn gieo được ba mặt sáu là như nhau bất chấp bạn đã gieo bao nhiêu lần.

Tôi muốn biết sâu hơn về phần kỹ thuật của block?
Vâng, có một bài chi tiết [ở đây](/2016/06/18/bitcoin-block-hashing-algorithm)

Dịch từ https://en.bitcoin.it/wiki/Block