---
layout: post
cover: "assets/images/covers/cover2.jpg"
title: Các giải pháp thay thế cho phép thử turing
date: 2018-09-26
tags: [Artificial intelligence, Turing test]
author: jaken
description: >
  Các giải pháp thay thế cho phép thử turing
---

Cách đây bảy mươi năm, khi nghiên cứu về trí tuệ nhân tạo, ngài Alan Turing nghĩ là phải có một phương pháp gì đó để đánh giá khả năng trí tuệ của máy. Cho rằng suy nghĩ khó định nghĩa, ông chọn con đường dễ dàng hơn: cho máy tính và một người thảo luận bằng văn bản với một người chơi thứ ba. Nếu bên thứ ba không thể xác định được mình đang nói chuyện với máy hay là người thì máy vượt qua phép thử.

Phép thử huyền thoại này được trích dẫn và sử dụng nhiều năm, đến hiện nay thì nhiều chatbot được cho là đã [vượt qua turing test](https://en.wikipedia.org/wiki/Eugene_Goostman). Thậm chí con bot của google đã có thể [nói chuyện trơn tru với người](http://www.rightthisminute.com/video/you-wont-believe-how-realistic-googles-ai-assistant-sounds) bằng âm thanh. Người ta yêu cầu một bài test mạnh hơn, có thể đánh giá không chỉ biểu hiện mà khả năng suy nghĩ, nhận thức của robot. Họ tạo ra một núi các phép thử khác nhau bao gồm các bản cải tiến như [phép thử thị giác turing](https://en.wikipedia.org/wiki/Visual_Turing_Test), hoặc tiếp cận theo phương pháp khác như phép thử Lovelace, thử thách Winograd Schema...

#### Phép thử thị giác Turing
![alt align=right](https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Sample_questions.png/301px-Sample_questions.png)
Trong phép thử này, máy tính được cho xem một bức hình và phải trả lời được những câu hỏi trắc nghiệm đúng sai về nội dung bức hình đó. 

So với phép thử turing nguyên thuỷ AI bắt đầu với việc xử lý ngôn ngữ thì bài này đi từ hướng xử lý ảnh, và cũng không cần một thí sinh người làm đối trọng. Phép thử ra đời năm 2015 và đến nay dĩ nhiên chưa có máy tính nào qua được.

#### Phép thử Lovelace

![alt](http://www.kurzweilai.net/images/Ada-Lovelace.jpg)

Được đặt tên theo lập trình viên đầu tiên, nàng [Ada Lovelace](https://vi.wikipedia.org/wiki/Ada_Lovelace). [Phiên bản đầu tiên](http://kryten.mm.rpi.edu/lovelace.pdf) của phép thử được Selmer Bringsjord và đồng nghiệp tạo ra dưới ý tưởng là nếu một chương trình máy tính có thể tạo ra một tác phẩm nghệ thuật theo một cách mà lập trình viên tạo ra nó không hiểu hoặc giải thích được. Nó có thể được đánh giá là có trí thông minh tương tự con người.

Phiên bản 2.0 được đưa ra khi Mark Ried cho rằng phép thử thiếu các thông số để đo lường, ông [cải tiến phép thử](http://arxiv.org/pdf/1410.6142v1.pdf) một xíu, bằng cách đưa ra một số yêu cầu về phong cách nghệ thuật và yêu cầu máy tính sáng tạo. 

Không biết [thơ máy](http://thomay.vn/), [Vocaloid](https://en.wikipedia.org/wiki/Vocaloid), hay [Google Deepdream](https://deepdreamgenerator.com/#gallery) có cái nào vượt qua phép thử này không, còn tôi chắc sẽ nhận phần thiểu năng trí tuệ nghệ thuật vậy.

#### Thử thách Winograd Schema

[Thử thách](https://en.wikipedia.org/wiki/Winograd_Schema_Challenge) này được nhà khoa học máy tính [Hector Levesque](https://en.wikipedia.org/wiki/Hector_Levesque) tạo ra, nó đưa ra cho máy đọc hiểu một câu và trả lời trắc nghiệm lựa chọn. Ví dụ:

- Hội đồng thành phố từ chối cấp phép cho người biểu tình vì họ sợ hãi/mang tới bạo lực

Câu hỏi: Ai sợ hãi/mang tới bạo lực?
1. hội đồng thành phố
2. người biểu tình

Trong ví dụ trên, máy phải hiểu được tương quan giữa các đối tượng miêu tả trong mệnh đề cũng như câu hỏi. Khi câu hỏi thay đổi cụm "sợ hãi" sang "mang tới", đáp án thay đổi và máy phải biết được đáp án nào đúng trong trường hợp nào.  

Phép thử này cũng không cần phải có thí sinh người đi kèm, nó yêu cầu có sẵn vốn kiến thức nhất định và có thể thiết kế đơn giản hoặc phức tạp để đánh giá level của AI. (hoặc đánh giá được cả trí thông minh con người đấy chứ) 

Read more:

[Chatbot 'Mitsuku' wins AI competition based on Turing test ... again](https://www.wikitribune.com/article/87585/)

[8 Possible Alternatives To The Turing Test](https://io9.gizmodo.com/8-possible-alternatives-to-the-turing-test-1697983985)

[Businessinsider- best chatbots](https://www.businessinsider.com/best-ai-chatbots-online-robot-chat-2017-10)
