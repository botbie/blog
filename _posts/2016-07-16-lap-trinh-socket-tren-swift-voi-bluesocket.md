---
layout: post
cover: 'assets/images/covers/cover4.jpg'
subclass: 'post tag-test tag-content'
navigation: True
title: Lập trình socket trên Swift với BlueSocket
date: 2016-07-16
tags: [swift]
author: nguquen
---

### Giới thiệu
----------
Để lập trình socket trên Swift chúng ta có thể dùng các hàm quen thuộc như socket, bind, listen, connect.v.v.v. thông qua thư viện của hệ thống như Glibc (Linux) / Darwin (MacOS). Nhưng như vậy thì khá là tay chân, hiện tại có nhiều thư viện Swift đã bọc các hàm của hệ thống này trong những class của Swift, việc của chúng ta chỉ là import và sử dụng các class của Swift này thôi :cool:. Trong bài viết này mình sẽ sử dụng thư viện [BlueSocket](https://github.com/IBM-Swift/BlueSocket) được viết bởi IBM.

Để sử dụng BlueSocket, chúng ta khai báo dependencies trong Package.swift:
```
import PackageDescription

let package = Package(
    name: "...",
    dependencies: [
        .Package(url: "https://github.com/IBM-Swift/BlueSocket.git", majorVersion: 0, minor: 6)
    ]
)

```
Với url là url của thư viện, majorVersion, minor là version của thư viện. Ví dụ BlueSocket đang release tới version 0.6.2 thì majorVersion = 0 và minor = 6.[more]

### Sử dụng BlueSocket
----------
#### Trước khi sử dụng
Phải luôm import Socket framework:
```
import Socket
```
#### Tạo socket:
BlueSocket hỗ trợ 4 phương thức factory khác nhau để tạo instance socket:
- `create()` - Tạo instance socket mặc định với family: .inet, type: .stream, proto: .tcp
- `create(family family: ProtocolFamily, type: SocketType, proto: SocketProtocol)` - Tạo instance socket với option mong muốn, chúng ta có thể tùy biến protocol family, socket type, socket protocol
- `create(connectedUsing signature: Signature)` - Tạo instance socket và cho phép connect tới server dựa vào thông tin Socket.Signature
- `create(fromNativeHandle nativeHandle: Int32, address: Address?)` - Cho phép bọc một file descriptor native của một socket đã tồn tại để tạo một instance Socket mới.
#### Đóng socket:
Để đóng socket, có thể dùng hàm sau:
- `close()` - Hàm này sẽ làm những tác vụ cần thiết để đóng một socket đang open.
#### Listen trên một socket:
Để listen kết nối trên một socket chúng ta dùng api sau:
- `listen(on port: Int, maxBacklogSize: Int = Socket.SOCKET_DEFAULT_MAX_BACKLOG)` - Tham số đầu là port được dùng để listen. Tham số thứ hai maxBacklogSize cho phép bạn gán kích thước của queue chứa những kết nối đang pending. Giá trị Socket.SOCKET_DEFAULT_MAX_BACKLOG hiện tại bằng 50.
#### Accept một kết nối từ một socket đang listen:
Khi một socket đang listen phát hiện một yêu cầu kết nối đến, quyền điều khiển sẽ được trả về cho chương trình. Bạn có thể accept kết nối đó hoặc tiếp tục listen hoặc cả hai nếu chương trình của bạn là multi-threaded. BlueSocket hỗ trợ hai cách khác nhau để accept một kết nối đến:
- `acceptClientConnection()` - Hàm này accept kết nối và trả về một instance Socket mới dựa trên socket mới được kết nối. Instance đang listen sẽ không bị ảnh hưởng.
- `acceptConnection()` - Hàm này accept kết nối đến, thay thế và đóng socket đang listen. Các thuộc tính trước đây liên kết với socket đang listen sẽ được thay thế bằng các thuộc tính của socket mới kết nối.
#### Kết nối một socket đến một server:
BlueSocket hỗ trợ 2 hàm để kết nối một instance Socket đến một server:
- `connect(to host: String, port: Int32)` - Hàm này cho phép bạn kết nối đến server dựa trên hostname và port.
- `connect(using signature: Signature)` - Hàm này cho phép bạn chỉ định thông tin kết nối bằng cách cung cấp một instance Socket.Signature chứa thông tin.
#### Đọc data từ socket:
BlueSocket hỗ trợ 3 cách đọc data từ socket:
- `read(into data: NSMutableData)` - Hàm này đọc tất cả data có sẵn trên một socket và trả về trong object NSMutableData đã truyền vào.
- `readString()` - Hàm này đọc tất cả data có sẵn trên một socket và trả nó về như một String. Nó sẽ trả về nil nếu không có data sẵn có để đọc.
- `read(into buffer: UnsafeMutablePointer<CChar>, bufSize: Int)` - Hàm này cho phép bạn đọc data vào một buffer với kích thước được chỉ định bằng cách cung cấp một con trỏ unsafe đến buffer đó và một số nguyên thể hiện kích thước của buffer. Hàm này sẽ thow một Socket.SOCKET_ERR_RECV_BUFFER_TOO_SMALL nếu buffer cung cấp quá nhỏ. Bạn sẽ cần gọi lại với một buffer có kích thước phù hợp hơn.
#### Ghi data vào socket:
BlueSocket cũng cung cấp 3 phương thức để ghi data vào socket:
- `write(from data: NSData)` - Hàm này ghi data chứa trong đối tượng NSData vào socket.
- `write(from string: String)` - Hàm này ghi data chứa trong chuỗi vào socket.
- `write(from buffer: UnsafePointer<Void>, bufSize: Int)` - Hàm này ghi data chứa trong buffer với kích thước chỉ định bằng cách cung cấp một con trỏ unsafe và một số nguyên thể hiện kích thước của buffer đó.

### Ví dụ: EchoServer và EchoClient sử dụng BlueSocket và GCD
----------
#### EchoServer:
EchoServer.swift
```
import Socket
import Dispatch

class EchoServer {
    let port: Int
    let socket: Socket

    init(port: Int) throws {
        self.port = port
        self.socket = try Socket.create()
    }

    func listen(handler: (socket: Socket) -> Void) throws {
        try socket.listen(on: port)
        print("Listen on port: \(port)")
        while true {
            let clientSocket = try socket.acceptClientConnection()
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0)) {
                handler(socket: clientSocket)
            }
        }
    }

}
```
main.swift
```
import Foundation
import Socket

let server = try EchoServer(port: 1337)
try server.listen() {(socket:Socket) in
    do {
        print("handler run at \(NSDate())")
        while true {
            let readData = NSMutableData()
            let bytesRead = try socket.read(into: readData)
            if bytesRead == 0 {break}
            guard let str = NSString(data: readData, encoding: NSUTF8StringEncoding) else {
                print("Error decoding response...")
                readData.length = 0
                break
            }
            print("received from \(socket.remoteHostname):\(socket.remotePort): \(str)", terminator: "")
            try socket.write(from: "\(str)")
        }
    } catch {
        print("socket handler error: \(error)")
    }
    socket.close()
}
```
Full project: [https://github.com/nguquen/EchoServer](https://github.com/nguquen/EchoServer)

#### EchoClient:
EchoClient.swift
```
import Socket

class EchoClient {
    let port: Int32
    let host: String
    let socket: Socket

    init(host: String, port: Int32) throws {
        self.host = host
        self.port = port
        self.socket = try Socket.create()
    }

    func connect(handler: (socket: Socket) -> Void) throws {
        try socket.connect(to: host, port: port)
        handler(socket: socket)
    }
}

```
main.swift
```
import Foundation
import Socket

let port: Int32 = 1337

if Process.argc != 2 {
    print("usage: EchoClient <ip>")
    exit(1)
}

let client = try EchoClient(host: Process.arguments[1], port: port)
try client.connect() {(socket: Socket) in
    do {
        while true {
            let input = readLine(strippingNewline: false)
            try socket.write(from: input!)
            let readData = NSMutableData()
            let bytesRead = try socket.read(into: readData)
            if bytesRead == 0 {break}
            guard let str = NSString(data: readData, encoding: NSUTF8StringEncoding) else {
                print("Error decoding response...")
                readData.length = 0
                break
            }
            print(str, terminator: "")
        }
    } catch {
        print("socket client error: \(error)")
    }
    socket.close()
}

```
Full project: [https://github.com/nguquen/EchoClient](https://github.com/nguquen/EchoClient)

#### Chạy thử:
EchoServer:

![EchoServer](https://i.gyazo.com/1e9b6c9ecef9940ad1a2754fd0b9bbfa.png)

EchoClient:

![EchoClient](https://i.gyazo.com/ad634f774d58e1fd2c503cb85cc83b2d.png)

### Hết :grin:

Bạn chưa biết Swift? Hãy bắt đầu tại: [http://blog.botbie.io/2016/07/08/xin-chao-swift](http://blog.botbie.io/2016/07/08/xin-chao-swift)
