---
layout: post
cover: 'assets/images/covers/casper.jpg'
title: Chia sẻ kinh nghiệm đăng kí VPS
date: 2018-08-26
tags: [system,vps,server,hosting]
author: phapli
description: >
  Mình chia sẻ bài viết này cho các bạn muốn sở hữu một VPS giá rẻ cho riêng mình. Mục đích thì vô vàn: có người cần nơi để host một trang blog, website cá nhân, có người muốn nâng cao kĩ năng system (như mình) có người đơn giản muốn có 1 proxy cá nhân để vượt qua các vụ chặn facebook chẳng hạn.
---

Mình chia sẻ bài viết này cho các bạn muốn sở hữu một VPS giá rẻ cho riêng mình. Mục đích thì vô vàn: có người cần nơi để host một trang blog, website cá nhân, có người muốn nâng cao kĩ năng system (như mình) có người đơn giản muốn có 1 proxy cá nhân để vượt qua các vụ chặn facebook chẳng hạn ...

## Bước 1: Mua VPS ở Vultr
---
Bạn có thể chọn riêng cho mình 1 nhà cung cấp mà các bạn thích và thuận tiện. Riêng mình, lý do mình chọn Vultr thì đơn giản là được recommend từ một anh bạn, với các lý do đơn giản là host khá ổn định, server ở Nhật, tốc độ down về khá tốt, cộng với gói 5$ cho người mới bắt đầu là ok, à còn chấp nhận thẻ debit nữa :D

### Đăng kí tài khoản

### Đăng kí phương thức thanh toán

Chúng ta có 3 option để lựa chọn là Credit Card, Paypal (đơn giản hơn nếu bạn có sẵn account paypal, bù lại sẽ có charge phí), và bitcoin (bạn nào không biết về bitcoin thì tìm hiểu ở [đây](https://en.wikipedia.org/wiki/Bitcoin)

### Lựa chọn option server

Mình chọn gói cơ bản nhất như sau:

* Server Location: (Asia) Tokyo
* Server Size: 5$/month
* Server Type: 64bit CentOS
* Additional Features: Enable Private Network
* Các tùy chọn còn lại chưa cần thiết lắm.
* Cuối cùng là đặt tên cho server: Hostname & Label
=> Deploy Now

## Bước 2: Thiết lập cơ bản cho server
---
Phần này phụ thuộc vào phần trước các bạn chọn OS gì nhá, mình chon CentOS 7, các bạn chọn OS khác sẽ phải thay đổi các command line đôi chút.

Trước tiên các bạn phải đăng nhập được vào server thông qua ssh tool.
```
ssh root@<server-ip-address>
```
password được vultr random và lưu trữ ở đây:

![alt](/assets/images/posts/2017-01-16/vps001.png)

### 1. Tạo một user mới:

Vì lý do bảo mật, các bạn nên có một user mới để thực hiện các tác vụ thông thường hằng ngày thay vì sử dụng user root.
```
adduser tin.tt
```
Đặt password cho account mới
```
passwd tin.tt
```
Thêm user này vào group wheel (đây là group mặc định được gán quyền sudo)
```
gpasswd -a tin.tt wheel
```
Tiếp theo là add một ssh-key vào server để bạn có thể ssh vào server mà không cần dùng đến password.
Đăng xuất khỏi server (Ctrl + D).

Generate một ssh key cho máy tính cá nhân của bạn
```
ssh-keygen -t rsa
```
Copy public key lên server
```
ssh-copy-id tin.tt@<server-ip-address>
```
Cuối cùng là thử login vào server với ssh-key mới.
```
ssh tin.tt@<server-ip-address>
```
### 2. Chặn ssh bằng account root và phương thức xác thực password
Sau bước trên, bạn đã có thể login vào server bằng user mới, và các tác vụ cần quyền admin có thể sử dụng sudo để làm. Vậy nên thêm một recommend để tăng tính bảo mật cho server là ngăn chặn quyền truy cập từ user root và phương thức xác thực password.
```
sudo nano /etc/ssh/sshd_config
```
Tìm và chỉnh sửa 2 config như sau:
```
PermitRootLogin no

PasswordAuthentication no
```
Lưu lại và restart sshd service
```
sudo systemctl reload sshd
```
### 3. Cấu hình timezone
Mặc định, server sẽ sử dụng giờ UTC. Để thuận tiện sử dụng, bạn nên đổi sang giờ địa phương.
```
sudo ln -sf /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime
```
Bây giờ bạn có thể kiểm tra lại giờ server với command date

### 4. Cấu hình IPTables Firewall

Mặc định CentOS 7 sử dụng FirewallD. Nên chúng ta cần gỡ FirewallD trước, sau đó mới cài IPTables.
```
# uninstall FirewallD
sudo yum remove -y firewalld
# install IPTables
sudo yum install -y iptables-services
sudo systemctl start iptables
```
Cấu hình để IPTables start với OS
```
sudo systemctl enable iptables
```
Bây giờ hãy xem các thông số mặc định của iptables
```
sudo iptables -L -n
```
Những thông số trên là runtime nên sẽ mất khi ta restart server, để giữ lại các cấu hình này ta sử dụng
```
sudo /usr/libexec/iptables/iptables.init save
```
Command trên sẽ lưu những thông số cấu hình iptables vào 
```
/etc/sysconfig/iptables
```
Cuối cùng là cho phép server serve các port thông dụng của http và https
```
sudo nano /etc/sysconfig/iptables
```
Chỉnh sửa thành
```
-A INPUT -p tcp -m state --state NEW -m tcp --dport 22 -j ACCEPT
-A INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
-A INPUT -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT
-A INPUT -j REJECT --reject-with icmp-host-prohibited
```
Lưu lại và restart iptables service
```
sudo systemctl reload iptables
```
### 5. Thay đổi port mặc định để ssh
Sau 1 tuần sử dụng server mình nhận thấy một vấn đề lớn đó là server liên tục bị các tool tự động ssh vào, mặc dùng không vào được server nhưng cũng làm ảnh hưởng băng thông server.
Vì vậy mình đã đổi port ssh trên server (mặc định là 22)

Đầu tiên là đổi cấu hình ssh
```
sudo nano /etc/ssh/sshd_config
```
TÌm và đổi thông số Port thành:
```
Port 2244
```
Sau đó update firewall:
```
sudo nano /etc/sysconfig/iptables
```
Thêm vào:
```
-A INPUT -p tcp -m state --state NEW -m tcp --dport 2244 -j ACCEPT
```
Restart iptables service
```
sudo systemctl reload iptables
```
Restart sshd service
```
service sshd restart
```
Từ giờ khi ssh vào server các bạn thêm option -p như sau:
```
ssh root@<server-ip-address> -p 2244
```
## Bước 3: Cài đặt nginx để host nội dung mà mình muốn.
Sau bước 2 các bạn đã có 1 server cho riêng mình để có thể nghịch bất cứ điều gì bạn muốn với những thiết lập cơ bản về bảo mật.
Bước này sẽ hướng dẫn thêm cho bạn nào muốn host một file html lên server

Cài nginx. Tìm hiểu về nginx ở [đây](https://www.nginx.com/)
```
sudo yum install nginx
```
Start nginx lên:
```
sudo systemctl start nginx
```
Các bạn có thể mở browser và truy cập vào link http://server_domain_name_or_IP/ để thấy được thành quả:
![alt](/assets/images/posts/2017-01-16/vps002nginx.png)

Nếu bạn muốn thay đổi nội dung hiện thị thì vào đây 
```
/usr/share/nginx/html
```
Cuối cùng nhớ thêm nginx vào các service sẽ start cùng với OS
```
sudo systemctl enable nginx
```