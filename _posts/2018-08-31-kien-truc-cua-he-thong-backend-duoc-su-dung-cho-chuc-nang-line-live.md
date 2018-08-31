---
layout: post
cover: 'assets/images/covers/casper.jpg'
title: Splunk vs Elastic Stack - Bạn chọn bộ công cụ nào để quản lý logs?
date: 2018-08-31
tags: [architect, bài dịch, backend]
author: tiennv147
description: >
    Đây là một bài blog của tác giả Oklahomer đến từ LINE Corp. Trong bài này, tác giả sẽ trình bày về kiến trúc của hệ thống backend được sử dụng cho chức năng LINE LIVE, một dịch vụ live stream.
---

Đây là một bài blog của tác giả Oklahomer đến từ LINE Corp. Trong bài này, tác giả sẽ trình bày về kiến trúc của hệ thống backend được sử dụng cho chức năng [LINE LIVE](https://live.line.me/), một dịch vụ live stream.

##### GIỚI THIỆU
LINE LIVE trên iOS và Android có một tính năng chat mà user có thể gửi những lời bình luận ngay lập tức trong lúc xem live stream mà các thành viên còn lại trong room có thể nhìn thấy. Tính năng này không chỉ có phép users (trong trượng hợp này là người xem) giao tiếp với những người khác, mà còn cho phép người live stream kết nối với những người xem của họ. Người live stream có thể chat với người xem sau khi họ live xong. Và đôi khi kế hoạch là phải kích thích được người xem tương tác với live của họ. Vì thế đấy là lý do tại sao chat là tình năng không thể thiếu của live stream.

Như bạn có thể tưởng tượng, những người nổi tiếng luôn thu hút một số lượng lớn người xem, và những màn live stream của họ luôn kèm theo một tràn bình luận. Những comments đã gửi phải được đồng thời gửi đến tất cả những người xem còn lại, và chia tải làm sao cho hiệu quả luôn luôn là một trong những nhiệm vụ ưu tiên hàng đầu của họ. Đôi khi có những video live stream lên đến 10, 000 comments trong một phút.

Hiện tại thì họ có hơn 100 server phục vụ cho tính năng chat trong khi live stream.
Chi tiết hơn về kiến trúc tác giả sẽ trình bày dưới đây:

##### TỔNG THỂ VỀ KIẾN TRÚC
![alt](/assets/images/posts/2018-08-31/1_chat_architecture_for_blog.png)

Nào giờ chúng ta cùng nhau nhìn qua mô hình "chat room", một trong những khía cạnh quan trọng khi triển khai tính năng chat. Chú ý cách mà một comment được gửi bởi Client 1 được kết nối với Chat Server 1 được gửi đến Client 2 được kết nối vào Chat Server 2.

Như đã nhắc đến ở trên, một stream của người nổi tiếng thường sẽ có một lượng comments rất lớn. Một lượng lớn comments để đọc cũng là một thước đo quan trọng để đánh giá mức độ phổ biến của một live stream. Tuy nhiên quá nhiều comment có thể đặt một lượng tải lên cả phía server và phía client nơi mà comments được hiển thị. Giải pháp mà họ lựa chọn cho vấn đề này là chia người dùng vào các "chat room" riêng và các user chỉ có thể chat với các users chung room với mình. Các phòng chat được phân bố đều trong các máy chủ. Kết nối của users cũng được phân phối đều vào các máy chủ ngay cả khi họ ở cùng phòng chat này.

Để đạt được điều này, chat server được xây dựng dựa vào 3 đặc điểm dưới đây:

* WebSocket: Giao tiếp giữa client và server
* Akka toolkit: Công cụ để tổ chức xử lý song song.
* Redis: sử dụng redis để đồng bộ comments giữa các servers.
Và ở mục tiếp theo chúng ta sẽ cùng tìm hiểu chi tiết hơn về các đặc điểm này.

##### WEBSOCKET
Độ trễ thấp, giao tiếp 2 chiều giữa client và server trên cùng 1 kết nối sẽ được đảm bảo nếu như được triển khai bằng WebSocket. Thông qua việc sử dụng WebSocket, server có thể chủ động gửi comments về các users ngay khi cần. Không chỉ vậy việc client gửi một request HTTP là không còn cần thiết mỗi khi users gửi một comment, cho phép chúng ta sử dụng resource của thiết bị một cách hiệu quả.

Khi các messages được vận chuyển thông qua một kết nối duy nhất thì cả server và client đều cần phải biết định dạng của một payload mà xử lý payload cho phù hợp. Vì lý do này chúng ta không thể chia các định dạng khác nhau của response khác nhau như chúng ta vẫn hay thường làm với Web API. Tính năng live chat được triển khai sử dụng format JSON. Và chúng ta cần thêm vào một field chung để có thể ánh xạ tới một class tương ứng. Các tiếp cận này đã giúp họ dễ dàng thêm vào một loại payload mới, ví dụ như việc thực hiện gửi một món quá đã được mua trước đến chủ nhân của live stream.

Thình thoảng các kết nối chập chờ khi chúng ta xem một live stream dài trên một thiết bị di động. Để khắc phục các vấn đề về kết nối như thế họ cần phải có các gói tin để theo dõi tình trạng kết nối và kết nối lại khi nhận thấy mạng chập chờ.

##### AKKA TOOLKIT
Một trong những khía cạnh quan tọng của Akka actor system là các tổ chức cấu trúc giữa các actor và supervisors. Trước khi chúng ta thảo luận về kiến trức của server chat, trước hết hãy cùng nhau xem qua đặc điểm của một actor system. Chúng ta sẽ không nói về các kiến thức cơ bản của actor model ở đây.

##### ACTOR
Mỗi actor đều có trạng thái, hành vi riêng và được gán cho một mailbox dành cho việc đưa các message vào hàng đợi. Trạng thái của actor thì trong suốt với bên ngoài, tất cả sự tương tác với actors đều thông qua việc gửi message. Việc thực thi của actor được định nghĩa thông qua behavior khi actor nhận được message và gửi một messsage tiếp theo cho một actor khác.

![Actor](/assets/images/posts/2018-08-31/2_actor_message_passing.png)

Tất cả các message đều được xử lý bất đồng bộ (asynchronously). Hay nói cách khác, mỗi actor gửi đi một message trước đó, thì họ sẽ có thể nhận được một message trả lời vào thời điểm khác. Đó là chìa khóa của actor system để chia thành các đơn vị nhỏ xử lý song song hiệu quả. Điều này cho phép các actor xử lý từng phần nhỏ của công việc từng chút bằng cách gửi message qua lại trao đổi giữa các actors với nhau. Tuy nhiên nếu bạn thực hiện một thiết kế với lỗ hổng trong hệ thống actor với một đoạn code blocking không mong muốn, từ đó có thể gây nên việc tắc nghẽn mesages trong mailboxes. Do đó bạn cẩn phải cực kỳ cận thận khi gọi một API của bên thứ 3. Trong trường hợp xấu nhất toàn bộ luồng xử lý sẽ bị đứng lại, khi mà các actor không có thread để giữ cho chúng được tiếp tục process message.

Tuy nhiên, hệ thống Akka cũng có nhiều lợi ích rất đáng kể. Khái niệm về mỗi actor được giao cho một ligh-weight thread và chạy bằng thread đó vì thế sẽ không có trường hợp một actor được gọi bởi nhiều threads khác nhau tại cùng một thời điểm. Điều này có nghĩa là bạn sẽ không cần quan tâm về vấn đề thread-safe of actor state. Ngoài ra, cách phân cấp có supervisors đảm bảo cho khả năng chịu lỗi của hệ thống.

##### SUPERVISOR
Một khía cạnh đáng chú ý về vòng đời của một actor là actor chỉ có thể tạo ra bởi một actor khác. Điều đó có nghĩa là tất cả actor đều có mối quan hệ cha-con với một actor khác. Khi một actor tạo ra một actor khác, thì actor tạo sẽ trở thành cha (supervisor) và actor được tạo sẽ trở thành con. Theo lẽ đấy mỗi actor sẽ có một supervisor. Ngoài ra Akka actor system đề nghị một mô hình "let-it-crash". Nếu như actor con gặp một exception, thì sẽ đẩy lên actor cha, actor cha sẽ chịu trách nhiệm handle error. Dựa vào loại exception mà actor sẽ có lựa chọn phù hợp từ 4 chỉ dẫn sau:

* Restart: Khởi động lại actor. Tạo một instance mới của actor và xử lý tiếp tục message tiếp nằm trong mailbox.
* Resume: Tiếp tục xử lý message tiếp theo nằm trong mailbox. Trong khi "Restart" thì tạo ra một instance mới của actor. Thì "Resume" sẽ sử dụng lại chính actor đấy. "Restart" thì hữu dụng khi một actor không thể giữ lại trạng thái normal. Còn "Resume" sẽ thích hợp hơn khi bạn có thể continue.
* Stop: Dừng actor lại. Tất cả message đã nằm trong mailbox tại thời điểm đấy sẽ không còn được xử lý.
* Escalate: Khi actor cha không xử lý exception được ném ra bởi actor con, thì exception đó sẽ được đưa lên supervisor cao hơn.

![Actor](/assets/images/posts/2018-08-31/3_actor_lifecycle.png)

Cho phép các actor tiếp tục hay dừng lại là một trong những cách suy nghĩ về vòng đời của actor khi triển khai ứng dụng liên quan đến actors. Tuy nhiên khi các actors được tạo ra thì kết quả trả về là một liên kết đến actor đấy được gọi là "ActorRef". Điều này có nghĩa là ứng dụng chỉ có thể gửi message đến ActorRef và do đó không cần phải quan tâm về state của các actors cho dù nó "Restart" hay "Resume". Điều này không chỉ làm cho việc triển khai đơn giản hơn, đồng thời cho phép bạn xây dựng một hệ thống actor phân tán trên nhiều server mà không cần dụng đến code logic với khía cạnh actor cục bộ.

##### ACTOR SYSTEM CONFIGURATION ON CHAT SERVER
Dưới đây là mô tả đơn giản của kiến trúc tổng thể tập trung vào một actor riêng biệt.

![Actor individual](/assets/images/posts/2018-08-31/4_chat_actor_system.png)

Như bạn có thể thấy, trong hình có 3 loại actors - ChatSupervisor, ChatRoomActor, UserActor - tương tác với những actor khác để đẩy các comments của user. Vai trò của các actor tương ứng như sau:

* ChatSupervisor: Actor này tồn tại trong mỗi JVM. Mỗi JVM có chính xác một ChatSupervisor actor. Actor này phụ trách tạo và theo dõi các actor khác. Nó cũng định tuyển các message đến từ bên ngoài vào actor đích. Đây là actor cấp cao nhất. Nó không chứa logic và cũng không quan tâm đến việc xử lý tin nhắn cá nhân.
* ChatRoomActor: Actor này được tạo ra cho mỗi phòng chat. Các loại messages mà liên quan trong chat room - như gửi message comment hoặc là message chấm dứt actors. ChatRoomActor chịu trách nhiệm đẩy comment của user lên Redis để lưu trữ và đồng bộ (phân sau sẽ trình bày chi tiết hơn). Nó cũng gửi message đến các UserActor, là đích của các client muốn gửi đến.
* UserActor: Actor được tạo cho tất cả user kết nối vào hệ thống. Actor này nhận message từ ChatRoomActor và đẩy message về phía client theo kết nối WebSocket.
Tới giờ, tác giả đã giải thích Redis làm việc với chat room như thế nào và làm thế nào mà UserActor gửi payload thông qua kết nối WebSocket. Như tác giả có đề cập trước đó, một trong những thứ rất quan trọng là không nên kích hoạt một lời gọi hàm blocking trong một actors. Trong trường hợp hiếm hoi khi mà việc gọi một hàm blocking là cần thiết, chúng ta sử dụng phương thức bất đồng bộ càng nhiều càng tốt để trách việc lạm dụng thread của một actor.

##### USING REDIS CLUSTER PUB/SUB
Tính năng chat sử dụng Redis Cluster cho việc đồng bộ comments giữa server và cho việc lưu tạm comments và các thông tin phụ trợ.

##### COMMENT SYNCHRONIZATION
Như tác giả đã giải thích về việc chat room có thể được chia ra tùy thuộc vào số lượng user và user có thể được phân phối trên nhiều máy chủ ngay cả khi họ ở cùng một phòng. Tuy nhiên khi các room được trãi rộng trên nhiều servers, thì bạn cần tìm cách để đồng bộ comments giữa các servers. Akka toolkit cung cấp một vài tính năng for vụ này bạn có thể tham khảo sử dụng thử Akka Cluster hoặc triển khai một cơ chế event bus. Tuy nhiên với Akka Cluster, bạn cần phải giải quyết các vấn đề về các node phân tán. Tương tự như cậy, việc sử dụng một event bus sẽ làm cho việc triển khai trở nên phức tạp hơn rất nhiều. Vì những lý do đó, sau khi tìm kiếm một công cụ mà vừa dễ dàng triển khai vừa dễ dàng vận hành, thì họ đã chọn Redis Pub/Sub. Từ những mô hình dưới đây bạn sẽ hiểu rõ hơn. Các Users từ cùng một room sẽ kết nối tới những servers khác nhau và tất cả những comments phát sinh ra sẽ được đồng bộ thông qua cơ chế Pub/Sub của Redis.

![Redis Pub/Sub](/assets/images/posts/2018-08-31/5_redis_pubsub.png)


##### USING HIGH-SPEED KVS
Một trong những lý do khác cho việc lựa chọn Redis Cluster là tính dễ dàng mở rộng và tính sẵn sàng cao. Redis được sử dụng một mục đích lưu trữ tạm thời comments và các tính toán khác. Lý do đăng sau phương pháp này là để đối phó với sự gia tăng nhanh chóng của lượng comments. Trong khi việc live-streaming diễn ra, Redis Cluster server là một service lưu trứ key/value với tốc độ cao được dùng để lưu trữ comments và các gift của users. Khi một live-stream kết thúc, thì toàn bộ data sẽ được đưa xuống hệ thống lưu trữ MySQL. Redis lưu trữ các events trong một tập hợp được sắp xếp theo thời gian. Điều này đặc biệt hữu ích cho việc hiển thị hàng chục events gần nhất khi người dùng mới tham gia vào một phòng chat. Các events này sau đó sẽ được lữu trữ lại trong một table bình thường của MySQL.

##### REDIS CLIENTS
Hiện tại có rất nhiều thư viện hỗ trợ Redis mà bạn có thể sử dụng. Tài liệu của Redis thì có gợi ý Jedis, lettuce và Redisson. Tính năng chat của họ thì quyết định sử dụng lettuce vì những lý do sau:

* Hỗ trợ Redis Cluster
* Hỗ trợ Master/Slave failover và MOVE/ASK redirects, giữ thông tin của các node và hash slot trong cache và cập nhật.
* Cung cấp API bất đồng bộ
* Hỗ trợ failover cho kết nối Pub/Sub
* Vẫn còn được duy trì phát triển
Một lần nữa là việc cung cấp API bất đồng bộ là rất quan trọng để ngăn chặn bất kỳ một hoạt động blocking diễn ra bên trong Akka actors. Ngoài ra, khi sử dụng Pub/Sub cho ChatRoomActor, họ cần theo dõi số lượng kết nối Subcribe để đảm bảo rằng ChatRoomActors giữ đăng ký của họ kể từ khi bắt đầu cho đến khi kết thúc. Lettuce có một tính năng với tên là ClusterClientOptions. Khi thiết lập chính xác, tính năng này có thể phát hiện khi một node down và refresh lại kết nối khi node đấy kết nối trở lại. Một lợi ích khác của việc sử dụng lettuce là số lượng kết nối để Subcribe tới các node là ít nhất.

##### CLOSING WORDS
Để chốt lại bài giới thiệu của tác giả cho tính năng LIVE LIVE chatting.

* WebSocket: Trao đổi messages 2 chiều giữa client và server.
* Akka toolkit: Công cụ để tổ chức xử lý song song giữa các servers.
* Redis: Dùng để lưu trữ tạm dữ liệu và đồng bộ comments giữa các servers sử dụng cơ chế Pub/Sub.
Có 3 điểm chính cần nhớ.

Như có đề cập khi bắt đầu, tính năng chat hiện tại đang được vận hành trên hơn 100 servers. Như một hệ quả, đôi khi chúng ta gặp phải các vấn đề đối với thư viện của bên thứ 3 trong khi phân phối một lượng lớn các comments. họ tạo ra các issues trên GitHub để trao đổi, sữa chữa và cải tiến với cộng đồng. Trong một ví dụ gần đây, một số dấu hiệu của sự cố đã được phát hiện xuất phát từ thư viện của lettuce sau khi một nodes với được thêm vào hệ thống Redis Cluster. Và họ cũng đã báo [issue qua GitHub](https://github.com/mp911de/lettuce/issues/340) và cũng được cập nhật fixbug.

Cảm ơn các bạn đã theo dõi.


[Dịch từ techblog của Line](https://web.archive.org/web/20161201220307/http://developers.linecorp.com:80/blog/?p=4015)

Proof: https://web.archive.org/web/20170117054230/https://botbie.io/topic/50/xay-dung-backend-o-soundcloud-phan-3-su-dung-scala-va-finagle-xay-dung-microservices