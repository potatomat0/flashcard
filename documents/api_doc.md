
## Kiểm thử API 

Trước khi kiểm thử, đảm bảo một backend server đang bật tại localhost hoặc server đã được host tại một tên miền nhất định như đã làm ở phần deploy.

### Đối với local test (yêu cầu cấp quyền database admin)
Nếu chạy local, sử dụng lệnh npm start và dữ nguyên daemon

trước hết, cần biết địa chỉ IP công khai để whitelist vào cloud atlas. quá trình này cần có 

```bash
# tìm IP công khai 
curl ifconfig.me 
```

để chạy server, vào thư mục ./server 
```bash
cd ./server 
npm install
npm start # server sẽ được chạy tại localhost:5001
```
khi server được chạy, có thể sử dụng công cụ kiểm thử API để sử dụng các chức năng API

nếu muốn restart server nhưng không được, có thể dùng lệnh:

```bash
lsof -i :5001 # tìm PID của port đang chạy 
kill -9 <PID của port 5001> 
```

### Đối với baseurl được host (công khai)

Nếu host ở tên miền, sử dụng lệnh ping để kiểm tra server có đang được khởi động. Vì đây là dịch vụ hosting miễn phí, nên sau một khoảng thời gian không có request, Render sẽ tự động đưa server vào trạng thái ngủ:

```bash
ping flashcard-rs95.onrender.com 
```

### Tiến hành kiểm thử

**Postman WorkSpace hoàn thiện được lưu tại:** [Postman - flashcardapp-test](https://www.postman.com/sirnhat0-2859519/flashcardapp-test/overview)
**API document cụ thể được lưu tại**: 
**{{baseurl}}**: [flashcard-rs95.onrender.com](https://flashcard-rs95.onrender.com)

Custom code cho phương thức Login để lưu token: 
```javascript
const responseData = pm.response.json();
if (responseData && responseData.token) {
pm.environment.set("authToken",
responseData.token);
console.log("Auth Token saved toenvironment variable 'authToken'.");
} else {console.log('no token found in the response')}
```
### Quản lý người dùng

#### Register 

- Chức năng: Đăng ký tài khoản người dùng 
- Phương thức: POST 
- Endpoint: {{baseurl}}/api/users/register
- Header: content-type = application/json
- Authorization: Chưa cần đến
Ràng buộc: 
- Username ít nhất phải có 3 ký tự 
- Name không được bỏ trống 
- Định dạng email phải hợp lệ 
- Mật khẩu ít nhất phải có 6 ký tự 
Body: 
```json
{
"username": "testUser1",
"name": "Nhat Test 1",
"email": "24550031@gm.uit.edu.vn",
"password": "password123456"
}
```
Response: 
```json
{
    "_id": "68a188f350e80d6b91f11336",
    "username": "testUser1",
    "name": "Nhat Test 1",
    "email": "24550031@gm.uit.edu.vn",
    "createdAt": "2025-08-17T07:46:59.035Z",
    "updatedAt": "2025-08-17T07:46:59.035Z"
}
```

#### Login 

- Chức năng: Đăng nhập tài khoản người dùng 
- Phương thức: POST 
- Endpoint: {{baseurl}}/api/users/login
- Authorization: Chưa cần 
- Header: content-type = application/json
- Body: 
```json
{
"email": "testuser123@example.com",
"password": "password123"
}
```

Trước khi login, đảm bảo nhập vào body tài khoản đã được tạo.
Sau khi đăng nhập thành công, lưu token hoặc tạo script để tự động lưu vào biến Authorization ở header cho các phương thức yêu cầu xác nhận user. token này sẽ hết hạn sau 1 ngày và cần khởi tạo lại phiên đăng nhập mới.

Khi sử dụng bearer Token, server không cần quản lý endpoint cho phương thức đăng xuất. Để xác thực và thao tác trên người dùng mới, ta chỉ cần xóa hoặc đổi giá trị authToken

Response:

```json
{
    "token": "{{vault:json-web-token}}",
    "user": {
        "id": "68982698be9f3f4c66a27947",
        "username": "testUser1",
        "name": "Nhat Test 1"
    }
}
```

#### Update User 

- Chức năng: cập nhật thông tin người dùng 
- Phương thức: PATCH
- Endpoint: {{baseurl}}/api/users/profile
- Header: content-type = application/json
- Authorization: {{authToken}}
- Body: 
```json
{
	"name": "Nguyen Van A",
	"password": "password123456"
	
}
```

Đối với body, cần điền một thông tin user (user mà trước đó đã đăng nhập bằng phương thức login) khác với thông tin hiện tại. 
**Ví dụ**: đổi email của user từ testuser123@example.com thành testuser1234@example.com  

Ở phần authorization, chọn đúng loại auth type là "Bearer Token", và giá trị là biến môi trường đã được cập nhật ({{authToken}})

Response:

```json
{
	"_id":"68982698be9f3f4c66a27947",
	"username":"testUser1",
	"name":"Nguyen Van A",
	"email":"24550031@gm.uit.edu.vn"
}
```
- #### Delete user 

- Chức năng: Xóa người dùng 
- Phương thức: DELETE
- Endpoint: {{baseurl}}/api/users/profile
- Body: không cần body. 
- Authorization: {{authToken}}
- Header: Mặc định
- Response:
```json
{
	"message": "User accoutn and all associated data deleted successfully"
}
```
### Quản lý Deck

#### Create deck 

- Chức năng: Tạo một bộ bài cho người dùng 
- Phương thức: POST
- Endpoint: {{baseurl}}/api/decks/
- Header: content-type = application/json
- Body: 
```json
{
	"name": "English for the academia",
	"description": "advanced eglish for researchers and university students"	
}
```
- Authorization: {{authToken}}
- response: 

```json
{
    "user_id": "68982698be9f3f4c66a27947",
    "name": "English for the academia",
    "description": "advanced eglish for researchers and university students",
    "url": "",
    "size": 0,
    "_id": "68a2abd21d1c448e4d9ab33b",
    "createdAt": "2025-08-18T04:28:02.396Z",
    "updatedAt": "2025-08-18T04:28:02.396Z",
    "__v": 0
}1
```
### Get all decks 

- Chức năng: Lấy danh sách tất cả các bộ bài của người dùng
- Phương thức: GET 
- Endpoint: {{baseurl}}/api/decks/
- Header: content-type = application/json
- Body: Không cần body 
- Authorization: {{authToken}}
- Param: 
    - page: số trang muốn được hiển thị 
    - limit: số deck tối đa muốn hiển thị ở mỗi trang 
- - response: 

```json
{
    "totalPages": 1,
    "currentPage": 1,
    "totalDecks": 2,
    "decks": [
        {
            "_id": "68a17f24de06e4650baffbfa",
            "name": "từ vựng văn phòng",
            "description": "list 20 từ vựng văn phòng phổ biến nhất",
            "url": "https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg",
            "size": 20,
            "createdAt": "2025-08-17T07:05:08.783Z",
            "updatedAt": "2025-08-17T07:05:08.783Z"
        },
        {
            "_id": "68a17f24de06e4650baffbfc",
            "name": "từ vựng công nghệ thông tin",
            "description": "list 20 từ vựng CNTT phổ biến nhất",
            "url": "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
            "size": 20,
            "createdAt": "2025-08-17T07:05:08.860Z",
            "updatedAt": "2025-08-17T07:05:08.860Z"
        }
    ]
}
```

### Get single deck 

- Chức năng: Lấy cụ thể một bộ bài của người dùng
- Phương thức: GET 
- Endpoint: {{baseurl}}/api/decks/{deckId}
- Header: content-type = application/json
- Body: Không cần body 
- Authorization: {{authToken}}
- response: 
```json
{
    "_id": "68a17f24de06e4650baffbfa",
    "name": "từ vựng văn phòng",
    "description": "list 20 từ vựng văn phòng phổ biến nhất",
    "url": "https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg",
    "size": 20,
    "createdAt": "2025-08-17T07:05:08.783Z",
    "updatedAt": "2025-08-17T07:05:08.783Z"
}
```

### Update a deck 

- Chức năng: Cập nhật tên và miêu tả của bộ bài
- Phương thức: GET 
- Endpoint: {{baseurl}}/api/decks/{deckId}
- Header: content-type = application/json
- Body: một trong hai hoặc cả hai trường 
```json
{
	"description": "information technology termilogies and computer science concepts"
}
```
- Authorization: {{authToken}}
- response: 

```json
{
    "_id": "68a1a857b7d6ea9469e78c73",
    "user_id": "68982698be9f3f4c66a27947",
    "name": "IT and CS vocab",
    "description": "information technology termilogies and computer science concepts",
    "url": "",
    "size": 0,
    "createdAt": "2025-08-17T10:00:55.760Z",
    "updatedAt": "2025-08-17T10:02:54.692Z",
    "__v": 0
}
```

### Delete deck 

- Chức năng: Cập nhật tên và miêu tả của bộ bài
- Phương thức: DELETE
- Endpoint: {{baseurl}}/api/decks/{deckId}
- Header: mặc định
- Body: không cần
- Authorization: {{authToken}}
- response: 

```json
{
	"message": "Deck and associated cards removed"
}
```
### Add card to deck 

- Chức năng: Thêm một lá bài vào một bộ bài cụ thể
- Phương thức: DELETE
- Endpoint: {{baseurl}}/api/decks/{{deckID}}/cards
- Header: content-type = application/json
- Body: 
```json
{
"name": "Silly",
"definition": "ngốc, khờ",
"hint": "stupid, fool",
"category": ["adjective","personality"]
}
```
Authorization: {{authToken}}
response: 
**Note**: API cho phép nhập nhiều card trong cùng một request

### Quản lý card

#### Get all cards in deck

- Chức năng: GET tất cả các lá bài từ một bộ bài cụ thể
- Phương thức: GET
- Endpoint: {{baseurl}}/api/decks/{{deckID}}/cards
- Header: mặc định
- Body: không cần
- Authorization: {{authToken}}
- Param: 
    - page: số trang muốn được hiển thị 
    - limit: số thẻ tối đa mỗi trang 
response: 
```json
{
    "totalPages": 1,
    "currentPage": 1,
    "totalCards": 4,
    "cards": [
        {
            "_id": "68a186ab70ecfa4d3b31bb95",
            "deck_id": "6898bec0f54fb294513380c1",
            "name": "office",
            "definition": "văn phòng",
            "word_type": "noun",
            "url": "",
            "hint": "room where people work",
            "example": [
                "Did you go to the office last Friday?",
                "Our office is located downtown."
            ],
            "category": [
                "work",
                "places"
            ],
            "frequency": 3,
            "createdAt": "2025-08-17T07:37:15.982Z",
            "updatedAt": "2025-08-17T07:37:15.982Z",
            "__v": 0
        },
     ...
    ]
}
```

#### Get single card 

- Chức năng: GET một lá bài cụ thể 
- Phương thức: GET
- Endpoint: {{baseurl}}/api/cards/:id
- Header: mặc định
- Body: không cần
- Authorization: {{authToken}}
- response: 

```json
{
    "_id": "6898d683953dce0bc0dc699a",
    "deck_id": "6898d06cd5126ec04f0be4f0",
    "name": "Silly",
    "definition": "ngốc, khờ",
    "hint": "stupid, fool, goofy",
    "category": [
        "adjective",
        "personality"
    ],
    "frequency": 4,
    "createdAt": "2025-08-10T17:27:31.882Z",
    "updatedAt": "2025-08-17T10:58:18.218Z",
    "__v": 1,
    "example": [],
    "url": "https://res.cloudinary.com/dobaislqr/image/upload/v1755428204/media/image-1755428204313.jpg",
    "word_type": ""
}
```

#### Update a card 

Chức năng: Update một thuộc tính bất kỳ của thẻ 
Phương thức: PATCH 
Endpoint: {{baseurl}}/api/cards/{{cardID}}
Header: Content-type = application/json 
Body: 
```json
{
	"name": "Silly",
	"definition": "ngốc, khờ",
	"hint": "stupid, fool, goofy",
	"category": ["adjective","personality"]
}
```
Authorization: {{authToken}}
response: 200 
```json
{
    "_id": "6898d683953dce0bc0dc699a",
    "deck_id": "6898d06cd5126ec04f0be4f0",
    "name": "Silly",
    "definition": "ngốc, khờ",
    "hint": "stupid, fool, goofy",
    "category": [
        "adjective",
        "personality"
    ],
    "frequency": 4,
    "createdAt": "2025-08-10T17:27:31.882Z",
    "updatedAt": "2025-08-17T10:58:18.218Z",
    "__v": 1,
    "example": [],
    "url": "https://res.cloudinary.com/dobaislqr/image/upload/v1755428204/media/image-1755428204313.jpg",
    "word_type": ""
}
```

![[Pasted image 20250811150502.png]]

#### Delete Card 

- Chức năng: Xóa một thẻ dựa vào ID 
- Phương thức: DELETE
- Endpoint: {{baseurl}}/api/cards/{{cardID}}
- Header: Content-type = application/json 
- Response: 

```json
{
	"message": "Card removed successfully"
}
```

#### Search card by name or definition 

- Chức năng: Fuzzy search các thẻ trong tất cả các deck của người dùng dựa vào từ khóa tìm kiếm của tên và định nghĩa thẻ 
- Phương thức: GET
- Endpoint: {{baseurl}}/api/cards/search/
- Header: Content-type = application/json 
- Param: 
    - name: tên thẻ cần tìm kiếm 
    - definition: định nghĩa cần tìm kiếm 

```json
{
    "totalPages": 1,
    "currentPage": 1,
    "totalCards": 2,
    "cards": [
        {
            "_id": "68a1883e50e80d6b91f11329",
            "deck_id": "6898bec0f54fb294513380c1",
            "name": "employee",
            "definition": "nhân viên",
            "word_type": "noun",
            "url": "",
            "hint": "person who works for a company",
            "example": [
                "She is a dedicated employee.",
                "The company has 500 employees."
            ],
            "category": [
                "work",
                "people"
            ],
            "frequency": 3,
            "__v": 0,
            "createdAt": "2025-08-17T07:43:58.361Z",
            "updatedAt": "2025-08-17T07:43:58.361Z"
        },
        {
            "_id": "68a1883e50e80d6b91f1132a",
            "deck_id": "6898bec0f54fb294513380c1",
            "name": "employer",
            "definition": "chủ lao động, người tuyển dụng",
            "word_type": "noun",
            "url": "",
            "hint": "person or company that hires workers",
            "example": [
                "My employer offers good benefits.",
                "The employer is looking for new staff."
            ],
            "category": [
                "work",
                "people"
            ],
            "frequency": 3,
            "__v": 0,
            "createdAt": "2025-08-17T07:43:58.361Z",
            "updatedAt": "2025-08-17T07:43:58.361Z"
        }
    ]
}
```

### Sử dụng danh sách từ vựng có sẵn 

#### Get all default decks 

- Chức năng: GET tất cả các deck có sẵn 
- Phương thức: GET
- Endpoint: {{baseurl}}/api/default-decks/
- Header: Content-type = application/json 
- Param: 
    - page: số trang muốn được hiển thị 
    - limit: số deck tối đa trong một trang 

response: 

```json
{
    "totalPages": 2,
    "currentPage": 2,
    "totalDecks": 2,
    "decks": [
        {
            "_id": "68a17f24de06e4650baffbfc",
            "name": "từ vựng công nghệ thông tin",
            "description": "list 20 từ vựng CNTT phổ biến nhất",
            "url": "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
            "size": 20,
            "createdAt": "2025-08-17T07:05:08.860Z",
            "updatedAt": "2025-08-17T07:05:08.860Z",
            "__v": 0
        }
    ]
}
```

#### Get 1 default deck by ID 

- Chức năng: Fuzzy search các thẻ trong tất cả các deck của người dùng dựa vào từ khóa tìm kiếm của tên và định nghĩa thẻ 
- Phương thức: GET
- Endpoint: {{baseurl}}/api/default-decks/{{deckID}}
- Header: mặc định 
- response: 

```json
{
            "_id": "68a17f24de06e4650baffbfc",
            "name": "từ vựng công nghệ thông tin",
            "description": "list 20 từ vựng CNTT phổ biến nhất",
            "url": "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
            "size": 20,
            "createdAt": "2025-08-17T07:05:08.860Z",
            "updatedAt": "2025-08-17T07:05:08.860Z",
            "__v": 0
}
```

#### Get all cards from default deck 

- Chức năng: Fuzzy search các thẻ trong tất cả các deck của người dùng dựa vào từ khóa tìm kiếm của tên và định nghĩa thẻ 
- Phương thức: GET
- Endpoint: {{baseurl}}/api/default-decks/{{deckID}}/cards
- Header: mặc định 
- param: 
    - page: số trang muốn hiển thị 
    - limit: số card tối đa mỗi trang 
response: 

```json
{
    "totalPages": 1,
    "currentPage": 1,
    "totalCards": 4,
    "cards": [
        {
            "_id": "68a186ab70ecfa4d3b31bb95",
            "deck_id": "6898bec0f54fb294513380c1",
            "name": "office",
            "definition": "văn phòng",
            "word_type": "noun",
            "url": "",
            "hint": "room where people work",
            "example": [
                "Did you go to the office last Friday?",
                "Our office is located downtown."
            ],
            "category": [
                "work",
                "places"
            ],
            "frequency": 3,
            "createdAt": "2025-08-17T07:37:15.982Z",
            "updatedAt": "2025-08-17T07:37:15.982Z",
            "__v": 0
        },
      ...
    ]
}
```


#### add default card(s) to personal deck 

- Chức năng: Thêm một hoặc nhiều thẻ được chọn vào một deck cá nhân 
- Phương thức: POST
- Endpoint: {{baseurl}}/api/default-decks/{{deckID}}/cards/from-default
- Header: content-type = application/json  
- Body 
```json
{
    "defaultCardId": 
        ["68a17f25de06e4650baffc02",
        "68a17f25de06e4650baffc00"]
}
```
response: 

```json
[
    {
        "deck_id": "6898bec0f54fb294513380c1",
        "name": "employee",
        "definition": "nhân viên",
        "word_type": "noun",
        "url": "",
        "hint": "person who works for a company",
        "example": [
            "She is a dedicated employee.",
            "The company has 500 employees."
        ],
        "category": [
            "work",
            "people"
        ],
        "frequency": 3,
        "_id": "68a1883e50e80d6b91f11329",
        "__v": 0,
        "createdAt": "2025-08-17T07:43:58.361Z",
        "updatedAt": "2025-08-17T07:43:58.361Z"
    },
    {
        "deck_id": "6898bec0f54fb294513380c1",
        "name": "employer",
        "definition": "chủ lao động, người tuyển dụng",
        "word_type": "noun",
        "url": "",
        "hint": "person or company that hires workers",
        "example": [
            "My employer offers good benefits.",
            "The employer is looking for new staff."
        ],
        "category": [
            "work",
            "people"
        ],
        "frequency": 3,
        "_id": "68a1883e50e80d6b91f1132a",
        "__v": 0,
        "createdAt": "2025-08-17T07:43:58.361Z",
        "updatedAt": "2025-08-17T07:43:58.361Z"
    }
]
```

#### clone default deck to personal deck 

- Chức năng: Fuzzy search các thẻ trong tất cả các deck của người dùng dựa vào từ khóa tìm kiếm của tên và định nghĩa thẻ 
- Phương thức: POST
- Endpoint: {{baseurl}}/api/default-decks/{{deckID}}/cards
- Header: mặc định
- Body: để trống
- response: 
```json
{
    "user_id": "68982698be9f3f4c66a27947",
    "name": "từ vựng công nghệ thông tin",
    "description": "list 20 từ vựng CNTT phổ biến nhất",
    "url": "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
    "size": 20,
    "_id": "68a2bb36f807ad5321ec42eb",
    "createdAt": "2025-08-18T05:33:42.905Z",
    "updatedAt": "2025-08-18T05:33:42.905Z",
    "__v": 0
}
```

### Phiên học tập 

### Create Review Session 

- Chức năng: Tạo một phiên ôn tập (review session) 
- Phương thức: POST
- Endpoint: 
 	- đôi với deck cá nhân: {{baseurl}}/api/decks/{{deckID}}/review-session
 	- đôi với deck có sẵn: {{baseurl}}/api/default-decks/{{deckID}}/review-session
- *note:* Đối với deck có sẵn, thẻ sau khi submit sẽ không được thay đổi frequency 
- Header: Content-type = application/json 
- Body: 
```json
{
  "Flashcard": 3,
  "MCQ": 3,
  "fillInTheBlank": 3
}
```
Authorization: {{authToken}}
response: 

```json 
{
    "flashcard": [
        {
            "_id": "6898d683953dce0bc0dc699a",
            "deck_id": "6898d06cd5126ec04f0be4f0",
	         ...
        },
        ...
    ],
    "mcq": [
        {
            "card_id": "6899ab5da7f16fb678fdc0d7",
            "prompt": "Review",
            "options": [
                "đánh giá, nhìn nhận lại",
                "tuyệt vời, xuất sắc",
                "ngốc, khờ",
                "đường, đường dẫn"
            ],
            "correctAnswer": "đánh giá, nhìn nhận lại"
        },
        ...
    ],
    "fillInTheBlank": [
        {
            "card_id": "6898d683953dce0bc0dc699a",
            "prompt": "Silly",
            "correctAnswer": "ngốc, khờ"
        },
        {
            "card_id": "6899ab5da7f16fb678fdc0d5",
            "prompt": "excellent",
            "correctAnswer": "tuyệt vời, xuất sắc"
        },
        {
            "card_id": "6899ab5da7f16fb678fdc0d7",
            "prompt": "Review",
            "correctAnswer": "đánh giá, nhìn nhận lại"
        }
    ]
}
```



### Submit Card Review 

- Chức năng: Submit card trong một phiên ôn tập (review session) 
- Phương thức: POST
- Endpoint: {{baseurl}}/api/cards/{{cardID}}/review
- Header: Content-type = application/json 
- Body: 
```json
{
	"retrievalLevel": "easy",
	"hintWasShown": false	
}
```
- Authorization: {{authToken}}
- response: 200 

Note: nếu người dùng trả kết quả review là 'easy' và không sử dụng gợi ý, thì frequency sẽ bị giảm đi 1. ở đây là từ 3 (giá trị mặc định) thành 2. 

### Upload 

- Chức năng: Upload ảnh lên dịch vụ cloudinary 
- Phương thức: POST
- Endpoint: {{baseurl}}/api/upload
- Header: Content-type = multipart/form-data 
- Body: 
- Key: Image, type = image 
- Value: Ảnh được upload từ máy

Response: 

```json
{
    "message": "File uploaded successfully",
    "filePath": "https://res.cloudinary.com/dobaislqr/image/upload/v1755498562/media/image-1755498561969.png"
}
```
