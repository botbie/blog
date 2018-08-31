---
layout: post
cover: 'assets/images/covers/cover4.jpg'
title: Bitcoin Agent
date: 2016-07-11
tags: [bitcoin, blockchain, ai, bài dịch, agent]
author: jaken
description: >
  Bitcoin Agent là một chương trình tự động có thể tự sống bằng cách bán dịch vụ lấy bitcoin, và dùng tiền thu được để thuê server. Các Agent làm việc có lời nhuật có thể tự nhân bản nó và mở rộng trên internet bằng cách thuê thêm các server, tạo thêm các instance của chính nó.
---

Bitcoin Agent là một chương trình tự động có thể tự sống bằng cách bán dịch vụ lấy bitcoin, và dùng tiền thu được để thuê server. Các Agent làm việc có lời nhuật có thể tự nhân bản nó và mở rộng trên internet bằng cách thuê thêm các server, tạo thêm các instance của chính nó.

Ý tưởng về các agent tự động sử dụng bitcoin được julz mô tả lần đầu ở diễn đàn bitcointalk năm 2011 và được Gregory Maxwell thảo luận chi tiết hơn với một ví dụ về hệ thống lưu trữ gọi là [StorJ](https://bitcointalk.org/index.php?topic=53855.msg642768#msg642768). Tại sự kiện Turing Festival 2013, một diễn giả tên là Mike Hearn đã thảo luận về [đề tài này](https://www.slideshare.net/mikehearn/future-of-money-26663148). Trong một chuỗi bài viết gọi là "khởi động một tập đoàn tự động phi tập trung" của Vitalik Buterin trên Bitcoin Magazine, các agent đã được tham chiếu như một loại ["tập đoàn tự động phi tập trung"](http://bitcoinmagazine.com/7050/bootstrapping-a-decentralized-autonomous-corporation-part-i/)

##### Các khái niệm trung tâm
Các Agent tương tác với thế giới thông qua những cơ chế sau:

* Mạng bitcoin
* Các API cho phép thuê server, và remote control (vd thông qua ssh)
* Các hợp đồng đăng trên các diễn đàn freelancer hoặc Mechanical Turk
* Các giao thức Agent cung cấp, ví dụ HTTP
Khi một chương trình có thu chi riêng của nó, lần đầu tiên nó có thể đứng cùng con người trên một sân chơi bình đẳng. Thậm chí có thể những con người cần tiền sẽ thấy họ đang làm việc cho một chương trình, chứ không phải là chương trình làm việc cho con người. Nhờ bitcoin, chương trình trở nên khác biệt: nó vượt lên một công cụ và sánh ngang với con người.

Vì việc cho thuê server thường được định chuẩn rõ ràng theo đơn vị (thời gian CPU, dung lượng RAM/ổ cứng, băng thông), một phần mềm máy tính hoàn toàn có khả năng tự động tìm và chọn một nhà cung cấp chấp nhận thanh toán bằng Bitcoin.

Nếu một hợp đồng tốt hơn tìm thấy, Agent có thể tự di chuyển nó. Một Agent ăn nên làm ra có thể được lập trình để dùng một phần lợi nhuận để tạo ra một Agent con và đầu tư vào đó một khoản tiền khởi động. Nếu Agent con hoạt động tốt, nó có thể tự sống sót, hoặc nếu Agent con kinh doanh thất bại và tài khoản hết tiền, nhà cung cấp server sẽ xóa tài khoản và Agent con chết đi.

Agent có thể giới thiệu dịch vụ của nó tới con người (hoặc những Agent khác) bằng cách chọn tên và đăng ký với [Namecoin](https://en.bitcoin.it/wiki/Bitdns). Nếu agent chỉ có bitcoin, nó có thể dùng phương pháp trao đổi ngang hàng để đổi lấy Namecoin hoặc ngược lại. Với hệ thống DNS phân cấp và Namecoin, những người quan tâm có thể xem được những Agent mới đang xuất hiện.

Các Agent cũng có thể tự cải thiện bản thân bằng cách thuê dịch vụ của con người và dùng các hòa giải viên làm đảm bảo cho việc chi trả. Sau đó kiểm định A/B có thể giúp chương trình xác định được mức hiệu quả của một công việc, nó có tốt hơn cái cũ hay không. Và các hòa giải viên chỉ chấp nhận chi nếu kết quả kiểm thử là tốt. Ví dụ, một giao diện người dùng được thiết kế lại và kiểm thử A/B trên 10% người dùng, để xem nó hỗ trợ upload/ download file tốt hơn hay không? Thêm nữa, một nhóm hòa giải viên có thể được chỉ định, họ sẽ quyết định công việc có thỏa hợp đồng hay không. Để thêm tính năng cho Agent, nó cũng có thể mua các đoạn mã mới...

##### Phụ thuộc vào các giao thức tin cậy thấp

Các giao thức tin cậy thấp là một phần quan trọng cần có để Agent có thể tự bảo vệ mình trước sự lừa đảo của con người. Vì chỉ là một chương trình, nó không thể đưa ra các đánh giá tín nhiệm và dễ dàng bị lừa đảo, ví dụ mua một thứ không tồn tại. Con người có thể la làng, có thể kiện ra tòa án kẻ lừa đảo nhưng Agent thì không.

Giao thức cơ bản nhất cần cho Agent là mua thời gian server. Agent có thể mua thời gian server theo phút thậm chí theo giây. Một giao thức đơn giản có thể hiện thực như sau: khi đăng ký, một tập tin ~/.account-billing-details sẽ được tạo trong thư mục gốc của tài khoản mới, chứa địa chỉ bitcoin của chủ server và mức giá cụ thể. Agent đọc tập tin và trả tiền cho chủ server.

Để nâng cấp các Agent, cần các mã nguồn mới do con người viết. Để phòng chống bị con người lừa đảo, thêm mã độc để trộm tiền Agent, Agent có thể dùng các công nghệ sandbox như Java hoặc NativeClient để đảm bảo phần mã nguồn mới chỉ luôn truy cập phần cho phép. Điều này sẽ làm cho thiết kế ban đầu của Agent khá chặt, nhưng nó cho phép Agent có được sự tự chủ về sau. Các Agent cũng có thể được lập trình để tin tưởng các khách hàng lâu năm: nếu đủ số lượng khách hàng đáng tin cậy review và ký đảm bảo cho mã mới, mã có thể được truy cập các tài nguyên bên ngoài sandbox và thay đổi Agent. Nếu Agent đã được cải tiến, nó sẽ nhanh chóng vượt qua các Agent anh em và tự nhân bản mình nhiều hơn.

##### Ví dụ
Hãy xem xét ví dụ gốc về một Agent lưu trữ tập tin.

* Nó cho thuê ổ cứng và băng thông của nó để lấy bitcoin. Bất kỳ ai muốn giữ một tập tin online có thể gửi coin tới địa chỉ bitcoin của file đó.
* Nếu Agent sắp hết tài nguyên, nó có thể dùng một phần lợi nhuận để tạo ra Agent con trên dịch vụ hosting. Nếu dịch vụ chưa đáng tin cậy, Agent sẽ theo dõi Agent con trong một thời gian để đảm bảo nó hoạt động đúng.
* Các Agent con có thể đăng ký với tên như "x536ma.storj.bit". Bất kỳ tên nào đăng ký dưới dang *.storj.bit sẽ được xem là cùng dịch vụ.
* Các Agent có thể cạnh tranh về chất lượng của giao diện người dùng.

Một số công ty hỗ trợ mua shell account bằng bitcoin, nhưng hầu hết không hỗ trợ. Các Agent môi giới có thể thuê dịch vụ và bán lại cho các Agent khác:

* Agent-môi giới sẽ tương tác với nhà cung cấp, tạo ra các api chuẩn để các Agent khác dễ dàng làm việc.
* Các Agent môi giới có thể mua từ con người các kịch bản để đăng ký tài khoản mới ở một dịch vụ mới, chúng cũng có thể làm việc bán bitcoin lấy tiền thật và trả tiền bằng cơ chế mà nhà cung cấp hỗ trợ.
* Các nhà cung cấp có thể chạy một phiên bản sshd sửa đổi, cho phép xem SSH key là một loại tài sản thông minh. Bằng cách tạo sẵn các tài khoản sheel giới hạn tài nguyên, và bán key truy cập cho các Agent môi giới, các Agent môi giới dễ dàng tự động bán lại chúng cho các Agent khác, dùng phương pháp hạn chế thời gian và theo dõi input/output vào các địa chỉ bitcoin.

##### Sử dụng điện toán tin cậy/TPM chips

Để thực sự hoạt động tự động, Agent không nên tin tưởng bất kỳ ai (hay cái gì). Tuy nhiên để giao dịch bạn thường cần đảm bảo rằng đối tác sẽ làm đúng như thỏa thuận. Con người dựa vào luật pháp để đảm bảo thi hành hợp đồng, nhưng Agent không thể làm thế. Trong khi các giao thức thông minh có thể thiết lập các biện pháp khuyến khích để đảm bảo hợp tác trong một số trường hợp, điện toán tin cậy là giải pháp chung.

Ví dụ, các Agent có thể cần đảm bảo rằng nhà cung cấp sẽ không trộm tiền của nó. Tuy về lâu dài đây có vẻ giống như giết gà lấy trứng, nhưng việc thu tiền dễ dàng sẽ kích thích một số người tạo dịch vụ giả và mời các Agent đi vào.

Các CPU hiện đại có khả năng hiển thị từ xa mã đang chạy của nó là mã gì, và sử các khóa mã chỉ tồn tại khi phần cứng có cấu hình giống hệt trước đó. Bạn có thể xem trong [dự án Flicker](https://web.archive.org/web/20170117005120/https://sparrow.ece.cmu.edu/group/flicker.html), nó mô tả cách hiện thực trên CPU Intel và AMD chạy Linux với vài tính toán đơn giản (không dùng ngắt). Với TPM chip, việc xâm phạm bảo mật sẽ cần tác động lên chip, vốn được thiết kế để phòng chống kiểu tấn công này. Và nếu số tiền được bảo vệ không quá lớn, mức khó khăn như vậy có thể đủ tránh được gian lận.

Để dùng những tín năng trên, một Agent con sẽ sao chép mã của nó lên server mới. Tại điểm này nó không có ví. Sau đó nó sẽ đăng nhập vào tên miền được bảo vệ, nơi cách ly với hệ điều hành, và thực thi mã PAL (piece of application logic), mã này tạo một khóa bí mật, giúp dữ liệu được mã hóa không thể bị hệ điều hành đọc được (hên xui). Hệ điều hành lúc này có thể xem như một proxy không tin cậy và nơi cung cấp tài nguyên.

Agent cha cần cung cấp cho con một số tiền để nó có thể khởi nghiệp, nhưng làm sao nó biết tiền sẽ đến với Agent con mà không phải một kẻ lừa đảo tham lam? Agent con có thể dùng TPM để chứng minh từ xa rằng nó hoàn toàn kiểm soát CPU và thời gian nó tạo ra khóa bí mật khớp với địa chỉ cung cấp. Agent cha lúc này có thể kiểm tra từ xa và đảm bảo rằng tiền sẽ đến tay con mình.

Nếu có người mua dịch vụ của một Agent, ví dụ upload một tập tin lên StorJ, thanh toán kèm theo được gửi tới mã PAL an toàn, cùng với nhánh merkle kết nối trong blockchain. Sau đó mã PAL cập nhật sổ ghi nợ và nó biết nó cần trả thêm cho host, và khi host gửi hóa đơn, PAL kiểm tra hóa đơn và tạo/ký một giao dịch trả tiền. Giao dịch sau đó được gửi ngược lại cho host đã gửi yêu cầu.

Không phải tất cả các phần cứng đều hỗ trợ tính năng điện toán tin cậy. Tuy nhiên, vài dòng laptop và server/destop có hỗ trợ, và Agent có thể thuê lại phần cứng từ các môi giới để giảm chi phí (thay vì mua máy).

Từ https://en.bitcoin.it/wiki/Agent