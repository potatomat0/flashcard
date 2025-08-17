### **1. Giới thiệu về Spaced Repetition System (SRS)**

`Spaced Repetition System` (SRS), hay Hệ thống Lặp lại Ngắt quãng, là một phương pháp học tập dựa trên bằng chứng khoa học nhằm giải quyết vấn đề ghi nhớ thông tin dài hạn. Nền tảng của phương pháp này đến từ nghiên cứu của nhà tâm lý học Hermann Ebbinghaus về "đường cong lãng quên" (`forgetting curve`), một biểu đồ cho thấy khả năng lưu giữ thông tin của con người giảm dần theo thời gian theo một hàm số mũ nếu không có sự ôn tập.

SRS hoạt động bằng cách chống lại đường cong này một cách hiệu quả. Thay vì ôn tập một cách ngẫu nhiên, hệ thống sẽ theo dõi hiệu suất của người học đối với từng đơn vị kiến thức. Nó sẽ tính toán và dự đoán thời điểm tối ưu mà người học sắp quên một thông tin, và hiển thị lại thông tin đó ngay trước thời điểm đó. Các khoảng thời gian giữa những lần ôn tập sẽ ngày càng dài ra khi người học chứng tỏ mình đã nắm vững kiến thức. Quá trình này, được gọi là `active recall` (chủ động gợi nhớ), giúp củng cố các liên kết thần kinh một cách mạnh mẽ hơn nhiều so với việc chỉ đọc lại một cách thụ động.

Bằng cách cá nhân hóa lịch trình ôn tập cho từng thẻ bài, SRS đảm bảo rằng người học dành nhiều thời gian hơn cho những kiến thức khó và ít thời gian hơn cho những gì họ đã biết rõ, từ đó tối ưu hóa đáng kể hiệu quả học tập.

`**insert picture here and describe what kind of image you want to insert**`
*(Mô tả ảnh: Chèn một biểu đồ minh họa "đường cong lãng quên". Biểu đồ có một đường cong dốc xuống thể hiện sự lãng quên. Tại các điểm khác nhau trên đường cong, có các mũi tên chỉ lên ghi "Ôn tập lần 1", "Ôn tập lần 2",... mỗi lần ôn tập sẽ đưa đường cong trở lại mức cao nhất và làm cho độ dốc của lần quên tiếp theo thoải hơn, minh họa cho việc khoảng thời gian giữa các lần ôn tập ngày càng dài ra.)*

### **2. Giới thiệu về cơ sở dữ liệu phi quan hệ (Non-relational database)**

Cơ sở dữ liệu (`database`) là nền tảng của mọi ứng dụng phần mềm, và trong lịch sử, mô hình quan hệ (`SQL`) đã chiếm ưu thế. Mô hình này tổ chức dữ liệu trong các bảng có cấu trúc chặt chẽ với các hàng và cột, được định nghĩa bởi một `schema` (lược đồ) cố định. Tuy nhiên, với sự phát triển của các ứng dụng web hiện đại, nhu cầu về sự linh hoạt và khả năng mở rộng đã dẫn đến sự ra đời của cơ sở dữ liệu phi quan hệ, hay còn gọi là `NoSQL`.

Không giống như `SQL`, một `non-relational database` không yêu cầu một `schema` cứng nhắc. Thay vào đó, nó lưu trữ dữ liệu dưới các định dạng linh hoạt hơn, phổ biến nhất là mô hình hướng tài liệu (`document-oriented`). Trong mô hình này, mỗi bản ghi là một "tài liệu" độc lập, thường ở định dạng `JSON` (JavaScript Object Notation) hoặc `BSON` (Binary JSON), chứa tất cả thông tin liên quan đến nó. Ví dụ, thông tin của một người dùng, bao gồm các bộ bài và thẻ bài của họ, có thể được lồng vào nhau trong cùng một tài liệu.

Cách tiếp cận này mang lại hai lợi ích chính: sự linh hoạt trong việc phát triển (dễ dàng thêm các trường dữ liệu mới mà không cần thay đổi toàn bộ cấu trúc) và khả năng mở rộng theo chiều ngang một cách hiệu quả, rất phù hợp cho các hệ thống có lượng dữ liệu lớn và cấu trúc phức tạp, thay đổi liên tục.

`**insert picture here and describe what kind of image you want to insert**`
*(Mô tả ảnh: Chèn một hình ảnh so sánh song song. Bên trái là một bảng `SQL` đơn giản cho "Users" với các cột `ID`, `Name`, `Email`. Bên phải là một đối tượng `JSON` thể hiện cùng một người dùng, cho thấy dữ liệu được tổ chức dưới dạng cặp key-value một cách linh hoạt hơn.)*

### **3. Giới thiệu về kiến trúc RESTful API**

`API` (Application Programming Interface) là một tập hợp các quy tắc và giao thức cho phép các ứng dụng phần mềm khác nhau giao tiếp với nhau. Trong đó, `REST` (Representational State Transfer) là một kiểu kiến trúc (`architectural style`) cực kỳ phổ biến để thiết kế các `API` trên nền tảng web, và một `API` tuân thủ các nguyên tắc của `REST` được gọi là `RESTful API`.

Kiến trúc `RESTful` hoạt động dựa trên một số nguyên tắc cốt lõi. Quan trọng nhất là nguyên tắc `stateless` (phi trạng thái), nghĩa là máy chủ không lưu trữ bất kỳ thông tin nào về trạng thái của client giữa các yêu cầu. Mỗi yêu cầu từ client phải chứa tất cả thông tin cần thiết để máy chủ có thể hiểu và xử lý nó. Điều này giúp hệ thống trở nên đơn giản và dễ dàng mở rộng.

`REST` tận dụng các phương thức tiêu chuẩn của giao thức `HTTP` để thực hiện các hành động trên tài nguyên (`resource`). Các `resource` này được xác định bởi các `endpoint` (URL). Có thể hình dung các `HTTP methods` như những động từ và `endpoint` như những danh từ:
*   `GET`: Lấy thông tin về một tài nguyên (ví dụ: lấy danh sách các bộ bài).
*   `POST`: Tạo một tài nguyên mới (ví dụ: tạo một người dùng mới).
*   `PUT` / `PATCH`: Cập nhật một tài nguyên đã có.
*   `DELETE`: Xóa một tài nguyên.

Kiến trúc này tạo ra một giao diện rõ ràng, nhất quán và dễ dự đoán cho việc tương tác giữa client và server.

`**insert picture here and describe what kind of image you want to insert**`
*(Mô tả ảnh: Chèn một sơ đồ sequence diagram đơn giản. Sơ đồ có hai cột: `Client` và `Server`. Các mũi tên đi từ `Client` đến `Server` ghi các yêu cầu như `POST /api/decks` và `GET /api/decks/{id}`. Các mũi tên phản hồi từ `Server` về `Client` ghi các mã trạng thái như `201 Created` và `200 OK`.)*

### **4. Giới thiệu về JSON Web Token (JWT)**

Một trong những thách thức của kiến trúc `RESTful API` là tính `stateless`. Nếu máy chủ không nhớ client là ai, làm thế nào để nó xác thực (`authentication`) và cấp quyền (`authorization`) cho các yêu cầu? `JSON Web Token` (JWT) ra đời để giải quyết chính xác vấn đề này.

`JWT` là một tiêu chuẩn mở (RFC 7519) định nghĩa một phương thức nhỏ gọn và khép kín để truyền tải thông tin an toàn giữa các bên dưới dạng một đối tượng `JSON`. Thông tin này có thể được xác minh và tin cậy vì nó đã được ký điện tử.

Một `JWT` bao gồm ba phần được phân tách bởi dấu chấm (`.`):
1.  **Header**: Chứa thông tin về thuật toán được sử dụng để ký token, ví dụ như `HMAC SHA256` hoặc `RSA`.
2.  **Payload**: Chứa các "claims", là những thông tin về một thực thể (thường là người dùng) và các dữ liệu bổ sung. Ví dụ, `payload` có thể chứa `userId`, tên người dùng, và thời gian hết hạn của token.
3.  **Signature**: Để tạo ra chữ ký, ta cần mã hóa `header`, `payload`, một "secret key" (khóa bí mật) chỉ có server biết, và sau đó đưa chúng qua thuật toán đã được chỉ định trong `header`.

Khi client gửi một yêu cầu kèm `JWT`, server sẽ sử dụng `secret key` của mình để xác minh chữ ký. Nếu chữ ký hợp lệ, server có thể tin tưởng rằng `payload` không hề bị thay đổi và tiến hành xử lý yêu-cầu. Điều này cho phép xác thực mà không cần lưu trữ session trên server.

`**insert picture here and describe what kind of image you want to insert**`
*(Mô tả ảnh: Chèn một biểu đồ trực quan về cấu trúc của một `JWT`. Biểu đồ gồm ba khối màu khác nhau đặt cạnh nhau, được dán nhãn `Header`, `Payload`, và `Signature`. Bên dưới là một ví dụ về một chuỗi `JWT` đã được mã hóa, có dạng `xxxxx.yyyyy.zzzzz`, để minh họa cho định dạng cuối cùng.)*

### **5. Giới thiệu MongoDB**

`MongoDB` là một hệ quản trị cơ sở dữ liệu `NoSQL` mã nguồn mở hàng đầu, thuộc loại cơ sở dữ liệu hướng tài liệu (`document-oriented`). Thay vì lưu trữ dữ liệu trong các bảng và hàng như cơ sở dữ liệu quan hệ, `MongoDB` lưu trữ các cấu trúc dữ liệu dưới dạng các tài liệu giống `JSON`, được gọi là `BSON` (Binary JSON). Các tài liệu này được nhóm lại trong các `collection`, có vai trò tương tự như các bảng trong `SQL`.

Mỗi tài liệu (`document`) trong một `collection` có thể có cấu trúc hoàn toàn khác nhau, mang lại sự linh hoạt tối đa trong việc lưu trữ dữ liệu phi cấu trúc hoặc bán cấu trúc. `Schema` linh hoạt này cho phép các nhà phát triển dễ dàng thay đổi và phát triển ứng dụng mà không cần phải thực hiện các thao tác di chuyển dữ liệu (`migration`) phức tạp.

`MongoDB` được thiết kế với khả năng mở rộng theo chiều ngang (`horizontal scaling`) làm trọng tâm, cho phép nó xử lý các tập dữ liệu khổng lồ và khối lượng công việc lớn bằng cách phân phối dữ liệu trên nhiều máy chủ, một quá trình được gọi là `sharding`. Sự kết hợp giữa tính linh hoạt, hiệu suất và khả năng mở rộng làm cho `MongoDB` trở thành một lựa chọn cực kỳ phổ biến cho các ứng dụng web hiện đại, đặc biệt là khi được sử dụng cùng với `Node.js`.

`**insert picture here and describe what kind of image you want to insert**`
*(Mô tả ảnh: Chèn một sơ đồ đơn giản minh họa cấu trúc của `MongoDB`. Sơ đồ cho thấy một `Database` chứa nhiều `Collection`. Một `Collection` được phóng to để cho thấy nó chứa nhiều `Document`, và một `Document` được hiển thị dưới dạng một đối tượng `JSON` với các cặp key-value.)*

### **6. Giới thiệu ExpressJS**

`Express.js`, hay đơn giản là `Express`, là một `framework` ứng dụng web tối giản và linh hoạt dành cho `Node.js`. Nó không áp đặt một cấu trúc cứng nhắc mà thay vào đó cung cấp một bộ tính năng mạnh mẽ để phát triển các ứng dụng web và `API` một cách nhanh chóng và dễ dàng. `Express` được xem là `framework` tiêu chuẩn trên thực tế cho việc phát triển backend bằng `Node.js`.

Chức năng cốt lõi của `Express` xoay quanh việc xử lý các yêu cầu `HTTP` và định tuyến (`routing`). Nó cho phép các nhà phát triển xác định các `route` để xử lý các yêu cầu đến các `endpoint` (URL) cụ thể với các `HTTP method` khác nhau (GET, POST, v.v.).

Một trong những khái niệm mạnh mẽ nhất của `Express` là hệ thống `middleware`. `Middleware` là các hàm có quyền truy cập vào đối tượng yêu cầu (`request`), đối tượng phản hồi (`response`), và hàm `next` trong chu trình yêu cầu-phản hồi của ứng dụng. Các hàm này có thể thực hiện các tác vụ như ghi log, xác thực người dùng, phân tích cú pháp `body` của yêu cầu, và xử lý lỗi. Kiến trúc dựa trên `middleware` này cho phép tạo ra một pipeline xử lý yêu cầu rất linh hoạt và có khả năng tái sử dụng cao.

`**insert picture here and describe what kind of image you want to insert**`
*(Mô tả ảnh: Chèn một sơ đồ minh họa pipeline của `Express`. Sơ đồ có một mũi tên lớn đi từ trái sang phải, ghi "Request". Trên đường đi của mũi tên, có các hộp nhỏ ghi "Middleware 1 (Logging)", "Middleware 2 (Authentication)", "Route Handler", và cuối cùng là một mũi tên đi ra ghi "Response".)*

### **7. Giới thiệu ReactJS**

`ReactJS`, thường được gọi là `React`, là một thư viện `JavaScript` mã nguồn mở được phát triển bởi Facebook, chuyên dùng để xây dựng giao diện người dùng (`User Interface` - UI), đặc biệt là cho các ứng dụng một trang (`Single-Page Application` - SPA). `React` không phải là một `framework` hoàn chỉnh mà tập trung hoàn toàn vào lớp `View` trong mô hình `MVC`.

Triết lý cốt lõi của `React` là xây dựng `UI` từ các mảnh ghép độc lập và có thể tái sử dụng được gọi là `component`. Mỗi `component` quản lý `state` (trạng thái) của riêng nó và khi `state` thay đổi, `React` sẽ tự động cập nhật và render lại `component` đó một cách hiệu quả.

Một trong những cải tiến kỹ thuật quan trọng nhất của `React` là `Virtual DOM` (DOM ảo). Thay vì thao tác trực tiếp trên `DOM` thật của trình duyệt (một quá trình rất chậm), `React` duy trì một bản sao của `DOM` trong bộ nhớ. Khi một `component` cần cập nhật, `React` sẽ so sánh `Virtual DOM` mới với phiên bản cũ, tính toán sự khác biệt tối thiểu (`diffing algorithm`), và sau đó chỉ cập nhật những phần thực sự thay đổi trên `DOM` thật. Điều này giúp tối ưu hóa đáng kể hiệu suất.

Ngoài ra, `React` sử dụng `JSX` (JavaScript XML), một phần mở rộng cú pháp cho phép viết mã trông giống `HTML` ngay bên trong `JavaScript`, giúp việc mô tả `UI` trở nên trực quan và dễ đọc hơn.

`**insert picture here and describe what kind of image you want to insert**`
*(Mô tả ảnh: Chèn một sơ đồ cây đơn giản minh họa cấu trúc `component` của `React`. Gốc cây là `App`, từ đó tỏa ra các nhánh con như `Header`, `Sidebar`, và `Content`. Nhánh `Content` lại có các nhánh con khác như `Article` và `Comments`, cho thấy cách `UI` được chia thành các `component` lồng vào nhau.)*

### **8. Giới thiệu Node.js**

`Node.js` là một môi trường thực thi (`runtime environment`) `JavaScript` mã nguồn mở, đa nền tảng, cho phép các nhà phát triển chạy mã `JavaScript` ở phía máy chủ (`server-side`), bên ngoài trình duyệt. Nó được xây dựng trên `V8 JavaScript engine` của Chrome, công cụ đã được tối ưu hóa cao về hiệu suất.

Điểm khác biệt lớn nhất của `Node.js` so với các môi trường server-side truyền thống khác là mô hình `I/O` (Input/Output) không đồng bộ và hướng sự kiện (`event-driven, non-blocking I/O`). Trong các mô hình truyền thống, khi một yêu cầu cần thực hiện một tác vụ `I/O` (như đọc file hoặc truy vấn cơ sở dữ liệu), luồng (`thread`) xử lý sẽ bị chặn lại cho đến khi tác vụ hoàn thành. Ngược lại, `Node.js` sử dụng một luồng sự kiện (`event loop`) duy nhất. Khi một tác vụ `I/O` được yêu cầu, `Node.js` sẽ gửi yêu cầu đó đi và ngay lập tức tiếp tục xử lý các yêu cầu khác. Khi tác vụ `I/O` hoàn thành, một sự kiện sẽ được đưa vào `event loop` và một hàm `callback` tương ứng sẽ được thực thi.

Mô hình này giúp `Node.js` xử lý hàng nghìn kết nối đồng thời với hiệu suất rất cao và chi phí tài nguyên thấp, làm cho nó trở thành một lựa chọn lý tưởng để xây dựng các ứng dụng mạng có khả năng mở rộng, đặc biệt là các `RESTful API`, ứng dụng thời gian thực và `microservice`.

`**insert picture here and describe what kind of image you want to insert**`
*(Mô tả ảnh: Chèn một sơ đồ đơn giản minh họa `Event Loop` của `Node.js`. Sơ đồ có một vòng tròn ghi "Event Loop". Các yêu cầu (`Request`) đi vào. Nếu là tác vụ nhanh, nó được xử lý ngay. Nếu là tác vụ `I/O` chậm, nó được gửi đến một `Worker Thread Pool`. Khi hoàn thành, một `Callback` được đưa trở lại vào `Event Loop` để gửi `Response`.)*

### **9. Giới thiệu mô hình MVC**

`MVC` (Model-View-Controller) là một mẫu kiến trúc phần mềm (`architectural pattern`) được sử dụng rộng rãi để tổ chức mã nguồn của một ứng dụng thành ba phần có liên quan với nhau. Mục tiêu chính của `MVC` là tách biệt giữa logic nghiệp vụ (`business logic`) và giao diện người dùng (`user interface`), giúp cho ứng dụng trở nên dễ quản lý, bảo trì và phát triển hơn.

Ba thành phần của mô hình `MVC` bao gồm:
1.  **Model**: Là thành phần chịu trách nhiệm quản lý dữ liệu và logic nghiệp vụ của ứng dụng. Nó tương tác trực tiếp với cơ sở dữ liệu, thực hiện các thao tác như truy vấn, thêm, sửa, xóa dữ liệu. `Model` không biết gì về cách dữ liệu sẽ được hiển thị. Nó chỉ cung cấp dữ liệu khi `Controller` yêu cầu.
2.  **View**: Là thành phần chịu trách nhiệm hiển thị dữ liệu cho người dùng, tức là giao diện người dùng (UI). `View` nhận dữ liệu từ `Controller` và trình bày nó một cách trực quan. `View` không chứa bất kỳ logic nghiệp vụ nào; nhiệm vụ của nó chỉ đơn thuần là hiển thị.
3.  **Controller**: Đóng vai trò là trung gian giữa `Model` và `View`. Nó nhận các yêu cầu đầu vào từ người dùng (thông qua `View`), sau đó tương tác với `Model` để xử lý các yêu cầu đó (ví dụ: lấy dữ liệu hoặc cập nhật dữ liệu). Cuối cùng, `Controller` chọn một `View` thích hợp và truyền dữ liệu cần thiết cho `View` đó để hiển thị kết quả cho người dùng.

Sự phân tách rõ ràng này giúp các nhà phát triển có thể làm việc song song trên các thành phần khác nhau mà không ảnh hưởng lẫn nhau.

`**insert picture here and describe what kind of image you want to insert**`
*(Mô tả ảnh: Chèn một sơ đồ luồng dữ liệu hình tam giác cổ điển của `MVC`. `User` tương tác với `Controller`. `Controller` thao tác với `Model`. `Model` cập nhật `View`. `View` hiển thị cho `User`. Các mũi tên chỉ rõ luồng điều khiển và luồng dữ liệu giữa ba thành phần.)*
