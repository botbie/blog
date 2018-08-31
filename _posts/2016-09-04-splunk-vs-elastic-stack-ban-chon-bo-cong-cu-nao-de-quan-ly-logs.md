---
layout: post
cover: 'assets/images/covers/casper.jpg'
title: Splunk vs Elastic Stack - Bạn chọn bộ công cụ nào để quản lý logs?
date: 2016-09-04
tags: [splunk, elastic, kibana]
author: tiennv147
description: >
    Không giống như giai đoạn development của một project, giai đoạn production tạo ra rất nhiều file log và các dòng log vô tận, với hàng GBs dữ liệu được sinh ra mỗi ngày. Trong hầu hết các tình huống duyệt log thủ công, chúng ta đều dùng command grep, để giới hạn các dòng log mà có giá trị bạn muốn nó xuất hiện. Nhiều lúc điều đó khiển bạn phát điên
---


Không giống như giai đoạn development của một project, giai đoạn production tạo ra rất nhiều file log và các dòng log vô tận, với hàng GBs dữ liệu được sinh ra mỗi ngày.

Trong hầu hết các tình huống duyệt log thủ công, chúng ta đều dùng command grep, để giới hạn các dòng log mà có giá trị bạn muốn nó xuất hiện. Nhiều lúc điều đó khiển bạn phát điên

![Grepping](/assets/images/posts/2016-09-04/yo-grep.jpg)

Trong bài blog này, chúng ta sẽ cùng so sánh về 2 giải pháp quản lý log phổ biến nhất Splunk và ELK (Elasticsearch-Logstash-Kibana):
##### 1. Ai là người quản lý log?
Cho dù đó là log errors hay exceptions, log nghiệp vụ hay bất cứ thể loại log phân tích nào, Splunk & ELK điều có giải pháp cho tất cả các mức độ lớn của doanh nghiệp đó. Splunk có bản thường mại dành cho doanh nghiệp với 15 ngày dùng thử cho bản Enterprise.

ELK viết tắt của Elastic Search, Logstash, Kibana, một dự án mã nguồn mở với support thương mại. Chính xác hơn ta có thể gọi nó là [BELK](https://www.elastic.co/blog/heya-elastic-stack-and-x-pack)

Splunk là một trong những công ty đầu tiên đối phó với các vấn đề cố hữu trong việc ghi log thậm chí ngày cả dữ liệu của log của bạn cực lớn, tên gọi của nó đến từ "spelunking" nghĩ là khám phá hang động.

Phía bên kia hang động đó là ElasticSearch được released bởi Shay Banon vào năm 2010 và công ty một công ty được thành lập xoay quanh phát trình phát triển nó gọi là Elastic

Tham gia lực lượng gồm có với Logstash(Jordan Sissel), Kibana (Rashid Khan) và gần đây PacketBeat(Monica & Tudor Golubenco) một dây chuyền hệ thống tool miễn phí* và mã nguồn mở, làm nên một giải pháp tổng thể ELK [as-a-server solution](http://blog.takipi.com/hosted-elasticsearch-the-future-of-your-elk-stack/). Khi so sánh 2 giải pháp Splunk và ELK chúng ta đều thấy cả 2 đều tăng dần sự phổ biến nhưng về mức độ tăng trưởng thì Splunk có vẻ tốt hơn

Ngoài ra bạn thể tham khảo thêm bài blog so sánh về các tools quản lý log khác như Sumo Logic hay Loggly [ở đây](http://blog.takipi.com/the-7-log-management-tools-you-need-to-know/)

![Splunk-vs-ELK](/assets/images/posts/2016-09-04/splunk-elk-trends.png)
Cả 2 bên điều có các bình luận tiêu cực đại loại như này:

* Splunk: chi phí cho dịch vụ tốn kém.
* ELK: mặc dù là opensource nhưng tốn kém thời gian tìm hiểu, deploy và chi phí phần cứng tăng theo cấp số nhân.
*Kết luận*: Cả Spunk và ELK đang dẫn đầu về các tool quản lý log với các giải pháp toàn diện và tùy biến nhất.

##### 2. Vấn đề bạn đang muốn giải quyết là gì?
Xét về khía cạnh của thị trường, Splunk ban đầu thường chỉ hướng đến doanh nghiệp lớn và mới bắt đầu hướng đến các doanh nghiệp nhỏ. ELK thì ngược lại, được áp dụng trên tất cả các loại doanh nghiệp khác nhau, cùng với sự phát triển của hệ sinh thái ELK, cung cấp các dịch vụ hỗ trợ thương mại.

Một vài điểm ta cần xem xét:

Giải pháp quản lý ([On-perm](https://en.wikipedia.org/wiki/On-premises_software) vs Cloud, Managed Solutions)

Khối lượng dữ liệu phát sinh hằng ngày (Chi phí chủ yếu)

Số lượng service khác mà bạn muốn đẩy dữ liệu vào.

Người dùng hệ thống log này, có phải họ đều là developer?

Tình huống sử dụng đặc biệt.

Tỉ lệ thay đổi giao diện của dashboards

Nếu như bạn đang tìm kiếm một giải pháp grepping tiến tiến (cùng hàng loạt điểm mạnh đi theo hướng này), dễ dàng visualize thì Splunk thực sự rất tốt.

Còn nếu trường hợp sử dụng của bạn dự kiến sẽ tăng trưởng nhanh theo thời gian, và kịch bản phức tạp phục vụ nhiều đối tượng người dùng các bộ phận khác nhau trong công ty thì ELK lại tỏ ra đúng là thứ bạn cần. Nếu như không nói về chi phí quản lý phần cừng lại Cloud Storage.

Kết luận: Trước khi đưa ra quyết định, cố gắn tìm một giải pháp tổng thế cho tương lại. Quan trọng nhất là nhu cầu của bạn như nhau trong toàn bộ quá trình phát triển của product hay là tùy biến theo thời gian.

##### 3. Bạn muốn cài đặt những modules nào?
Câu hỏi này liên quan đến 3 quyết định:

Bạn muốn 1 giải pháp chạy ngay tại chỗ (on-prem) hay là giải pháp trên mây?

Bạn cần một giải pháp chuyên biệt hay một nền tảng quản lý log dễ dàng mở rộng?

Nếu dùng ELK, bạn muốn một giải pháp quản lý giúp bạn hay là tự handle tất cả?

Cùng nhìn lại các options:

Sản phẩm của Splunk được chia làm 2 loại, giải pháp côt lõi và giải pháp chuyên biệt cao cấp. Splunk Enterprise cho phép tự cài đặt trên server của bạn và bên cạnh còn một giải pháp Splunk Cloud. Trong bài blog này chúng ta sẽ thảo luận xung quanh Splunk Cloud sử dụng một vài bộ log mẫu upload bằng text files. Bản Enterprise và bản Cloud cung cấp các tính năng như nhau chỉ khác về cách triển khai công cụ.

Còn một loại mà Splunk cung cấp nữa là Splunk Light có thể tự cài đặt và sử dụng hoặc sử dụng hosted, dành cho nhu cầu mở rộng ít với chi phí thấp hơn bắt đầu với 124$/tháng với dung lượng tối đã mỗi ngày 1GB. Nó là phiên bản mới nhất mà Splunk cung cấp. Bạn có thể tham khảo thêm ở đây

Bên cạnh đó, các sản phẩm của Splunk được xây dựng xung quanh Hadoop, nếu bạn đã đang sử dụng Hadoop và muốn có thêm các tính năng của Splunk. (Hoặc bạn có thể gửi dữ liệu của Hadoop trông qua kết nối LogStash Hadoop)

Đối với trường hợp sử dụng chuyên biệt xoay quanh bảo mật, dịch vụ IT, phân tích hành vi người dùng, Splunk có các sản phẩm hỗ trợ cụ thể. Trong khi đó ELK thì chưa có các tích năng có tích hợp sẵn.

Với ELK Stack, các yếu tố để chúng tả quyết định xoay quanh: triển khai độc lập hay nhờ sự quản lý của bên thứ 3. Nhờ sự quản lý thì tất nhiên sẽ có phí. Còn độc lập triển khai thì bạn sẽ có sự linh hoạt hơn, nhwung bù lại cần nó kỹ sư làm việc full-time chuyên quản lý ELK - Hâu như không lý tưởng lắm. Các service thì bạn có thể sự dụng thông qua Elastic.

Phương pháp nhờ sự quản lý chủ yếu được tạo thành từ các giải pháp [ELK-as-a-Service](http://blog.takipi.com/hosted-elasticsearch-the-future-of-your-elk-stack/)

Kết luận: Splunk trước giờ theo xu hướng triển khai tại chỗ, phục vụ cho doanh nghiệp lớn, dễ dàng tùy chỉnh với 1 tâp nhu cầu sử dụng lớn. ELK thì được sử dụng ở mọi người. thành công của nó phục thuộc vào bạn đầu tư thời gian và công sức vào.

##### 4. Application Logs vs Bussiness Data - Kết quả bạn dang mong đợi là gì?
Splunk và ELK đều cung cấp giải pháp quản lý log, nhưng không dừng lại ở đó.

Các dòng logs được tạo ra bởi các dịch vụ khác nhau về hoạt động, ngoài các số liệu của hệ thống thì còn có số liệu liên quan kinh doanh. Ví dụ như thông tin bán hàng, hành vi của người và thông tin cụ thể của sản phẩm.

Tuy nhiên, tình huống sử dụng tốt nhất là các dòng logs để xử lý sự cố. Trong hầu hết các trường hợp những gì được ghi nhận trong file logs đó là những thông tin duy nhất có thể giúp bạn hiểu được điều gì không đúng ở đây với mã nguồn ở prodution. Điều này bao gồm các dòng logs errors, warnings, exceptions và nếu may mắn bao gồm luôn cả các exception mà bạn ko try-catch.

Điều thường xuyên xảy ra là: thứ duy nhất có thể giúp bạn nhanh chóng điều tra ngay tại thời điểm có lỗi đó là Stack trace, nhưng lại thường xuyên bị bỏ qua phần này. Điều đó dẫn đến không đầy đủ thông tin để biết được thực sự lỗi đến từ đâu, và giảm việc lặp đi lặp lại để phát hiện các lỗi tương tự.

Kết luận: Kết quả bạn nhận được chỉ tốt khi các dữ liệu các bạn ghi vào đủ tốt. Để khắc phục sự cố các exception log, error logs, thử tìm hiểu OverOps để các bản ghi log trên production của bạn trở nên có ý nghĩa hơn.

=> Cá nhân mình thấy phần này hơi tào lao :Data

3 Mục tiếp theo trong bài này là (sẽ cập nhật sớm, khi mình có thời gian):

##### 5. Logstash, Beats and Splunk Forwarders – Bạn định dùng tool nào để đẩy dữ liệu log về server?
##### 6. Bạn có muốn phân quyền cho từng user?
##### 7. Usability – Sự khác biệt giữa các dashboards là gì?

Bài dịch từ [blog này](http://blog.takipi.com/splunk-vs-elk-the-log-management-tools-decision-making-guide/)