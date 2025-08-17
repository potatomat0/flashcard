# Flashcard App API Documentation

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Default Deck Management (Public)](#default-deck-management-public)
5. [Personal Deck Management (Private)](#personal-deck-management-private)
6. [Personal Card Management (Private)](#personal-card-management-private)
7. [Review Sessions](#review-sessions)
8. [File Upload](#file-upload)
9. [Error Handling](#error-handling)
10. [Data Models](#data-models)

---

## Getting Started
...
_(Content is the same)_
...
---

## User Management
All endpoints in this section (except register and login) require authentication.

### Register a New User
**Endpoint:** `POST /api/users/register`
**Description:** Creates a new user account. The username and email must be unique. Upon successful registration, a new empty deck named `"{username}'s first deck"` is automatically created for the user.
**Success Response (201 Created):**
```json
{
    "user": {
        "id": "6896f365d8a0bbd5773a618a",
        "username": "testuser",
        "name": "Test User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTZmMzY1ZDhhMGJiZDU3NzNhNjE4YSIsIm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTc1NTQxNDU5OSwiZXhwIjoxNzU1NTAwOTk5fQ.gVTFGgc6dRtxg1PisWmXQYYZ3HBCXunFaTDyRzfgU8I"
}
```
...
_(Rest of User Management is the same)_
...
---

## Default Deck Management (Public)
These endpoints provide access to universal, pre-loaded decks and do **not** require authentication.

### Get All Default Decks
**Endpoint:** `GET /api/default-decks`
**Description:** Retrieves all available default decks. Supports pagination.
**Query Parameters:**
- `page` (optional): The page number to retrieve. Defaults to `1`.
- `limit` (optional): The number of decks per page. Defaults to `10`.
**Success Response (200 OK):**
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

### Get Single Default Deck
**Endpoint:** `GET /api/default-decks/{deckId}`
**Description:** Retrieves a specific default deck by its ID.
**Success Response (200 OK):**
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

### Get All Cards in Default Deck
**Endpoint:** `GET /api/default-decks/{deckId}/cards`
**Description:** Retrieves all cards belonging to a specific default deck. Supports pagination.
**Query Parameters:**
- `page` (optional): The page number to retrieve. Defaults to `1`.
- `limit` (optional): The number of cards per page. Defaults to `10`.
**Success Response (200 OK):**
```json
{
    "totalPages": 10,
    "currentPage": 1,
    "totalCards": 20,
    "cards": [
        {
            "_id": "68a17f24de06e4650baffbfe",
            "deck_id": "68a17f24de06e4650baffbfa",
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
            "createdAt": "2025-08-17T07:05:08.933Z",
            "updatedAt": "2025-08-17T07:05:08.933Z"
        },
        {
            "_id": "68a17f25de06e4650baffc00",
            "deck_id": "68a17f24de06e4650baffbfa",
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
            "frequency": 5,
            "createdAt": "2025-08-17T07:05:09.006Z",
            "updatedAt": "2025-08-17T07:05:09.006Z"
        }
    ]
}
```

---

## Personal Deck Management (Private)
All endpoints in this section require authentication.

### Create a New Deck
**Endpoint:** `POST /api/decks`
**Description:** Creates a new personal flashcard deck for the logged-in user.
**Request Body:**
```json
{
  "name": "My New Deck",
  "description": "A description for my new deck.",
  "url": "https://example.com/background.jpg"
}
```
**Success Response (201 Created):**
```json
{
    "name": "My New Deck",
    "description": "A description for my new deck.",
    "url": "https://example.com/background.jpg",
    "user_id": "6896f365d8a0bbd5773a618a",
    "size": 0,
    "_id": "68a18165de06e4650baffc2a",
    "createdAt": "2025-08-17T07:15:17.137Z",
    "updatedAt": "2025-08-17T07:15:17.137Z"
}
```
...
_(Rest of Deck Management is the same)_
...
---

## Personal Card Management (Private)
All endpoints in this section require authentication.

### Add Card to Deck
**Endpoint:** `POST /api/decks/{deckId}/cards`
**Description:** Adds one or more new flashcards to a specific personal deck. The request body can be a single card object or an array of card objects.
**Request Body:**
```json
{
  "name": "New Card",
  "definition": "The definition of the new card.",
  "word_type": "noun",
  "url": "/media/image-1678886400000.png",
  "hint": "A hint for the new card.",
  "example": ["An example of how to use the new card.", "Another example."],
  "category": ["new", "card"]
}
```
**Success Response (201 Created):**
```json
{
    "deck_id": "68a18165de06e4650baffc2a",
    "name": "New Card",
    "definition": "The definition of the new card.",
    "word_type": "noun",
    "url": "/media/image-1678886400000.png",
    "hint": "A hint for the new card.",
    "example": [
        "An example of how to use the new card.",
        "Another example."
    ],
    "category": [
        "new",
        "card"
    ],
    "frequency": 3,
    "_id": "68a181b6de06e4650baffc2e",
    "createdAt": "2025-08-17T07:16:38.940Z",
    "updatedAt": "2025-08-17T07:16:38.940Z"
}
```

### Add Default Card to Personal Deck
**Endpoint:** `POST /api/decks/{deckId}/cards/from-default`
**Authentication:** Required
**Description:** Copies one or more cards from a public default deck into one of the user's personal decks. The request body can contain a single `defaultCardId` or an array of `defaultCardIds`.
**Request Body (Single Card):**
```json
{
  "defaultCardId": "68a17f24de06e4650baffbfe"
}
```
**Request Body (Multiple Cards):**
```json
{
  "defaultCardIds": [
    "68a17f24de06e4650baffbfe",
    "68a17f25de06e4650baffc00"
  ]
}
```
**Success Response (201 Created):**
Returns the newly created card object if a single ID was sent, or an array of the newly created card objects if multiple IDs were sent.
```json
// Example response for a single card
{
    "deck_id": "68a18165de06e4650baffc2a",
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
    "_id": "68a1821dde06e4650baffc32",
    "createdAt": "2025-08-17T07:18:21.455Z",
    "updatedAt": "2025-08-17T07:18:21.455Z"
}
```

### Get All Cards in Deck
...
_(Rest of Card Management is the same)_
...
---

...
_(Rest of Review Sessions is the same)_
...
---

## File Upload

### Upload an Image
**Endpoint:** `POST /api/upload`
**Description:** Uploads an image file to the cloud storage (Cloudinary) and returns a secure URL. This endpoint is designed to handle image uploads before they are associated with a specific card. The returned URL can then be used in the `url` field when creating or updating a card.
**Authentication:** This endpoint is currently public and does not require an authentication token.

---

#### **How to Test with Postman:**

1.  **Method:** Set the request method to `POST`.
2.  **URL:** Enter the request URL, e.g., `http://localhost:5000/api/upload` or the production API URL.
3.  **Authorization Tab:**
    -   Set the type to `No Auth`.

4.  **Headers Tab:**
    -   You do **not** need to set the `Content-Type` header manually. Postman will automatically add `Content-Type: multipart/form-data` when you configure the body as described below.

5.  **Body Tab:**
    -   Select the `form-data` radio button.
    -   In the key-value editor section:
        -   In the **KEY** column, enter `image`.
        -   Hover over the `image` key you just typed, and a dropdown will appear on the right. Change the type from `Text` to `File`.
        -   In the **VALUE** column, a **"Select Files"** button will appear. Click it and choose the image file you want to upload from your computer.

    ![Postman Body Configuration](https://i.imgur.com/O9tJ1iH.png)

---

#### **Example `curl` Request:**
```bash
curl -X POST \
  http://localhost:5000/api/upload \
  -F "image=@/path/to/your/image.png"
```

---

#### **Responses:**

**Success Response (200 OK):**
The `filePath` returned is the fully-qualified, secure URL where the image can be accessed on Cloudinary.
```json
{
  "message": "File uploaded successfully",
  "filePath": "https://res.cloudinary.com/your_cloud_name/image/upload/v1678886400/media/image-1678886400000.png"
}
```

**Error Responses:**
-   **400 Bad Request:** If no file is selected (`'Error: No File Selected!'`).
-   **400 Bad Request:** If the selected file is not an image (`'Error: Images Only!'`).
-   **400 Bad Request:** If the file size exceeds the 5MB limit.


---

## Error Handling

### Create Review Session for Personal Deck
**Endpoint:** `POST /api/decks/{deckId}/review-session`
**Authentication:** Required
**Description:** Generates a customized review session for one of the user's personal decks.
...

### Create Review Session for Default Deck
**Endpoint:** `POST /api/default-decks/{deckId}/review-session`
**Authentication:** Not Required
**Description:** Generates a customized review session for a public default deck.
...
_(Rest of Review Sessions is the same)_
...
---

## Data Models
This is the structure of the data as it's stored in the database.

### User Model
...

### Deck Model (Personal)
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (reference to User)",
  "name": "string (required)",
  "description": "string (optional)",
  "url": "string (optional, for background image)",
  "size": "number (default: 0)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Card Model (Personal)
```json
{
  "_id": "ObjectId",
  "deck_id": "ObjectId (reference to Deck)",
  "name": "string (required)",
  "definition": "string (required)",
  "word_type": "string (optional)",
  "url": "string (optional)",
  "hint": "string (optional)",
  "example": "Array<string> (optional)",
  "category": "Array<string> (optional)",
  "frequency": "number (1-5, default: 3)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### DefaultDeck Model (Public)
```json
{
  "_id": "ObjectId",
  "name": "string (required)",
  "description": "string (optional)",
  "url": "string (optional, for background image)",
  "size": "number (default: 0)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### DefaultCard Model (Public)
```json
{
  "_id": "ObjectId",
  "deck_id": "ObjectId (reference to DefaultDeck)",
  "name": "string (required)",
  "definition": "string (required)",
  "word_type": "string (optional)",
  "url": "string (optional)",
  "hint": "string (optional)",
  "example": "Array<string> (optional)",
  "category": "Array<string> (optional)",
  "frequency": "number (1-5, default: 3)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
...
_(Rest of document is the same)_
...