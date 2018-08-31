---
layout: post
cover: 'assets/images/covers/soundcloud-icon.png'
title: Xây dựng backend ở SoundCloud
date: 2018-08-31
tags: [architect, bài dịch, backend, soundcloud]
author: tiennv147
description: >
    Building Products at SoundCloud 
---


#### Phần 1: Xử lý kiến trúc cũ để xây dựng backend ở SoundCloud

Hầu hết các thành phần backend của SoundCloud’s đều được viết bằng ngôn ngữ Scala, Clojure, hay JRuby, nhưng không phải tất các trường hợp đều như thế. Cũng giống như các công ty công nghệ khởi nghiệp khác, Soundcloud đã xây dựng một backend duy nhất bằng ngôn ngữ Ruby on Rails chạy trên MRI, một trình thông dịch chính thức của Ruby. Họ sử dụng MySQL để lưu trữ cơ sở dữ liệu, tăng tốc độ truy vấn bằng cách sử dụng Memcached để caching dữ liệu.

Ở SoundCloud trong các buổi nói chuyện họ hay gọi hệ thống này bằng một cái tên khá kêu: “Tàu Mẹ” (Mothership). Một kiến trúc như thế đã tỏ ra là một giải pháp tốt để xây dựng một sản phẩm mới được sử dụng bởi hàng trăm nghìn nghệ sĩ trên khắp thế giới để chia sẽ những bài hát, những bản nháp ra cộng đồng yêu âm nhạc.

Mã nguồn lập trình trên Rail chứa tất cả các API Public, mở ra để hàng nghìn các dịch vụ khác sử dụng, và luôn cả phần web application của Soundcloud.com. Với việc ra mắt phiên bản kế tiếp The Next SoundCloud vào năm 2012, họ đã đưa một tập API và được sử dụng chung cho tất cả các phiên bản iOS/Android, ứng dụng web trên trang soundcloud.com, bao gồm luôn các dịch vụ khác của đối tác và các nhà phát triển.

![alt](/assets/images/posts/2018-08-31/product-engineering-diagram-1-08b8fce10d63d1c3fa73732bc8cf3ede.jpg)

Vào thời điểm đấy, cứ mỗi phút trôi qua thì có 12 giờ âm nhạc được tải lên, và hàng trăm triệu người dùng nền tảng này mỗi ngày. Soundcloud phải đối mặt với những thách thức mở rộng hệ thống cả về mạng xã hội lẫn nền tảng phân phối âm nhạc.
Để mở rộng nền tảng dưa trên Rails đến mức đấy, họ phát triển và đóng góp cho cộng đồng khá nhiều thư viện cũng như các công cụ để giúp xử lý:

* [Các vấn đề về chuyển dữ liệu giữa các database](https://github.com/soundcloud/lhm)
* [Tối ưu truy xuất database trên Rails](https://github.com/soundcloud/master_slave_adapter)
* [Sử lý một lượng lớn message](https://github.com/soundcloud/empipelines)
* Và [nhiều công cụ khác](https://github.com/soundcloud)

Cuối cùng họ quyết định là phải thay đổi cách mà họ xây dựng backend, vì họ luôn cảm thấy mình chỉ đang chấp vá hệ thống và không giải quyết triệt để vấn đề mở rộng hệ thống ở mức cơ bản.
Việc đầu tiên cần phải làm là thay đổi kiến trúc của hệ thống. Họ quyết định chuyển sang hướng thiết kế kiến trúc [microservice](http://martinfowler.com/articles/microservices.html) . Trong cách thiết kế này, kỹ sư phải chia nhỏ hệ thống lớn thành những thành phần rất nhỏ. Mỗi thành phần phải được thiết kế sao cho xử lý trọn vẹn nghiệp vụ mà nó đảm nhận - bao gồm luôn cả tầng lưu trữ dữ liệu cũng như nền tảng mà nó cần (tham khảo thêm về [Bounded Context](http://martinfowler.com/bliki/BoundedContext.html))

##### Mô hình microservices

Sự tái thiết kế lớn như thế đã mang đến rất nhiều khó khăn cho họ trong quá khứ, vì thế cả team quyết định cách tốt nhất để tiếp cận để đối phó với những thay đổi về kiến trúc là sẽ không chia “Tàu Mẹ” ra ngay lúc đấy, nhưng cũng sẽ không thêm bất cứ tính năng gì mới vào. Tất cả những tính năng mới sẽ được xây dựng theo mô hình microservices, và khi có một tính năng cần có sự thay đổi lớn của “Tàu Mẹ” thì họ sẽ cố gắn mang thành phần đó ra từ “Tàu Mẹ” trong nổ lực chia nhỏ hệ thống thành từng phần nhỏ.

Một sự bắt đầu khá tốt, nhưng chẳng bao lâu sau họ phát hiện ra một vấn đề: Bởi vì hầu hết các nghiệp vụ của họ vẫn còn nằm trong khối Rails, và các thành phần được xây dựng mới phải giao tiếp với cục backend cũ theo một cách nào đó.

Một trong những lựa chọn xung quanh vấn đề này là để các microservices truy cập trực tiếp vào cơ sơ dữ liệu của “Tàu Mẹ”. Đây là một trong những cách tiếp cận rất phổ biến , bởi vì cơ sở dữ liệu là dùng chung, nhưng nó không phải là như nhau đối với các service khác nhau. Đều này dẫn đến khá nhiều vấn đề khi chúng ta cần thay đổi cấu trúc của table dùng chung đó.

Thay vào đó, họ đã đưa ra một bộ API dùng chúng, và các microservices nội bộ cũng sẽ hành xử tương tự nhưng các ứng dụng của bên thứ ba tích hợp vào hệ thống của Soundcloud.

![alt](/assets/images/posts/2018-08-31/product-engineering-diagram-2-2da8994f1d05bae59d82fa8bc6a4e71d.jpg)


Một vấn đề lớn nữa họ phải đối mặt sau khí xử dụng mô hình như trên, đó là các microservice của họ cần phải phản ứng lại đối với những hành động của người dùng. Ví dụ như hệ thống push-notification, nó cần phải biết khi có bất bình luận nào một ca khúc và nó sẽ thông báo cho các nghệ sĩ sở hữu ca khúc đấy. Với nhu cầu mở rộng lớn như vậy thì các polling sẽ không thể là một giải pháp tốt. Họ cần phải tạo ra một mô hình tốt hơn để giải quyết bài toán này.

Và như thế họ đã sử dụng AMQP (một hệ thống nhận message và push cho worker), cụ thể đó là RabbitMQ - Với một ứng dụng viết bằng Rails bạn cần một cách nào đáy đẩy message một cách chậm rãi tới các worker để tránh các vấn đề về xử lý đồng thời (một điểm yếu của trình thông dịch Ruby) bạn có thể tham khảo thêm bài viết chi tiết về vấn đề xử dụng AMQP [ở đây](https://www.infoq.com/presentations/amqp-soundcloud), thông qua nhiều phát triển và thử nghiệm họ tạo ra một mô hình gọi là: Semantic Events, khi có sự thay đổi trên dữ liệu được xác định sự thay đổi đấy sẽ được gửi đến một worker trung gian, sau đó worker trung gian sẽ gửi sự thay đổi này đến các microservices liên quan.

![alt](/assets/images/posts/2018-08-31/product-engineering-diagram-3-5d8570410fc6fd538e56fb35c08311a9.jpg)

Kiến trúc này kích hoạt mô hình [Event Sourcing](http://martinfowler.com/eaaDev/EventSourcing.html), đó là cách mà họ xử lý vấn đề chia sẽ dữ liệu, nhưng khi dùng kiến trúc này nó vẫn cần sử dụng các API từ “Tàu Mẹ”. Ví dụ như nó vấn cần sử dụng API để lấy danh sách các fan của nghệ sĩ cùng địa chỉ email để thống báo cho họ biết khi nghệ sĩ của họ cập nhật một bài hát mới.

Trong khi hầu hết các dữ liệu đã có sẵn thông qua các API, họ lại bị ràng buộc bởi những qui tắc mà họ đặt ra cho các dịch vụ của bên thứ 3. Ví dụ như đối với một microservice để thông báo cho người dùng về những hoạt động mà được thiết lập ở mức riêng tư thì nó không thể truy xuất được bởi vị các API đấy chỉ có thể truy xuất thông tin công cộng.

Và họ đã tìm ra một số giải pháp để xử lý vấn đề đấy, một trong những cách phổ biến đó là tách những models của Rails từ “Tàu Mẹ” và đưa nó trở thành phần chia sẽ. Một số vấn đề quan trọng trong cách tiếp cận này đó là chi phí quản lý sự đồng bộ của các models đấy ở các microservices khác nhau, và rõ ràng là khi các microservices đấy viết bằng các ngôn ngữ khác thì chi phí đó càng cao lên. Do đó họ cần phải suy nghĩ về một giải pháp khác tốt hơn.

Cuối cùng họ quyết định sử dụng tính năng của Rails engine để triển khai các API nội bộ và chỉ các ứng dụng trong mạng nội bộ mới có thể truy xuất được. Để điều khiển việc này họ sử dụng Oauth 2.0 để xác thực các ứng dụng.

![alt](/assets/images/posts/2018-08-31/product-engineering-diagram-4-87b0bd948d36defb5ecb639220a365b5.jpg)


Họ đã nổ lực không ngừng để mang các tính năng từ “Tàu Mẹ” ra ngoài microservice bằng cách xử dụng cả 2 giải pháp là push và pull để tương tác với hệ thống củ. Các kiến trúc của microservice đã tỏ ra rất quan trọng để phát triển các tính nắng mới với chu trình phát triển ngắn hơn rất nhiều.

---

#### Phần 2: Phá vỡ hệ thống cũ để xây dựng backend ở SoundCloud

##### Đội kỹ sư ở SoundCloud
Ở phần I, chúng ta đã cùng tìm hiểu về việc đội kỹ sư ở SoundCloud xây dựng các microservice với ngôn ngữ Scala, Clojure, và Ruby mà không có sự gắn kết chặt chẽ với hệ thống cũ của họ dựa trên Rails. Sau đó việc thay đổi kiến trúc như vậy làm cho họ có thể tự do xây dựng những tính năng mới và nhiều cải tiến rất linh hoạt. Một câu hỏi khá quan trọng là: Làm thế nào để họ tách những tính năng từ một cục nguyên khối viết trên Rails hay họ gọi là “Tàu Mẹ”?

Tách một hệ thống cũ ra không phải một chuyện dễ dàng, nhưng may mắn là chúng ta có rất nhiều open-source và các công cụ hỗ trợ dể làm chuyện đấy.

Bước đầu tiền cần làm đó là xác định cũng thành phần mà chúng ta cần tách ra. Ở SoundCloud, họ quyêt định sử dụng phong cách thiết kế theo hướng [Bounded Context](http://www.amazon.com/gp/product/0321125215/ref=as_li_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=0321125215&linkCode=as2&tag=fragmental-20&linkId=ZQCEXWYXNZ5AA2WS). Một ví dụ rõ ràng về Bounded Context là chức năng nhắn tin giữa những người dùng trên SoundCloud, đây là một thành phần toàn mà bộ tính năng của nó có tính gắn kết cao và không liên quan nhiều đến phần còn lại của hệ thống, và nó chỉ nắm giữ các liên kết yếu đến phần còn lại của dữ liệu.

Sau khi đã xác định các Bounded Context, nhiệm vụ kế tiếp là tìm cách tách chúng ra khỏi “Tàu Mẹ”. Không may thay Rails ActiveRecord framework dẫn đắt cách thiết kế kiến trúc rất gắn kết. Một đoạn code mẫu theo cách thiết kế đấy như sau:
```
def index
  if (InboxItem === item)
    respond mailbox_items_in_collection.index.paginate(:page => params[:page])
  else
    respond mailbox_items_in_collection.paginate(
      :joins => "INNER JOIN messages ON #{safe_collection}_items.message_id = messages.id",
      :page  => params[:page],
      :order => 'messages.created_at DESC')
  end
end
```
Bởi vì họ muốn tách chức năng nhắn tin như một Bounded Context ra một microservice, họ cần phải làm cho code trên trở nên linh động hơn. Bước đầu tiên cần phải làm cấu trúc lại code theo cách như này (bạn có thể tham khảo thêm về tư tưởng xử lý các thành phần lỗi thời ở đây: [Working Effectively with Legacy Code](http://www.amazon.com/gp/product/0131177052/ref=as_li_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=0131177052&linkCode=as2&tag=fragmental-20&linkId=5KPGXJ7FUWPGJR3K))
```
def index
  conversations = cursor_for do |cursor|
    conversations_service.conversations_for(
    current_user,
    cursor[:offset],
    cursor[:limit])
  end

  respond collection_for(conversations, :conversations)
end
```
Phiên bản đầu tiên của phương thức conversations_service#conversations_for không có sự khác biệt với bản ở trên là bao; chức năng của nó tương tự như những gì làm trên ActiveRecord.

Họ đã sẵn sàng để tách phần chức năng này ra thành một microservice mà không cần có nhiều sự thay đổi ở tầng Controller và Presentation. Đầu tiên họ thực hiên thay thế phần conversations_service#conversations_for bằng cách gọi service thông qua http request:
```
def conversations_for(user, offset = 0, limit = 50)
  response = @http_client.do_get(service_path(user), pagination(offset, limit))
  parse_response(user, response)
end
```
Họ cố gắn tránh sự thay đổi quá lớn nhiều nhất có thể , và với yêu cầu đấy học buộc phải để các microservices làm việc với “Tàu Mẹ” trong một khoản thời gian dài và trong khi đó họ sẽ tranh thủ để mang logic ra ngoài các microservice mới.

Như có mô tả trước đây họ không muốn sử dụng cơ sở dữ liệu của “Tàu Mẹ” như là nơi các microservice tương tác với hệ thống củ. Họ sẽ tổ chức cơ sở dữ liệu như là một ứng dụng và xây dựng các service để tích hợp và điều đấy buộc họ phải tìm cách đồng bộ dữ liệu giữa các microservice sử dụng nó.

Mặc dù dự định là như vậy nhưng mà họ vẫn phải sử dụng cơ sơ dữ liệu từ “Tàu Mẹ” trong giai đoạn chuyển tiếp.

Điều này mang lại hai vấn đề khá quan trọng. Trong khi giai đoạn chuyển tiếp hoàn tất, các microservice mới không thể đổi cấu trúc của các bảng trong MySQL, thậm chí tệ hơn là phải sử dụng một hệ thống lưu trữ mới. Một ví dụ cho trường hợp này đó là hẹ thống nhắn tin từ người dùng này đến người dùng khác, nó được xây dựng dưa trên mô hình thread-based và được thay thế bằng một cái khác, họ phải có những crobjobs để giữa cho 2 database dược đồng bộ.

Một vấn đề khác liên quan đến hệ thống Semantic Events được mô tả ở phần I. Các hệ thống của họ được thiết kế để khi có sự thay đổi trên dữ liệu (ví dụ 1 người dùng comment vào một bài nhạc nào đấy) thì sẽ phát ra các events đến các microservice liên quan, hệ thống hiện tại chỉ cho phép event được phát ra từ một hệ thống, bởi vì họ không thể để cả “Tàu Mẹ” và các microservice mới cùng phát ra những event, và vì thế họ đã chỉ chuyển đổi sang hệ thống microservice mới khi mà họ đã hoàn tất các tính năng như của “Tàu Mẹ”. Với chiến lược này họ đã gặp ít vấn đề hơn họ nghĩ, tuy nhiên vì ưu tiên làm sao để ít có tác động tới hệ thống đang chạy nên việc chuyển đổi bị hạn chế, không diễn ra nhanh chóng được.

Bằng cách sử dụng cách này họ đã chuyển hầu hết các chức năng của “Tàu Mẹ” ra các microservices. Hiện tại họ đã xây dựng hệ thống nhắn tin giữa người dùng hoàn toàn độc lập với hệ thống cũ (bạn có thể tham khảo [ở đây](https://blog.soundcloud.com/2014/01/13/hear-whats-happening-new-messaging/))

Ở phần tiếp theo chúng ta sẽ cùng theo dõi họ đã sử dụng Scala & Finagle như thế nào để xây dựng các microservice.

---

#### Phần 3: Sử dụng Scala và Finagle xây dựng Microservices ở SoundCloud
##### Ruby on Rails
Ở hai phần trước, chúng ta đã cũng xem cách mà các kỹ sư ở SoundCloud mang các tính năng từ một cục nguyên khối dùng Ruby on Rails ra thành các microservices. Và trong phần này chúng ta sẽ đi vào chi tiết hơn về nền tảng và ngôn ngữ mà họ sử dụng dể triển khai các microservices đấy.

Vào thời điểm họ bắt đầu quá trình xây dựng các hệ thống bên ngoài "Tàu Mẹ" (Rails monolith), họ cũng chia nhỏ đội kỹ thuật ra thành nhiều nhóm nhỏ, và mỗi nhóm nhỏ sẽ phụ tránh một phần nhỏ nằm trong toàn bộ hệ thống của SoundCloud.

Đó là một giai đoạn thử nghiệm lớn, thay vì xác định một ngôn ngữ mà toàn bộ thành viên sẽ sử dụng chung, thì họ cho phép bất cứ ngôn ngữ nào mà developer cảm thấy tự tin để đưa vào sản phẩm, thì developer cứ thoãi mái sử dụng chúng.

Điều này dẫn đến một vụ [bùng nổ của ngôn ngữ](https://en.wikipedia.org/wiki/Cambrian_explosion). Họ có những hệ thống được phát triền từ nhiều ngôn ngữ khác nhau từ Perl cho đến Julia, bao gồm luôn cả Haskell, Erlang và node.js

Trong khi quá trình này tỏ ra khá hiệu quả trong việc tạo ra các hệ thống mới, thì họ bắt đầu gặp vấn đề khi vận hành và bảo trì chúng. Vấn đề về việc kế thừa những gì đã làm khi có một thành viên trong team rời khỏi là rất thấp (xem thêm [khái niệm bus factor](https://en.wikipedia.org/wiki/Bus_factor)), và cuối cùng họ đã quyết định củng cố lại các công cụ mà họ sử dụng.

##### Java Virtual Machine
Dựa trên sở thích và kiến thức chuyên môn của mỗi nhóm, kết hợp với đánh giá của cộng đồng và các đồng nghiệp, họ đã quyết định gắn bó với JVM (Java Virtual Machine) họ lựa cho JRuby, Clojure và Scala là các ngôn ngữ chính được sử dụng để phát triển tất các sản phẩm. Các công cụ để quản lý và vận hành thì họ sử dựng Go và Ruby.

Hóa ra việc lựa chọn nền tảng và ngôn ngữ chỉ là một bước nhỏ trong quá trình xây dựng sản phẩm theo kiến trúc microservice. Một khía cạnh khá quan trọng khác trong việc tổ chức các microservices là: giao tiếp giữa các microservices (RPC), khả năng phục hồi (resilience), và xử lý đồng thời giữa các microservices (concurrency).

Sau khi tìm hiểu và tạo ra một vài bản mẫu thì họ kết thúc với ba sự lựa chọn:

* Sử dụng thuần Netty để triển khai.
* Sử dụng bộ sậu của Netflix.
* Cuối cùng là bộ sậu Finagle.

Việc sử dụng thuần Netty khá là hấp ở giai đoạn ban đầu, với hướng đi này có rất nhiều tài liệu tốt để nghiên, sự cập nhật từ cộng đồng, có hỗ trợ HTTP, giao thức để thực hiện gọi qua các microservice khác khá tốt. Nhưng sau một thời gian họ cảm thấy họ phải bắt đầu xây dựng lại hầu hết các tính năng của hệ thống như: khả năng phục hồi và xử lý đồng thời giữ các microservices. Với yêu cầu như thế họ muốn sử dụng những thứ đã có sẵn hơn là đi phát minh lại bánh xe.

##### Finagle
Họ chuyển qua thử sử dụng bộ sậu của Netflix như [Hystrix và Clojure](http://blog.josephwilk.net/clojure/building-clojure-services-at-scale.html). [Hytrix](https://github.com/Netflix/Hystrix) đã thể hiện rất tốt khả năng xử lý đồng thời và phục hồi khi có lỗi, nhưng những API của nó đều dựa trên [mẫu thiết kế Command](https://github.com/Netflix/Hystrix/wiki/How-To-Use). Theo kinh nghiệm của họ thì các command của Hystrix không thuận tiện để tạo command mới lắm trừ khi bạn sử dụng [RxJava](https://github.com/ReactiveX/RxJava). Mặc dù họ đã sử dụng thư viện này ở một số hệ thống backend và ứng dụng Android, nhưng họ nghĩ lập trình theo hướng reactive không phải là hướng tiếp cận tốt nhất cho mọi trường hợp.

Sau đó họ chuyển qua sử dụng [Finagle](http://twitter.github.io/finagle/), một cách xây dựng giao thức giao tiếp giữa các microservices (RPC: Remote Procedure Call) được pháp triển bởi Twitter và sử dụng bởi nhiều công ty có quy mô như SoundCloud. Finagle làm rất tốt các yêu cầu mà họ đề ra ban đầu, và hướng thiết kế của nó cũng khá quen thuộc và dễ dàng mở rộng (xem thêm về [Pipes and Filters](http://www.enterpriseintegrationpatterns.com/patterns/messaging/PipesAndFilters.html) và [Futures Model](http://docs.scala-lang.org/overviews/core/futures.html))

Vấn đề đầu tiên khi họ sử dụng Finagle là: trái ngược với các lựa chọn thay thế khác, Finagle được viết bằng Scala, và được chạy trên JVM cùng với các ứng dụng viết bằng Clojure và JRuby, họ nghĩ rằng điều này không quá quan trọng, chỉ thêm khoản 5MB vào vùng chuyển đổi các thư viện, việc chạy runtime khá ổn định và ít thay đổi.

Vấn đế lớn hơn đó là việc chuyển đổi framework để phù hợp với hệ thống của họ:

* Twitter sử dụng Thrift cho hầu hết các RPC của họ, còn ở SoundCloud thì dùng HTTP.
* Twitter sử dụng ZooKeeper để phục vụ cho Discovery Service, ở SoundCloud thì dùng DNS.
* Twitter sử dụng Java properties cho hệ thống configuration, ở SoundCloud thì dùng biến môi trường.
* Twitter và Soundclound có hệ thu thập log khác nhau và monitor khác nhau.

May mắn thay, Finagle được thiết kế rất tốt cho việc thay thế các thành phần trong framework bằng các hệ thống khác, hầu hết các vấn đề được giải quyết với những thay đổi rất nhỏ.

Sau đó họ lại phải đối mặt với sự lộn về cơ chế Futures trong Scala. Heather Miller thành viên của core team Scala có giải thích cụ thể về vấn đề này qua bài presentation: [A Bright Future Full of Promise](https://www.infoq.com/presentations/Asynchronous-Scala-Java). Tóm lại các chế về Futures và Promises mà SoundCloud đang sử dụng có sự khác biệt giữa Finalge của Twitter và thuần của Scala. Mặc dù Scala cho phép sự tương thích giữa các cơ chế nhưng các bạn developer ở SoundCloud quyết định sử dụng toàn bộ cơ chế về [Futures & Promise của Twitter](https://groups.google.com/forum/#!msg/finaglers/wjADYhoiJKM/Ejqd6A9rahMJ) và dành phần lớn thời gian để [giúp Fingale tiến về gần hơn](https://github.com/twitter/util/pull/97) với phiên bản mới nhất của Scala.

##### Thrift, Memcached, Redis và MySQL
Cùng với những vấn đề được giải quyết, họ tập trung vào việc làm thế nào để phát triển backend tốt nhất với việc sử dụng Finagle. May mắn là triết lý thiết kế của Finagle khá độc đáo và được phát triển bởi Marius Eriksen, một trong những thành viên gạo cội của Finalge, các bạn có thể tham khảo thêm về bài viết của Marius về triết lý [Your Server as a Function](https://monkey.org/~marius/funsrv.pdf). Bạn không cần phải tuân thủ theo những triết lý này khi bạn sử dụng chúng, nhưng theo kinh nghiệm của anh em devs tại SoundCloud thì nếu tuân theo triết lý đấy thì việc tích hợp và sẽ trở nên mượt mà hơn. Nếu bạn sử dụng Functional Programing trên Scala thì việc theo các nguyên tắc ấy lại càng dễ dàng.

Ở SoundCloud họ sử dụng Finagle cho HTTP, Thrift, Memcached, Redis và MySQL. Mỗi request đến SoundCloud thì ít nhất phải đi qua một microservices có sử dụng Finagle, và hiệu quả của nó thật sự khá tuyệt vời.

---
Hẹn gặp các bạn ở những bài blog tiếp theo.

Source: Tech Blog SoundCloud

[Building Products at SoundCloud —Part I: Dealing with the Monolith](https://developers.soundcloud.com/blog/building-products-at-soundcloud-part-1-dealing-with-the-monolith)

[Building Products at SoundCloud—Part II: Breaking the Monolith](https://developers.soundcloud.com/blog/building-products-at-soundcloud-part-2-breaking-the-monolith)

[https://developers.soundcloud.com/blog/building-products-at-soundcloud-part-3-microservices-in-scala-and-finagle](https://developers.soundcloud.com/blog/building-products-at-soundcloud-part-3-microservices-in-scala-and-finagle)

Proof of work:
[The web archive](https://web.archive.org/web/20170117054230/https://botbie.io/topic/50/xay-dung-backend-o-soundcloud-phan-3-su-dung-scala-va-finagle-xay-dung-microservices)

[FB ref](https://vi-vn.facebook.com/babyrobots/posts/1023456101024609)