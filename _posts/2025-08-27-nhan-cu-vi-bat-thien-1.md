---
layout: post
cover: "assets/images/covers/sqli.png"
title: "[Nhàn cư] vi bất thiện (1)"
date: 2025-08-27
tags: [sql]
author: nguquen
description: >
  Nhiều năm về trước, khi còn là 1 sinh viên thuần khiết, tôi từng là tay chơi nửa mùa trong thế giới security, tạm gọi là 1 security hobbyist đi. Đó là khoảng thời gian đáng nhớ, khi mà hội anh em botbie vẫn thường tụ tập ở các quán cà phê Sài Gòn, từ ngày mưa cho đến ngày nắng, từ những tối tan làm cũng như những ngày cuối tuần, chúng tôi cùng nhau tham gia những cuộc thi CTF (Capture The Flag) trong và ngoài nước, đổi lấy niềm vui nho nhỏ khi submit được 1 valid flag. Niềm vui đó trôi qua nhanh như những cơn gió cơm áo cuốn tôi đi, nhìn lại anh em ai cũng đã vợ (con), tôi thì cũng đã có những niềm đam mê mới...
---

Nhiều năm về trước, khi còn là 1 sinh viên thuần khiết, tôi từng là tay chơi nửa mùa trong thế giới security, tạm gọi là 1 security hobbyist đi. Đó là khoảng thời gian đáng nhớ, khi mà hội anh em botbie vẫn thường tụ tập ở các quán cà phê Sài Gòn, từ ngày mưa cho đến ngày nắng, từ những tối tan làm cũng như những ngày cuối tuần, chúng tôi cùng nhau tham gia những cuộc thi CTF (Capture The Flag) trong và ngoài nước, đổi lấy niềm vui nho nhỏ khi submit được 1 valid flag. Niềm vui đó trôi qua nhanh như những cơn gió cơm áo cuốn tôi đi, nhìn lại anh em ai cũng đã vợ (con), tôi thì cũng đã có những niềm đam mê mới.

Dạo này có chút thời gian, đột nhiên nhận được request từ người em nhờ audit giúp 1 vài trang web, với mớ kiến thức lỗi thời, tôi cũng nhận lời, xem như 1 hoạt động giải trí.

Loay hoay mất mấy ngày để load mớ kiến thức rỉ sét từ đáy não, làm được vài bước sách vở như recon + scanning, tôi gần như thất vọng với những tool có sẵn, phần lớn đều không thể vượt qua được lớp WAF (Web Application Firewall) của mục tiêu. Tôi đành phải ngồi viết custom script để bypass WAF, nói chung rồi cũng chạy được, nhưng hơi chậm để tránh bị rate limit.

![alt](/assets/images/posts/2025-08-27/scanning.png)

Sau khi lấy được thông tin cần thiết về mục tiêu ở bước scanning, bằng biện pháp nghiệp vụ, tôi cũng đã phát hiện được bug có thể exploit được. Thật ngạc nhiên, ở 1 thế giới mà người ta nói quá nhiều về AI và AGI, lỗi SQL Injection (SQLi) kinh điển từ những năm 9x vẫn luẩn khuất trên internet, chờ đợi những kẻ tò mò già cỗi như tôi khai phá.

![alt](/assets/images/posts/2025-08-27/sql-injection.png)

Đã tới được đây rồi chắc tôi cũng không cần dài dòng nữa, bằng những biện pháp nghiệp vụ buồn tẻ, tôi cũng đã access được vào shell của server.

![alt](/assets/images/posts/2025-08-27/shell.png)

pwned!!! :D

Còn những việc tiếp sau đó, tôi mạn phép không kể ra ở đây ^^
