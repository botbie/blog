---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Bảo mật MongoDB - tấn công injection với php
date: 2016-06-05
tags: [mongodb, injection]
author: nguquen
description: >
  Trước khi chúng ta thực hiện MongoDB injection, chúng ta cần phải hiểu MongoDB chính xác là cái gì và tại sao chúng ta dùng nó thay vì các database khác. MongoDB không dùng SQL nên người ta cho rằng nó không thể bị tấn công bởi các loại injection. Nhưng hãy tin tôi, không ai được sinh ra với khía cạnh bảo mật sẵn có. Chúng ta phải thi công vài logic để chống lại khi bị tấn công.
---

Trước khi chúng ta thực hiện MongoDB injection, chúng ta cần phải hiểu MongoDB chính xác là cái gì và tại sao chúng ta dùng nó thay vì các database khác. MongoDB không dùng SQL nên người ta cho rằng nó không thể bị tấn công bởi các loại injection. Nhưng hãy tin tôi, không ai được sinh ra với khía cạnh bảo mật sẵn có. Chúng ta phải thi công vài logic để chống lại khi bị tấn công.

**MongoDB là gì?**

Một cách ngắn gọn, MongoDB là một database nguồn mở được phát triển bởi MongoDB Inc., nó chứa data trong những document giống JSON. Nó chứa những thông tin liên quan với nhau để truy vấn nhanh thông qua ngôn ngữ truy vấn MongoDB.

**Tại sao lại dùng MongoDB?**

Chỉ bởi vì mọi người muốn kết quả nhanh khi truy vấn, và MongoDB thuộc loại phổ biến nhất. Nó có hiệu suất cao (1000 millionsqueries/sec). Một lý do khác lý giải vì sao MongoDB quá phổ biến là vì nó vượt trội trong nhiều trường hợp mà database quan hệ không làm tốt. Ví dụ, các ứng dụng với dữ liệu phi cấu trúc, bán cấu trúc và đa hình, cũng như những ứng dụng với yêu cầu khả năng mở rộng lớn hoặc triển khai với multi-data center.

**Hãy cùng xem qua các injection**[more]

Trong trường hợp đầu tiên chúng ta có một script PHP hiển thị username và password tương ứng với một id cụ thể.

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_1.png)
![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_2.png)

Trong script trên bạn có thể thấy tên của database là *security*, và tên của collection là *users*. Tham số *u_id* được lấy từ phương thức GET, sau đó nó được truyền vào một array. Trông có vẻ tốt nhỉ? Hãy thử đặt vài toán tử so sánh vào array này.

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_3.png)

Ồ!! Nó đã dump toàn bộ database cho chúng ta. Bạn có thể thấy được vấn đề ở đâu không? Nó xảy ra bởi vì input này: http://localhost/mongo/show.php?u_id[$ne]=2
đã tạo ra câu truy vấn mongodb sau:
```
$qry= array(“id” => array(“$ne” => 2))
```
Cho nên nó hiển thị tất cả kết quả ngoại trừ *id=2.*

Hãy xem một trường hợp khác, trong đó script làm cùng một công việc như script trên, nhưng lần này chúng ta tạo câu truy vấn mongodb bằng phương thức findOne.
Đầu tiên chúng ta xem qua cách làm việc của phương thức findOne. Phương thức này có cú pháp như sau:
```
db.collection.findOne(query, projection)
```
Nó trả về document thoả mãn điều kiện truy vấn. Ví dụ nếu chúng ta cần tìm kết quả được liên kết với *id=2*, câu lệnh sau sẽ được thực hiện.

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_4.png)

Bây giờ hãy nhìn vào source code:

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_5.png)

Điểm quan trọng ở đây đó là tìm cách phá vỡ câu truy vấn và sau đó fix nó lại. Bạn có thể đoán điều gì sẽ xảy ra với câu truy vấn sau không?
```
http://localhost/mongo/inject.php?u_name=dummy’});return{something:1,something:2}}//&u_pass=dummy
```
Nó sẽ phá vỡ câu truy vấn và trả về tham số mong muốn:

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_6.png)

Nó văng ra  2 lỗi, đó là vì chúng ta muốn truy cập hai tham số không thực sự tồn tại. Một cách gián tiếp nó đã cho chúng ta biết *username* và *password* là những tham số trong database, và đó là những gì chúng ta cần.

Khi chúng ta gõ đúng tham số thay vì *something*, lỗi sẽ không còn nữa.

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_7.png)

Bây giờ giả sử chúng ta muốn tìm tên của database. Trong mongodb, phương thức **db.getName()** được dùng để tìm tên của database. Cho nên câu truy vấn sẽ như sau:

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/Screenshot_8.png)

Để dump được database, chúng ta cần phải tìm được tên của các collection. Phương thức **db.getCollectionNames()** được sử dụng để tìm tên của các collection trong MongoDB.

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/Screenshot_9.png)

Cho đến hiện tại chúng ta đã có được tên của database và các collection. Phần còn lại là lấy được dữ liệu trong collection *users*, chúng ta có thể làm như sau:

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_10.png)

Tương tự chúng ta có thể có được những username và password khác bằng cách thay đổi tham số bên trong hàm **db.users.find()[2]**, giống như sau:

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_11.png)

Bây giờ khi bạn đã quen thuộc với mongodb injection, có thể bạn sẽ muốn biết về cách chống lại kiểu injection này.

Hãy xem lại trường hợp đầu tiên khi tham số được truyền vào một array. Để chống lại kiểu injection này, chúng ta cần dừng việc thực thi của toán tử so sánh bên trong array. Cho nên một trong những giải pháp đó là sử dụng hàm **implode()** theo cách sau:

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_12.png)

Hàm **implode()** trả về một chuỗi từ những phần tử của một array. Vì vậy chúng ta chỉ lấy được một kết quả tương ứng với id cụ thể thay vì tất cả kết quả.

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_13.png)

Trong trường hợp thứ hai chúng ta có thể sử dụng phương thức **addslashes()** , bằng cách này câu truy vấn sẽ không thể bị phá vỡ bởi kẻ tấn công. Tuy nhiên dùng regular expression để thay thế những ký tự đặc biệt cũng là một ý tưởng tốt. Bạn có thể sử dụng Regex sau:
```
$u_name =preg_replace(‘/[^a-z0-9]/i’, ‘\’, $_GET[‘u_name’]);
```
![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_14.png)

Bây giờ nếu chúng ta thử phá vỡ câu truy vấn, nó sẽ không xuất hiện lỗi.

![alt text](http://blog.securelayer7.net/wp-content/uploads/2016/06/mongodb_15.png)

References:
http://php.net/manual/en/mongocollection.find.php
https://media.blackhat.com/bh-us-11/Sullivan/BH_US_11_Sullivan_Server_Side_WP.pdf

Nguồn: Dịch từ [securelayer7](http://blog.securelayer7.net/mongodb-security-injection-attacks-with-php/)
