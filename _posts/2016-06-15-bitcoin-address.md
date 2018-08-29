---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Bitcoin address
date: 2016-06-15
tags: [bitcoin, bài dịch, cryptocurrency, blockchain]
author: jaken
description: >
  Bitcoin address - địa chỉ bitcoin, là một chuỗi 26-35 ký tự chữ và số, bắt đầu với 1 hoặc 3, là đích của một thanh toán bitcoin. Bất kỳ người dùng bitcoin nào cũng có thể tự tạo địa chỉ bitcoin của mình miễn phí.
---

Bitcoin address - địa chỉ bitcoin, là một chuỗi 26-35 ký tự chữ và số, bắt đầu với 1 hoặc 3, là đích của một thanh toán bitcoin. Bất kỳ người dùng bitcoin nào cũng có thể tự tạo địa chỉ bitcoin của mình miễn phí. Ví dụ với phần mềm [Bitcoin Core](https://bitcoin.org/en/bitcoin-core/), bạn có thể nhấn nút "New Address" để tạo một địa chỉ mới. Bạn cũng có thể lấy một địa chỉ Bitcoin bằng ví online, hoặc một trang giao dịch bitcoin.

Hiện có hai loại định dạng cho địa chỉ bitcoin:

* Địa chỉ [P2PKH](https://en.bitcoin.it/wiki/Transaction#Pay-to-PubkeyHash) thông thường bắt đầu với số 1, ví dụ: 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2.
* Địa chỉ loại mới [P2SH](https://en.bitcoin.it/wiki/Pay_to_script_hash) bắt đầu với số 3, ví dụ : 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy.

*Địa chỉ bitcoin dùng một lần*
Giống như là địa chỉ email, bạn có thể gửi bitcoin cho một người bằng cách gửi tới địa chỉ họ cung cấp. Nhưng khác với email, một người có thể có rất nhiều địa chỉ bitcoin, và mỗi địa chỉ được khuyến cáo nên dùng một lần cho mỗi giao dịch. Hầu hết các phần mềm bitcoin và trang web sẽ có công cụ tự động sinh ra một địa chỉ mới mỗi khi bạn tạo một hóa đơn hay yêu cầu trả tiền.

##### Địa chỉ bitcoin có thể tạo mà không cần internet

Để tạo ra một địa chỉ bitcoin bạn không cần phải kết nối tới mạng lưới bitcoin. Bạn hoàn toàn có thể tạo ra một số lượng lớn địa chỉ dùng các công cụ miễn phí, và không cần kết nối. Việc tạo ra hàng loạt địa chỉ có thể hữu dụng trong một số trường hợp, ví dụ một trang web thương mại tạo ra hàng loại địa chỉ sẵn và cung cấp cho người dùng mỗi khi họ chọn trả tiền bằng bitcoin. Các "ví HD" mới còn cho phép sinh ra một token "seed", có thể đưa nó cho một hệ thống khác (như là webserver) sinh ra các địa chỉ, các địa chỉ này có thể nhận coin bình thường, nhưng chỉ có ví tạo token seed có thể dùng tiền đã nhận .

##### Địa chỉ có phân biệt hoa thường và chính xác
Địa chỉ bitcoin có phân biệt hoa-thường. Vì vậy mà nó nên được copy và paste bằng máy tính. Nếu bạn viết tay một địa chỉ bitcoin, và mỗi ký tự không được viết rõ ràng - hoa thường, địa chỉ bitcoin sai sẽ không thể dùng được, hệ thống bitcoin báo "địa chỉ sai"

Xác xuất một địa chỉ gõ nhầm được hệ thống chấp nhận (trùng với một địa chỉ đúng) là 1 trên 2 lũy thừa 32, khoảng 1 phần 4.29 tỉ

##### Chứng minh sở hữu với một địa chỉ
Hầu hết các ví bitcion có một chức năng "ký" một thông điệp, chứng minh bạn sẽ nhận tiền qua một địa chỉ nào đó. Chức năng này khá hữu ích, chẵn hạn trong các hợp đồng số.

Một vài dịch vụ dựa trên tính năng này, sử dụng một địa chỉ đặc biệt chỉ dùng để xác thực, trong trường hợp này địa chỉ đó không nên được dùng để giao dịch bitcoin. Khi bạn đăng nhập để dùng dịch vụ, bạn sẽ cung cấp một chữ ký chứng minh bạn là cùng một người đã cung cấp một địa chỉ cho trước.

Chú ý là những chữ ký này chỉ có chức năng xác minh người nhận. Vì bitcoin không có một "địa chỉ gửi", bạn không thể chứng minh bạn là người gửi tiền.

Các chuẩn chữ ký hiện tại chỉ tương thích với phiên bản gốc của địa chỉ bitcoin (bắt đầu với số 1)

##### Xác nhận địa chỉ
Nếu bạn muốn kiểm tra xem một địa chỉ bitcoin là đúng hay không, bạn nên sử dụng phương pháp trong [bài này](https://bitcointalk.org/index.php?topic=1026.0) , không nên chỉ kiểm tra độ dài chuỗi, các ký tự cho phép, hay có phải địa chỉ bắt đầu bằng 1 và 3 không. Bạn cũng có thể dùng các công cụ mã mở hoặc online.

##### Địa chỉ nhiều chữ ký
Các địa chỉ có thể được tạo bằng cách kết hợp nhiều khóa bí mật (địa chỉ dạng này bắt đầu bằng số 3). Điều này giúp tạo ra một số tính năng mới của bitcoin. Bạn có thể tưởng tượng một giao dịch "trả cho anh A và anh B" - ta cần cả A và B để có thể nhận được món tiền.

Các yêu cầu cần thiết (số lượng khóa bí mật, khóa công khai...) cần phải được thỏa mãn để người tạo có thể nhận được món tiền, và khi một địa chỉ được tạo, các yêu cầu không thể thay đổi trừ phi tạo mới một địa chỉ khác.

##### Có gì trong địa chỉ bitcoin
Hầu hết các địa chỉ bitcoin gồm 34 ký tự. Chúng chứa các số và ký tự hoa thường ngẫu nhiên, nhưng một số ký tự dễ nhìn sai sẽ không được sử dụng, chúng bao gồm chữ "O", số "0", chữ "I" hoa, chữ "l" thường.

Một số địa chỉ bitcion có thể ngắn hơn 34 ký tự (ít nhất là 26) và vẫn hợp lệ. Có một số lượng đáng kể các địa chỉ bitcoin có 33 ký tự, và số lượng ngắn hơn thì ít hơn. Mỗi địa chỉ dựa trên một con số, những địa chỉ ngắn được kiểm tra dễ dàng bởi vì chúng bắt đầu với những con số 0, và khi bỏ đi những số 0 ở đầu, địa chỉ được mã hóa sẽ ngắn hơn.

Một vài ký tự trong địa chỉ được dùng để checksum, từ đó các lỗi gõ nhầm có thể được nhận ra dễ dàng. Việc checksum cũng cho phép các phần mềm bitcoin có thể kiểm tra một địa chỉ ngắn là hợp lệ hay là một địa chỉ dài bị thiếu một vài ký tự.

##### Testnet
Các địa chỉ trên Bitcoin Testnet được tạo ra với vài phiên bản khác nhau, với các ký tự đầu khác nhau

##### Hiểu nhầm
**Dùng lại địa chỉ**

Địa chỉ bitcoin chỉ nên dùng một lần, xem thêm bài [tái sử dụng địa chỉ bitcoin](https://en.bitcoin.it/wiki/Address_reuse) để biết nguyên nhân.

**Tiền trong địa chỉ**

Địa chỉ không phải là tài khoản hay ví, nên không chứa tiền. Nó chỉ có chức năng nhận tiền, và bạn không gửi "từ" một địa chỉ nào. Một vài dịch vụ và phần mềm hiển thị bitcoin được nhận từ một địa chỉ, cộng các bitcoin gửi đến từ các giao dịch ngẫu nhiên vào một "số dư trong địa chỉ bitcoin", nhưng con số này thực ra là vô nghĩa: nó không có nghĩa là bitcoin đã được gửi đến địa chỉ đó, hay họ vẫn giữ những bitcoin đã nhận.

Một ví dụ về việc hiểu nhầm này là khi người ta tin rằng địa chỉ bitcoin của họ chứa 3BTC. Họ chi 0.5 BTC và tin là giờ địa chỉ còn 2.5BTC khi thực tế là nó còn 0. 2.5BTC còn lại đã được chuyển tới một địa chỉ khác không được backup và mất đi. Điều này đôi khi xảy ra với người sử dụng ví bitcoin giấy

**"Địa chỉ gửi"**

Giao dịch bitcoin không có dạng "địa chỉ gửi", hay "địa chỉ nguồn". Nếu muốn biết thêm bạn có thể [xem ở đây](https://en.bitcoin.it/wiki/From_address)

Dịch từ https://en.bitcoin.it/wiki/Address