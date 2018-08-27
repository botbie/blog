---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Phục hồi code với git
date: 2018-08-27
tags: [source control, git, devops]
author: xluffy
description: >
  Phục hồi code với git
---

Trong git có nhiều cách để phục hồi hay quay lại trạng thái của code. Ở đây ta sẽ nói về 2 phần chính là code đã được commit nhưng chưa push và code đã được commit và cũng đã được push lên repository.

Với code đã commit nhưng chưa được push ta có thể dùng git reset với --soft hoặc --hard tùy mục đích. Vì code chưa được push (nghĩa là người khác chưa biết và chưa pull về) nên ta có thể thoải mái quay lại một commit cụ thể nào đó và xóa các commit "xấu" mà không ai biết trước khi push lên.

Với code đã commit và cũng đã được push lên repository nghĩa là đã có người biết và đã có người pull code về thì việc phục hồi không còn đơn giản nữa. Đồng nghĩa là ta không thể xóa các commit "xấu" mà chỉ có thể sửa chữa commit "xấu" bằng một commit "đính chính". History của commit không thay đổi. Lệnh sử dụng ở đây là git revert

Hãy xem ví dụ sau, giả sử ta có các commit như sau và đã được push lên repository
```
~$ git lola
* 1f7a1ac (HEAD -> master, origin/master) Add function in script nginxstatus
* 4bd503a Dummy log
* 5ecc61b Add code in script
* c9d82f4 It is 23:31
* 39de993 dummy commit
* ae1a975 Move script to bin dir
* e936714 Backup database with shell script
* c0704cc Script check status of nginx
* 9b5e2ee kill mysql query
* 4ad7f45 Add license
* 39bd57e Add REAME.md
```
Như ta thấy HEAD đang ở master (local) và cũng đang ở origin/master (remote)

Trong trường hợp ta muốn quay trở lại commit c9d82f4 thì ta chỉ có thể revert về commit này như sau
```
~$ git revert c9d82f4
```
=> sẽ mở 1 editor và viết commit mesg vào đây, kết quả sẽ được như sau
```
~$ git lol
* 5eb5150 (HEAD -> master) Revert "It is 23:31"
* 1f7a1ac (origin/master) Add function in script nginxstatus
* 4bd503a Dummy log
* 5ecc61b Add code in script
* c9d82f4 It is 23:31
* 39de993 dummy commit
* ae1a975 Move script to bin dir
* e936714 Backup database with shell script
* c0704cc Script check status of nginx
* 9b5e2ee kill mysql query
* 4ad7f45 Add license
* 39bd57e Add REAME.m
```
Như ta thấy đã revert về trạng thái của commit c9d82f4 nhưng các commit sau đó thì vẫn còn và xuất hiện thêm 1 commit đính chính và ta có thể push lên bình thường.

Câu hỏi là ta có thể quay lại trạng thái tại commit c9d82f4 và xóa tất cả các commit sau nó hay không? Thực tế là hoàn toàn được
```
~$ git reset c9d82f4 --hard
~$ git lola
* 5eb5150 (origin/master, origin/HEAD) Revert "It is 23:31"
* 1f7a1ac Add function in script nginxstatus
* 4bd503a Dummy log
* 5ecc61b Add code in script
* c9d82f4 (HEAD -> master) It is 23:31
* 39de993 dummy commit
* ae1a975 Move script to bin dir
* e936714 Backup database with shell script
* c0704cc Script check status of nginx
* 9b5e2ee kill mysql query
* 4ad7f45 Add license
* 39bd57e Add REAME.md
```
=> ta sẽ thấy HEAD của master (local repo) thì ở commit c9d82f4, nhưng trên origin/master (remote repo) thì ở 5eb5150. Nếu bây giờ ta push lên thì chắc chắn là server sẽ từ chối và bắt chúng ta pull về trước khi push lên.
```
~$ git push
error: failed to push some refs to 'git@bitbucket.org:xluffy/demo.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. Integrate the remote changes (e.g.
hint: 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details
```
Đây là nguyên tác của Source Control, nghĩa là cái gì đã chia sẻ, ghi dấu lịch sử thì không thể xóa bỏ.

Như trên nếu muốn push ta có thể -f (force)
```
~$ git push -f 
~$ git lola
* c9d82f4 (HEAD -> master, origin/master, origin/HEAD) It is 23:31
* 39de993 dummy commit
* ae1a975 Move script to bin dir
* e936714 Backup database with shell script
* c0704cc Script check status of nginx
* 9b5e2ee kill mysql query
* 4ad7f45 Add license
* 39bd57e Add REAME.m
```
Như ta thấy HEAD đều đã ở master (local) và origin/master (remote), các commit sau c9d82f4 cũng đã bị xóa bỏ.

Quay trở lại vấn đề là có nên git push -f hay không? thì như đã nói ở trên là nguyên tắc của Source Control là cái gì đã ghi dấu lịch sử thì không thể xóa lịch sử mà ta chỉ có thể sửa đổi bằng cách ghi một commit mới. Chuyện này đảm bảo cho ta vấn đề không ai có thể xóa đi lịch sử.

Ví dụ với svn nếu có một ai đó quay trở lại commit đầu tiên và force commit lên server. Sau đó tất cả các lập trình viên khác đều svn update và giả sử không có bản backup repo thì coi như ta sẽ mất hết lịch sử.

Với git thì không đến mức nguy hiểm như vậy (do cơ chế phân tán của git) TUY NHIÊN việc dùng git push -f trên các repo chung là BAD PRACTICE KHÔNG NÊN dùng. Và chỉ nên dùng với owner-branch nếu muốn chỉnh commit cho đẹp.

Vậy làm sao để tránh được vấn đề trên. Điểm lợi hại của git là cheap branch, một số git server như gitlab hay github có hỗ trợ tính năng fork và pull/merge request. Áp dụng việc tách branch và dùng các tính năng trên sẽ dễ dàng khi phục hồi code và không ảnh hưởng tới người khác. Như dịch vụ gitlab còn có chức năng protect branch (mặc định là master) để đảm bảo là ngoài owner thì không ai có thể được code và push trực tiếp trên nhánh master. NGUYÊN TẮC là đừng bao giờ code chung trên 1 branch.

Write-up cho vấn đề sáng nay