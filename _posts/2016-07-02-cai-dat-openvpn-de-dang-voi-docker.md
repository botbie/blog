---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Cài đặt OpenVPN dễ dàng với docker
date: 2016-07-02
tags: [docker, openvpn]
author: nguquen
description: >
  Trong thời buổi "đứt cáp" thường xuyên hơn cơm bữa, việc tự trang bị cho mình 1 vpn server đặt tại nước ngoài là cần thiết phòng khi vật vả. Việc sử dụng OpenVPN có mấy điểm lợi sau: Các kết nối được mã hóa, tránh bị sniff khi tham gia mạng công cộng như wifi ở các quán cafe...
---

Trong thời buổi "đứt cáp" thường xuyên hơn cơm bữa, việc tự trang bị cho mình 1 vpn server đặt tại nước ngoài là cần thiết phòng khi vật vả. Việc sử dụng OpenVPN có mấy điểm lợi sau:
- Các kết nối được mã hóa, tránh bị sniff khi tham gia mạng công cộng như wifi ở các quán cafe.
- OpenVPN dùng OpenSSL để mã hóa, nếu config port của OpenVPN là 443 thì rất khó để phân biệt traffic của OpenVPN với traffic HTTPS thông thường nên rất khó bị block.
- Ẩn IP thật khi tham gia vào internet.
- Những khi "đứt cáp" thì tốc độ vẫn rất tốt nếu đặt server đúng chỗ :grin:. Theo quan sát của mình vào những lúc "đứt cáp" thì đường truyền tới Hongkong vẫn ngon lành. Ví dụ VPS mình thuê có network speed = 2Mbps thì khi download hoàn toàn full 2Mbps :cool:.
- Bạn có thể remote vào máy tính đặt ở nhà để làm việc mà không cần phải làm gì thêm, chỉ cần máy ở nhà và máy hiện tại cùng kết nối vào VPN :gem:

Việc setup OpenVPN không khó cũng không dễ, bạn hoàn toàn có thể search ra vài bài hướng dẫn rất chi tiết. Chỉ là nó có quá nhiều bước phải làm, ví dụ: https://www.digitalocean.com/community/tutorials/how-to-set-up-an-openvpn-server-on-ubuntu-14-04. Giờ đây, với một docker image được build sẵn thì mọi chuyện sẽ dễ dàng hơn, các bước cần làm cũng sẽ ít hơn :angel: [more]

#### 1. Access vào VPS:
Đương nhiêu điều kiện đầu tiên là bạn phải có 1 VPS, có thể tham khảo bài viết này để đăng ký: https://botbie.io/topic/90/chia-se-kinh-nghiem-dang-ki-vps

#### 2. Cài đặt Docker:
```
curl -sSL https://get.docker.com/ | sh
```
#### 3. Tạo 1 volume container để chứa các file cấu hình và certificate:
```
docker run --name ovpn-data -v /etc/openvpn busybox
```
#### 4. Khởi tạo cấu hình và certificate:
```
docker run --volumes-from ovpn-data --rm kylemanna/openvpn ovpn_genconfig -u tcp://<ip-server>
docker run --volumes-from ovpn-data --rm -it kylemanna/openvpn ovpn_initpki
```
#### 5. Chạy OpenVPN server container:
```
docker run --volumes-from ovpn-data -d -p 443:1194/tcp --cap-add=NET_ADMIN kylemanna/openvpn
```
#### 6. Tạo certificate cho client:
```
docker run --volumes-from ovpn-data --rm -it kylemanna/openvpn easyrsa build-client-full CLIENTNAME nopass
docker run --volumes-from ovpn-data --rm kylemanna/openvpn ovpn_getclient CLIENTNAME > CLIENTNAME.ovpn
```
#### 7. Copy file .ovpn về máy client:
```
scp <user>@<ip-server>:/path/CLIENTNAME.ovpn .
```
#### 8. Cấu hình OpenVPN ở client:
##### - Ubuntu:
Với ubuntu cần cài đặt thêm plugin openvpn cho network manager:
```
sudo apt-get install network-manager-openvpn
sudo apt-get install network-manager-openvpn-gnome
```
Chọn 'Configure VPN...' trong cấu hình network, chọn 'Import a saved VPN configuration...'

![https://gyazo.com/5397ba1c4a59d49ee1d61278d96b8a19.png](https://i.gyazo.com/5397ba1c4a59d49ee1d61278d96b8a19.png)

Chọn file CLIENTNAME.ovpn đã lưu về máy khi nãy, ở mục 'Gateway' điền <ip-server>:443

![https://gyazo.com/ee8a994ecf147e2778d324acef85ad3e](https://i.gyazo.com/ee8a994ecf147e2778d324acef85ad3e.png)

Nhấn vào 'Advanced...', ở mục 'General' chọn 'Use a TCP connection':

![https://gyazo.com/546ec9787945e9e43404d0dc18763229](https://i.gyazo.com/546ec9787945e9e43404d0dc18763229.png)

Ở mục 'TLS Authentication' chọn 'Key Direction' = 1

![https://gyazo.com/24134971f89a6a864f04f9b290a69844](https://i.gyazo.com/24134971f89a6a864f04f9b290a69844.png)

##### - Mac OS:
Đầu tiên bạn cần cài đặt [TunnelBlick](https://tunnelblick.net). Mở file CLIENTNAME.ovpn, sửa port từ 1194 -> 443:
```
remote <ip-server> 443 tcp
```
Sau đó double click vào file CLIENTNAME.ovpn là xong :airplane:

Tới đây là bạn đã có 1 VPN server cho riêng mình để vi vu lướt net mùa "cắn cáp" rồi đó  :kissing:
