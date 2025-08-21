---
layout: post
cover: 'assets/images/covers/cover4.jpg'
title: Object serialization performance
date: 2022-10-25
tags: [Java, bài dịch, serialization]
author: blu3
description: >
  Java performance - Object serialization
---

## Objects Serialization performance 

XML, JSON, và định dạng tương tự như text-based chúng rất hữu ích trong việc trao đổi dữ liệu giữa các hệ thống với nhau. Giữa các tiến trình trong Java, dữ liệu thường được trao đổi thông qua trạng thái `serialization` của một đối tượng. Mặc dù nó được sử dụng rộng rãi trong Java, `serialization` có 2 điểm quan trọng cần quan tâm trong Java EE:
- EJB được gọi giữa các máy chủ Java EE với nhau - EJB gọi từ xa - Sử dụng `serialization` để trao đổi dữ liệu 
- Trạng thái HTTP session được lưu thông qua `serialization` của đối tượng, điều này làm cho các HTTP session có tính sẳn sàng cao.

JDK cung cấp một cơ chế mặc định để `serialization` các đối tượng thông qua implement giao diện `Serializable` hoặc giao diện `Externalizable`. Trên thực tế, hiệu suất của quá trình `serialization` đối với mọi đối tượng có thể được cải thiện từ mã code `serialization` mặc định, nhưng đây chắc chắn không phải là thời điểm khôn ngoàn để tối ưu hiệu xuất `serialization` sớm. Đoạn mã code đặc biệt để `serialization` và `deserialization` sẽ tốn thời gian để viết, và mã code đó cũng sẽ khó bảo trì hơn so với mã code `serilization` mặc định. Mã code `serialization` cũng có thể phức tạp, vì vậy việc cố gắng tối ưu hoá nó sẽ làm tăng nguy cơ tạo ra bug.

### Transient Fields
Nói chung, cách để cải thiện chi phí `serialization` đối tượng là `serialization` ít dữ liệu nhất có thể. Điều này được thực hiện bằng cách đánh dấu các trường không cần thiết là `transient`. Khi được đánh dấu là `transient` theo mặc định chúng sẽ không được `serialization`. Sau đó, class có thể cung cấp các phương thức `writeObject()` và `readObject()` đặc biệt để xử lý dữ liệu đó.

### Overriding Default Serialization
Phương thức `writeObject()` và `readObject()` cho phép kiểm soát hoàn toàn dữ liệu được `serialization` như thế nào. Với sự kiểm soát quan trọng đi kèm với trách nhiệm quan trọng: điều này rất dễ mắc sai lầm.

Để biết được lý do tại sao tối ưu hoá `serialization` là phức tạp, hãy lấy trường hợp của một đối tượng Point đơn giản đại diện cho vị trí:
```java
public class Point implements Serializable { 
  private int x;
  private int y;
  ...
}
```
Trên máy tính của tôi, 100.000 đối tượng trong số này được `serialization` trong 113 mili giây và được `deserialization` trong 741 mili giây. Nhưng ngay cả khi đối tượng đơn giản như vậy, vẫn rất khó để đạt được hiệu xuất được cải thiện:
```java
public class Point implements Serializable { 
  private transient int x;
  private transient int y;
  ...
  private void writeObject(ObjectOutputStream oos) throws IOException { 
    oos.defaultWriteObject();
    oos.writeInt(x);
    oos.writeInt(y);
  }
  private void readObject(ObjectInputStream ois) 
      throws IOException, ClassNotFoundException {
    ois.defaultReadObject();
    x = ois.readInt();
    y = ois.readInt();
  } 
}
```
Việc `serialization` 100.000 đối tượng trên máy tính của tôi vẫn mất 132 mili giây, nhưng việc `deserialization`  chỉ mất 468 mili giây (cải thiện 30% hiệu suất). Nếu `deserialization` một đối tượng đơn giản là điều chiếm 1 phần đáng kể trong một chương trình, thì việc tối ưu hoá như này có thể là hợp lý. Tuy nhiên, hãy lưu ý nó làm cho mã code khó bảo trì hơn khi các trường được thêm vào, di chuyển... 

Tuy nhiên cho tới lúc này, mã code phức tạp hơn nhưng vẫn đúng về mặt chức năng (và nhanh hơn). Nhưng hãy cần thận khi sử dụng kỹ thuật này trong trường hợp chung: 
```java
public class TripHistory implements Serializable {
  private transient Point[] airportsVisited;
  ....
  // THIS CODE IS NOT FUNCTIONALLY CORRECT
  private void writeObject(ObjectOutputStream oos) throws IOException {
    oos.defaultWriteObject(); 
    oos.writeInt(airportsVisited.length);
    for (int i = 0; i < airportsVisited.length; i++) {
      oos.writeInt(airportsVisited[i].getX());
      oos.writeInt(airportsVisited[i].getY());
    }
  }
  private void readObject(ObjectInputStream ois)
      throws IOException, ClassNotFoundException {
    ois.defaultReadObject();
    int length = ois.readInt(); 
    airportsVisited = new Point[length]; 
    for(inti=0;i<length;i++){
      airportsVisited[i] = new Point(ois.readInt(), ois.readInt(); 
    }
  }
}
```
Ở đây trường `airportsVisited` là 1 mảng chứa tất cả sân bay được tôi ghé thăm, sắp xếp theo thứ tự mà tôi đã đến thăm chúng. Vì vậy một số sân bay nhất định như JKF xuất hiện thường xuyên trong mảng; SYD chỉ xuất hiện 1 lần.

Bởi vì tốn công viết mã code tham chiếu đối tượng, mã code này chắc chắn sẽ hoạt động nhanh hơn cơ chế `serialization` mặc định cho mảng đó: Một mảng 100.000 đối tượng Point mất 4,7 giây để `serialization` trên máy của tôi và 6,9 giây để `deserialization`. Bằng cách sử dụng "tối ưu hoá" ở trên, chỉ mất 2 giây để `serialization` và 1.7 giây để `deserialization`.

Tuy nhiên mã này chạy có `bug`. Các tham chiếu trong mảng chỉ định vị trí của JFK đều tham chiếu đến cùng 1 đối tượng . Có nghĩa là khi tôi phát hiện ra rằng vị trí được trình bày trong dữ liệu là không chính xác, tham chiếu JFK duy nhất có thể bị thay đổi và tất cả các đối tượng trong mảng cũng sẽ thay đổi theo (vì chúng cùng tham chiếu đến 1 đối tượng).

Khi mảng được `deserialization` bằng mã code trên, các tham chiếu JFK đó sẽ trở thành các đối tượng riêng biệt, khác nhau. Bây giờ khi một trong những đối tượng bị thay đổi, chỉ đối tượng đó bị thay đổi. Các đối tượng còn lại vẫn tham chiếu đên JFK.

Đây là một nguyên tắc quan trọng cần nhớ, bởi vì tối ưu `serialization` thường là xử lý đặc biệt cho các tham chiếu đối tượng. Thực hiện chính xác có thể làm tăng đáng kể hiệu xuất, thực hiện không chính xác nó có thể phát sinh các lỗi khá tinh vi.

Với suy nghĩ đó, hãy cùng khám phá quá trình `serialization` của lớp `StockPriceHistory` để xem cách tối ưu hoá có thể được thực hiện như thế nào. 
```java
public class StockPriceHistoryImpl implements StockPriceHistory { 
  private String symbol;
  protected SortedMap<Date, StockPrice> prices = new TreeMap<>(); 
  protected Date firstDate;
  protected Date lastDate;
  protected boolean needsCalc = true;
  protected BigDecimal highPrice;
  protected BigDecimal lowPrice;
  protected BigDecimal averagePrice;
  protected BigDecimal stdDev;
  private Map<BigDecimal, ArrayList<Date>> histogram;
  ....
  public StockPriceHistoryImpl(String s, Date firstDate, Date lastDate) {
    prices = ....
  }
}
```
Khi lịch sử của hàng tồn kho được xây dựng trên ký hiệu `s`, đối tượng được tạo và lưu trữ trên một bản đồ giá được sắp xếp theo ngày của tất cả các giá từ đầu đến cuối. Mã code cũng lưu lại ngày đầu tiên và ngày cuối cùng. Hàm tạo không điền vào bất kỳ một trường nào khác, chúng được khởi tạo theo kiểu `lazy`. Khi một `getter` trên bất kỳ trường nào được gọi, `getter` sẽ kiểm tra xem `needsCalc` có đúng không. Nếu có, nó sẽ tính toán các giá trị thích hợp cho tất cả các trường còn lại nếu cần (tất cả cùng một lúc).

Tính toán này bao gồm việc tạo biểu đồ, ghi lại số ngày hàng tồn kho được chốt ở một mức giá cụ thể. Biểu đồ chứa đựng cùng một dữ liệu (về đối tường `BigDecimal` và `Date`) như được tìm thấy trong bản đồ giá; nó chỉ là một cách nhìn khác về dữ liệu.

Bởi vì tất cả các trường được khởi tạo theo kiểu `lazy` có thể tính toán từ mảng giá, tất cả chúng có thể được đánh dấu `transient`, và không cần thực hiện công việc đặc biệt nào để `serialization` và `deserialization` chúng. Ví dụ này rất dễ dàng trong trường hợp này vì mã code đã thực hiện việc khởi tạo các trường theo kiểu `lazy`; nó có thể lặp lại quá trình khởi tạo theo kiểu `lazy` khi nhận dữ liệu. Ngay cả khi mã code khởi tạo các trường này theo kiểu `eager`, nó vẫn có thể đánh dấu bất kỳ trường được tính toán nào là `transient` và tính toán lại giá trị của chúng trong phương thức `readObject()` của lớp.

Lưu ý rằng điều này duy trì mối quan hệ đối tượng giữa giá và các đối tượng biểu đồ: khi biểu đồ được tính toán lại, nó chỉ thêm các đối tượng hiện có vào `map` mới.

Loại tối ưu hoá này luôn luôn tốt, nhưng có những trường hợp nó thực sự có thể ảnh hưởng đến hiệu suất. Bảng 1: cho thấy thời gian cần thiết để `serialization` và `deserialization` trong trường hợp này trong đó đối tượng biểu đồ là `transient` so với không `transient`, cũng như kích thước dữ liệu được `serialization` cho từng trường hợp. 

Bảng 1: Thời gian `serialization` và `deserialization` đối tượng với các trường được đánh dấu `transient` 
![Bảng 1](/assets/images/posts/2022-10-25/serialization-1.png)

Cho đến nay, ví dụ này tiết kiệm khoảng 15% tổng thời gian để `serialization` và `deserialization` đối tượng. Nhưng thử nghiệm này chưa thực sự tạo lại đối tượng biểu đồ ở phía nhận: đối tượng đó sẽ được tạo khi truy cập lần đầu tiên.

Đôi khi đối tượng biểu đồ sẽ không cần thiết: khách hàng chỉ quan tâm đến giá vào những ngày cụ thể chứ không quan tâm đến biểu đồ. Đó là trường hợp bất thường xảy ra: nếu biểu đồ luôn cần thiết, và nếu mất hơn 3.1 giây để tính toán tất cả các biểu đồ trong thử nghiệm này, thì trường hợp này với các trường được khởi tạo theo kiểu `lazy` sẽ thực sự làm giảm hiệu xuất.

Trong trường hợp này, tính toán biểu đồ không thuộc loại đó -- đó là một tính toán rất nhanh. Nói chung, có thể khó tìm thấy trường hợp tính toán lại một phần dữ liệu tốn chi phí hơn việc `serialization` và `deserialization` dữ liệu đó. Nhưng nó là một cái gì đó để cân nhắc như mã code tối ưu hoá.

Thử nghiệm này không thực sự truyền dữ liệu; dữ liệu được ghi vào và đọc ra từ các mảng byte được gán sẵn, đo đó nó chỉ đo thời gian cho `serialization` và `deserialization`. Tuy nhiên, hãy lưu ý rằng việc tạo trường biểu đồ là `transient` cũng đã tiết kiệm được khoảng 13% kích thước dữ liệu. Điều đó khá quan trọng nếu dữ liệu được truyền qua mạng.

### Nén dữ liệu đã được serialization
Điều này dẫn đến cách thứ 3 mà hiệu suất `serialization` của mã code có thể được cải thiện: nén dữ liệu `serialization` để truyền nhanh hơn qua mạng chậm. Trong lớp lịch sử hàng tồn kho, nó được thực hiện bằng cách nén bản đồ giá trong quá trình `serialization`:
```java
public class StockPriceHistoryCompress implements StockPriceHistory, Serializable {
  private byte[] zippedPrices;
  private transient SortedMap<Date, StockPrice> prices;
  private void writeObject(ObjectOutputStream out) throws IOException {
    if (zippedPrices == null) { 
      makeZippedPrices();
    }
    out.defaultWriteObject();
  }
  private void readObject(ObjectInputStream in)
      throws IOException, ClassNotFoundException {
    in.defaultReadObject();
    unzipPrices();
  }
  protected void makeZippedPrices() throws IOException { 
    ByteArrayOutputStream baos = new ByteArrayOutputStream(); 
    GZIPOutputStream zip = new GZIPOutputStream(baos); 
    ObjectOutputStream oos = new ObjectOutputStream(new BufferedOutputStream(zip)); 
    oos.writeObject(prices);
    oos.close();
    zip.close();
    zippedPrices = baos.toByteArray();
  }
  protected void unzipPrices() throws IOException, ClassNotFoundException {
    ByteArrayInputStream bais = new ByteArrayInputStream(zippedPrices); 
    GZIPInputStream zip = new GZIPInputStream(bais);
    ObjectInputStream ois = new ObjectInputStream(new BufferedInputStream(zip));
    prices = (SortedMap<Date, StockPrice>) ois.readObject(); 
    ois.close();
    zip.close();
  } 
}
```
Phương thức `makeZippedPrices()` `serialization` bàn đồ giá thành mảng byte và lưu các byte kết quả, sau đó `serialization` bình thường trong phương thức `writeObject()` khi nó gọi phương thức `defaultWriteObject()`. (Trên thực tế, miễn là quá trình `serialization` đang được tuỳ chỉnh, sẽ tốt hơn một chút nếu đánh dấu mảng `zippedPrices` là `transient` và viết ra độ dài byte một các trực tiếp. Nhưng mã code này rõ ràng hơn, và đơn giản là tốt hơn) Trên quá trình `deserialization`, tính toán ngược lại được thực hiện.

Nếu mục tiêu là `serialization` thành một mảng byte (như trong mã mẫu ban đầu), thì đây là một thất bại. Điều này không có gì đáng ngạc nhiên; thời gian cần thiết để nén các byte lâu hơn nhiều so với thời gian ghi chúng vào một mảng byte cục bộ. Thời gian được thể hiện trong bảng 2.

Bảng 2: Thời gian serialization và deserialization 10,000 đối tượng với nén
![Bảng 2](/assets/images/posts/2022-10-25/serialization-3.png)

Điểm thú vị nhất về bảng này là dòng cuối cùng. Trong thử ngiệm đó, dữ liệu được nén trước khi gửi, nhưng phương thức `unzipPrices()` không gọi phương thức `readObject()`. Thay vào đó, nó được gọi khi cần thiết, đó là lần đâu tiên `client` gọi phương thức `getPrice()`. Không gọi lệnh đó, chỉ có một số đối tượng `BigDecimal` được `deserialization`, khá nhanh.

Trong ví dụ này, rất có thể `client` sẽ không bao giờ cần giá trị thực tế: khách hàng chỉ cần gọi hàm `getHightPrice()` và các phương thức tương tự để truy xuất thông tin tổng hợp về dữ liệu. Miễn là những phương thức đó là tất cả những gì cần thiết, có thể tiết kiệm rất nhiều thời gian bằng cách giải nén thông tin giá theo kiểu `lazy`. Giải nén `lazy` này cũng khá hưu ích nếu đối tượng được đề cập đang được duy trì (ví dụ: nếu đó là trang thái của HTTP session đang được lưu trữ dưới dạng bản sao trong trường hợp máy chủ bị lỗi). Giải nén theo kiểu `lazy` giúp tiết kiệm thời gian của CPU (từ việc bỏ qua giải nén) và bộ nhớ (vì dữ liệu nén chiếm ít dung lượng hơn).

Vì vậy, ngay cả khi ứng dụng được chạy ở mạng cục bộ, tốc độ cao - và rõ ràng nếu mục đích là tiết kiệm bộ nhớ hơn là thời gian - thì việc nén dữ liệu để `serialization` và sau đó giải nén theo kiểu `lazy` nó có thể khá hữu ích.

Nếu mục đích của `serialization` là để truyền dữ liệu qua mạng, thì nén sẽ giàng chiến thằng bất kỳ lúc nào. Bảng 3 thực hiện `serialization` tương tự cho 10,000 đối tượng hàng tồn kho, nhưng lần này nó lại truyền dữ liệu qua một tiến trình khác. Tiến trình khác hoặc chạy trên cùng 1 máy, hoặc trên một máy được truy cập thông qua kết nối băng thông rộng của tôi.

Bảng 3: Thời gian truyền tải 10,000 đồi tượng qua mạng 
![Bảng 3](/assets/images/posts/2022-10-25/serialization-3.png)

Giao tiếp mạng nhanh nhất là giao tiếp giữa 2 tiến trình trên cùng 1 máy - giao tiếp đó hoàn toàn không đi qua mạng, mặc dù nó gửi dữ liệu thông qua giao diện của hệ điều hành. Ngay cả trong trường hợp đó, việc nén dữ liệu và giải nén dữ liệu theo kiểu `lazy` đã dần đạt tới hiệu quả nhanh nhất (ít nhất đối với thử nghiệm này). Và thứ tự chênh lệch về độ lớn trong lượng dữ liệu đã tạo ra khác biệt lớn (có thể dự đoán được) trong tổng thời gian khi có sự tham gia của mảng chậm hơn.

### Theo dõi các đối tượng trùng lặp 
Phần này bắt đầu với một ví dụ về cách không `serialization` dữ liệu có chứa các tham chiếu dữ liệu, để tránh các tham chiếu đối tượng bị xâm phạm khi dữ liệu được `deserialization`. Tuy nhiên, một trong nhưng cách tối ưu hoá manh mẽ hơn có thể có trong phương thức `writeObject()` là không viết ra các tham chiếu đối tượng trùng lặp. Trong trường hợp của lớp `StockPriceHistoryImpl`, điều đó có nghĩa là không viết ra các tham chiếu trùng lặp của bàn đồ giá. Bời vì ví dụ sử dụng một lớp JDK tiêu chuẩn cho bản đồ đó, chúng ta không cần lo lắng về điều đó: các lớp JDK đã được viết để `serialization` một các tối ưu. Tuy nhiên, cần xem xét các lớp đó thực hiện tối ưu hoá như thế nào để hiểu điều gì có thể xảy ra.

Trong lớp `StockPriceHistoryImpl`, cấu trúc khoá là một sơ đồ cây. Một phiên bản đơn giản của bản đồ đó xuất hiện trong hình 1 với `serialization` mặc định, JVM sẽ ghi ra các trường dữ liệu ban đầu cho node A; thì nó sẽ gọi đệ quy phương thức `writeObject()` cho node B (và sau đó cho node C). Mã code cho node B có thể viết ra trường dữ liệu ban đầu của nó, và sau đó đệ quy viết ra dữ liệu cho trường cha của nó.

Nhưng chờ một chút - trường cha đó là node A, đã được viết. Mã `serialization` đối tượng đủ thông minh để nhận ra rằng: nó không viết lại dữ liệu cho node A. Thay vào đó, nó chỉ thêm một tham chiếu đối tượng và dữ liệu đã được ghi trước đó.

Theo dõi tập hợp các đối tượng viết trước đó, cũng như tất cả các đệ quy đó, sẽ thêm một hiệu xuất nhỏ vào `serialization` đối tượng. Tuy nhiên, như được minh hoạ trong ví dụ với một mảng của đối tượng điểm, nó không thể tránh được điều này: mã code phải theo dõi đối tượng viết ra trước đó và tạo lại các tham chiếu đối tượng chính xác. Tuy nhiên, có thể thực hiện tối ưu hoá thông minh bằng cách loại bỏ các tham chiếu đối tượng có thể dễ dàng tạo lại khi đối tượng được `deserialization`.

Hình 1: Cấu trúc sơ đồ cây đơn giản
![Hình 1](/assets/images/posts/2022-10-25/serialization-f-1.png)

Các bộ sưu tập khác nhau xử lý điều này theo cách khác nhau. Ví dụ, lớp `TreeMap` chỉ đơn giản lặp qua cây và chỉ ghi lại các khoá và giá trị; `serialization` loại bỏ tất cả các thông tin về mối quan hệ giữa các khoá (tức là thứ tự sắp xếp của chúng). Khi dữ liệu đã được `deserialization`, phương thức `readObject()` sẽ sắp xếp lại dữ liệu để tạo ra một cây. Mặc dù sắp xếp lại đối tượng nghe có vẻ tốn kém, nhưng không phải vậy: quá trình đó nhanh hơn khoảng 20% trên một tập hợp 10,000 đối tượng hàng tồn kho so với việc sử dụng `serialization` mặc định, theo đuổi tất cả các tham chiếu đối tượng.

Lớp TreeMap cũng được hưởng lợi từ việc tối ưu hoá bời vì nó có thể viết ra ít đối tượng hơn. Một node (hoặc trong ngôn ngữ JDK, một Entry) trong bản đồ chứa 2 đối tượng: khoá và giá trị. Bởi vì bản đồ không thể chứa 2 node giống nhau, mã code `serialization` không cần lo lắng về việc bảo toàn các tham chiếu đối tượng đến các node. Trong trường hợp này, nó có thể bỏ qua việc viết đối tượng node chính nó, và đơn giảm chỉ ghi trực tiếp các đối tượng khoá và giá trị. Vì vậy, phương thức `writeObject()` trông giống như thế này (cú pháp điều chỉnh cho dễ đọc):
```java
private void writeObject(ObjectOutputStream oos) throws IOException { 
  ....
  for (Map.Entry<K,V> e : entrySet()) { 
    oos.writeObject(e.getKey()); 
    oos.writeObject(e.getValue());
  }
  .... 
}
```
Điều này trông rất giống với mã code không hoạt động cho ví dụ Point. Sự khác biệt trong trường hợp này là mã code vẫn đang viết các đối tượng trong đó các đối tượng đó có thể giống nhau. Bản đồ cây không thể có 2 node giống nhau, vì vậy không cần phải viết ra node tham chiếu. Bản đồ cây có thể có 2 giá trị giống nhau, vì vậy các giá trị phải được viết dưới dạng tham chiếu đối tượng.

Điều này mang lại cho chúng ta một vòng tròn đầy đủ: như tôi đã nêu ở đầu phần này, việc tối ưu hoá đối tượng `serialization` chính xác có thể rất khó. Nhưng khi `serialization` đối tượng là một nút thắt cổ chai đáng kể trong ứng dụng, việc tối ưu hoá chúng 1 cách chính xác có thể mang lại lợi ích quan trọng.

### Điều gì về Externalizable?
Phần này chưa nói về một cách tiếp cận khác để tối ưu `serialization` đối tượng, đó là triển khai giao diện `Externalizable` chứ không phải là giao diện `Serializable`.

Sự khác biệt thực tế giữa 2 giao diện này là chúng xử lý các trường được đánh dấu là `transient`. Giao diện `Serializable` viết ra các trường không được đánh dấu khi phương thức `writeObject()` gọi phương thức `defaultWriteObject()`. Giao diện `Externalizable` không có phương thức như vậy. Lớp `Externalizable` phải viết rõ ràng ra tất cả các trường, `transient` hoặc không, mà nó quan tâm đến trong khi truyền.

Nếu như tất cả các trường trong đối tượng là `transient`, tốt hơn là nên trên khai giao diện `Serializable` và gọi phương thức `defaultWriteObject()`. Điều đó dẫn đến mã code dễ bảo trì hơn nhiều khi có các trường được thêm vào (hoặc xoá đi). Và không có lợi ích nào đối với giao diện `Externalizable` từ quan điểm hiệu xuất: cuối cùng, điều quan trọng vẫn là số lượng dữ liệu được ghi.

### Tóm tắt nhanh 
1. `serialization` dữ liệu, đặc biệt trong Java EE, có thể là một điểm nghẽn hiệu xuất lớn
2. Đánh dấu các biến là `transient` sẽ giúp `serialization` nhanh hơn và giảm lượng dữ liệu được truyền tải. Cả 2 điều đó thường là những chiến thắng hiệu xuất lớn, trừ khi việc tạo lại dữ liệu ở nơi nhận mất một thời gian rất dài.
3. Các tối ưu khác thông qua phương thức `writeObject()` và `readObject()` có thể tăng tốc `serialization` một cách đáng kể. Tiếp cận chúng một cách thận trong, vì rất dễ mắc lỗi và tạo ra một lỗi khó phát hiện.
4. Nén dữ liệu `serialization` thường có lợi, ngay cả khi dữ liệu không truyền qua mạng chậm 

## Refs:
1. Sách Java Performance - The Definitive Guide
