---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Bitcoin blockchain
date: 2016-06-10
tags: [bitcoin, bài dịch, cryptocurrency, blockchain]
author: jaken
description: >
  Block chain là cơ sở dữ liệu dùng lưu trữ các giao dịch của hệ thống bitcoin, toàn bộ dữ liệu được lưu trữ tại mỗi node của hệ thống. Mọi người có thể tải về toàn bộ dữ liệu, chứa tất cả các giao dịch bitcoin đã từng thực hiện. Với toàn bộ thông tin đó, ai cũng có thể biết mỗi địa chỉ bitcoin chứa bao nhiêu tiền tại một thời điểm bất kỳ.
---

Block chain là cơ sở dữ liệu dùng lưu trữ các giao dịch của hệ thống bitcoin, toàn bộ dữ liệu được lưu trữ tại mỗi node của hệ thống. Mọi người có thể tải về toàn bộ dữ liệu, chứa tất cả các giao dịch bitcoin đã từng thực hiện. Với toàn bộ thông tin đó, ai cũng có thể biết mỗi địa chỉ bitcoin chứa bao nhiêu tiền tại một thời điểm bất kỳ.

Blockchain là điểm đột phá của bitcoin: Mỗi block chứa một hash của block trước, block nguyên thủy ban đầu sẽ chứa hash (0..000). Điều này cho phép các block kết nối với nhau thành một chuỗi từ block nguyên thủy tới block hiện tại. Các block trong chuỗi cũng sắp sếp theo trình tự thời gian. Nhờ những tính chất trên mà không thể thay đổi một block mà không ảnh hưởng tới chuỗi phía sau, từ đó tránh được việc một số lượng tiền được chi hai lần như trong các dạng cơ sở dữ liệu khác trước đó.

Block mới sẽ được xây dựng dựa trên chuỗi dài nhất đang có (chiều dài không tính theo số lượng block, mà tính theo tổng "độ khó" của chuỗi, cách tính này sẽ có tác dụng phòng chống một vài kiểu tấn công tiềm năng). Một chuỗi block là hợp lệ nếu tất cả block và giao dịch trong nó đều hợp lệ, và nó phải bắt đầu từ block nguyên thủy.

Với mỗi block trong chuỗi, chi có một đường đi từ nó tới block nguyên thủy. Nếu đi từ block nguyên thủy, có thể gặp vài nhánh rẽ khác nhau. Các nhánh rẽ chứa 1 block thường sinh ra khi có 2 block được tạo cách nhau chỉ vài giây. Khi điều này xảy ra, các node sẽ sinh block tiếp theo từ block nào node đó nhận được trước. Trong block kế tiếp sau đó, chuỗi nào "dài" hơn sẽ được chọn làm chuỗi chính. Những phân nhánh nhánh nguy hiểm hơn từng xảy ra sau khi sửa những lỗi yêu cầu tương thích ngược.

Các block trong chuỗi ngắn hơn (hoặc chuỗi sai) không được sử dụng. Khi bitcoin client đổi sang một chuỗi dài hơn, tất cả các giao dịch hợp lệ trong block bị hủy sẽ được đưa vào hàng đợi để ghi vào một block sau đó. Phần thưởng đạt được trong chuỗi ngắn sẽ không được tính trong chuỗi dài, và nó mất đi hoàn toàn. Đó là lý do tại sao các coin sinh ra cần đợi 100 block để được xác minh trước khi được chính thức sử dụng.

Những block trong chuỗi ngắn hơn (hoặc chuỗi sai) thường gọi là block "mồ côi". Vì các giao dịch đó không có block cha trong chuỗi dài, nên các giao dịch sẽ được đánh dấu "mồ côi" trong danh sách giao dịch. Một vài pool hiểu sai ý nghĩa của các thông báo và bắt đầu gọi các block này là "mồ côi". Trong thực tế, các block này có block cha, và thậm chí block con.

Vì một block chỉ có thể tham chiếu tới một block trước đó, không thể merge hai chuỗi rẽ nhánh.

Có thể dùng thuật toán blockchain cho các mục đích phi tài chính khác, chi tiết xem thêm tại https://en.bitcoin.it/wiki/Alternative_chain

Block chain được broadcast cho tất cả các node dùng một giao thức flood. Có thể xem thêm tại https://en.bitcoin.it/wiki/Block_chain_download