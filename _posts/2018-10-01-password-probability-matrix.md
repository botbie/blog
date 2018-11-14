---
layout: post
cover: 'assets/images/covers/cover3.jpg'
title: Password Probability Matrix
date: 2018-10-01
tags: [cryptographic, hash table]
author: jaken
description: >
  Password Probability Matrix
---

Password Probability Matrix là một kỹ thuật phá mã được đưa ra trong `Hacking - The Art Of Exploitation`, được đề nghị sử dụng để bẻ khóa hash có salt. Câu chuyện như sau:

- Client cần có một cơ chế để xác thực thân phận với server, username-password là một cơ chế xác thực khá tiện dụng và được sử dụng rộng rãi.
- Password cần được lưu trữ nhưng nếu lưu trữ dưới dạng thô thì:
* Database Admin có thể đọc được password
* Nếu bị lộ db sẽ bị lộ toàn bộ password của user
=> Người ta lưu trữ password trong db dạng hash, hash có các tính chất sau:

https://en.wikipedia.org/wiki/Hash_function

Có thuẫn thì sẽ có mâu, các hacker sử dụng một kỹ thuật là rainbow table để bruteforce hashed password nhanh hơn:
https://en.wikipedia.org/wiki/Rainbow_table

Các cặp password/hash được tính toán trước và lưu trữ sẵn và một db khổng lồ: khi thấy 1 hash, so khớp nó với db để tìm password tương ứng.

Để chống lại rainbow table, có một cách đơn giản là thêm `salt` vào password trước khi hash:
https://en.wikipedia.org/wiki/Salt_(cryptography)

Nó làm tăng số lượng hash 1 password có thể tạo ra và làm cho tấn công rainbow gần như không thể.

-> Tác giả đề nghị sử dụng `Password Probability Matrix` để tấn công. Tinh túy của kỹ thuật này là không lưu nguyên hash, chỉ lưu một phần của nó trong db, khi so khớp hash vào db ta sẽ được một số kết quả, hash lại những salt+pass này để tìm ra password chính xác.