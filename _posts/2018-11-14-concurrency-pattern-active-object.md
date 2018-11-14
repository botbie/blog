---
layout: post
cover: 'assets/images/covers/cover3.jpg'
title: Concurrency Pattern - Active Object
date: 2018-11-14
tags: [design pattern, concurrency programming]
author: jaken
description: >
  Concurrency pattern là những design pattern sử dụng trong lập trình đa luồng.
---

The active object design pattern decouples method execution from method invocation for objects that each reside in their own thread of control.[1] The goal is to introduce concurrency, by using asynchronous method invocation and a scheduler for handling requests.

Mẫu thiết kế gồm sáu phần:

- Proxy cung cấp public interface cho client gọi trực tiếp 
- Interface định nghĩa các phương thức của active object
- Danh sách các request chờ xử lý từ client
- Một scheduler sẽ ra quyết định request nào sẽ được xử lý tiếp theo
- Phần cài đặt các phương thức của active object
- Hàm callback hoặc một biến để client nhận kết quả

Ví dụ một lớp java bình thường:
```
class MyClass {

    private double val = 0.0;
    
    void doSomething() {
        val = 1.0;
    }

    void doSomethingElse() {
        val = 2.0;
    }
}
```

Trong lập trình đa luồng, khi hai phương thức doSomething và doSomethingElse được thực hiện bởi các luồng khác nhau cùng lúc, giá trị của val sẽ không xác định được, nó phụ thuộc vào thứ tự xử lý - vốn không được quản lý ở đây. Đây là lỗi race condition kinh điển mà hầu hết lập trình viên đều gặp trong đời. Trong trường hợp đơn giản, bạn chỉ cần dùng phép đồng bộ với từ khoá `synchronized` thần thánh để xử lý. Hoặc bạn sử dụng một pattern như Active Object:
```
class MyActiveObject {

    private double val = 0.0;

    private BlockingQueue<Runnable> dispatchQueue = new LinkedBlockingQueue<Runnable>();

    public MyActiveObject() {
        new Thread (new Runnable() {
                    
                @Override
                public void run() {
                    while(true) {
                        try {
                            dispatchQueue.take().run();
                        } catch (InterruptedException e) {   
                            // okay, just terminate the dispatcher
                        }
                    }
                }
            }
        ).start();
    }

    void doSomething() throws InterruptedException {
        dispatchQueue.put(new Runnable() {
                @Override
                public void run() { 
                    val = 1.0; 
                }
            }
        );
    }

    void doSomethingElse() throws InterruptedException {
        dispatchQueue.put(new Runnable() {
                @Override
                public void run() { 
                    val = 2.0; 
                }
            }
        );
    }
}
```

Dùng Java 8 viết thì sạch đẹp hơn xíu:

```
public class MyClass {
    private double val; 
    
    // container for tasks
    // decides which request to execute next 
    // asyncMode=true means our worker thread processes its local task queue in the FIFO order 
    // only single thread may modify internal state
    private final ForkJoinPool fj = new ForkJoinPool(1, ForkJoinPool.defaultForkJoinWorkerThreadFactory, null, true);
    
    // implementation of active object method
    public void doSomething() throws InterruptedException {
        fj.execute(() -> {val = 1.0;});
    }
 
    // implementation of active object method
    public void doSomethingElse() throws InterruptedException {
        fj.execute(() -> {val = 2.0;});
    }
}
```

Như vậy, active object tự nó có riêng một thread, và các tác vụ bên ngoài yêu cầu sẽ được đẩy vào một blocking queue nội bộ. Thread chỉ cần bốc ra tuần tự và xử lý. Phiên bản Active Object hoàn toàn thread-safe. Dù cho doSomething và doSomethingElse có được gọi tuần tự hay song song, cuối cùng chúng sẽ vẫn dc xử lý tuần tự.

Notes:
    Các biến nội bộ của object không thể truy cập/thay đổi trực tiếp từ bên ngoài
    

Refs:

[Wikipedia](https://en.wikipedia.org/wiki/Active_object)
[Prefer Using Active Objects Instead of Naked Threads - Herb Sutter](http://www.drdobbs.com/parallel/prefer-using-active-objects-instead-of-n/225700095)
[Java Active Objects A Proposal by Allen Holub](https://pragprog.com/magazines/2013-05/java-active-objects)