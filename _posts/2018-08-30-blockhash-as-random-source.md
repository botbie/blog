---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Using blockhash as a random source
date: 2018-08-30
tags: [bitcoin, cryptocurrency, cryptography, rng]
author: jaken
description: >
  Đánh giá phương pháp sinh số ngẫu nhiên bằng blockhash
---

Sáng nay jaken vừa được gửi một bản đánh giá về phương pháp sinh số ngẫu nhiên trong game Star của sòng bạc TrueFlip. Reviewer đánh giá như sau: "Poor technology, no RNG algorithm, only using a BTC hash which could be tampered by BTC miners."

Xem thử thì thuật toán của TrueFlip Star khá đơn giản, nó chỉ việc lấy bitcoin block hash và cắt làm nhiều miếng, mỗi miếng chia lấy dư với 49 để tạo ra 6 số ngẫu nhiên cho trò jackpot.

![True Flip Star Random Generator](/assets/images/posts/2018-08-30/trueflip_star_rng.png)

Về lý thuyết, block là do miner tạo ra, nên dĩ nhiên miner *có khả năng* điều khiển blockhash, nhưng xác xuất một miner điều khiển được blockhash như mong muốn là nhiêu % và chi phí miner phải trả là bao nhiêu?

Giả sử một miner nắm giữ X < 50% hashrate của mạng, xác xuất miner đào được 1 block là X, reward Y. Trung bình lợi nhuận trên mỗi block của miner đó là X*Y. Khả năng Miner hoàn toàn đào được block là X, nên chi phí cơ hội mà miner bỏ ra khi tìm cách thay đổi blockhash là X*Y/X = Y = block reward.

Phương pháp miner có thể điều khiển blockhash như sau: Miner đào block thỏa mãn độ khó của blockchain hiện tại, tính ra bộ số ngẫu nhiên tương ứng bằng thuật toán của TrueFlip Star. Nếu kết quả không đạt, Miner đào lại block đó cho tới khi có được blockhash phù hợp.

Xác suất Miner có được blockhash sinh ra bộ jackpot mình đang nắm trong một lần mine là 1/49 ^ 6. Bằng với xác xuất người mua một vé số có được.

Kết luận: Phương pháp sử dụng blockhash để làm nguồn ngẫu nhiên cho trò jackpot hoặc bất kỳ trò chơi ngẫu nhiên có chi phí tham gia < blockreward và giải thưởng < blockreward/(xác xuất trúng) đều khá công bằng.