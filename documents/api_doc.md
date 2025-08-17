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

### Get Single Default Deck
**Endpoint:** `GET /api/default-decks/{deckId}`
**Description:** Retrieves a specific default deck by its ID.

### Get All Cards in Default Deck
**Endpoint:** `GET /api/default-decks/{deckId}/cards`
**Description:** Retrieves all cards belonging to a specific default deck. Supports pagination.
**Query Parameters:**
- `page` (optional): The page number to retrieve. Defaults to `1`.
- `limit` (optional): The number of cards per page. Defaults to `10`.

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

### Add Default Card to Personal Deck
**Endpoint:** `POST /api/decks/{deckId}/cards/from-default`
**Authentication:** Required
**Description:** Copies a card from a public default deck into one of the user's personal decks.
**Request Body:**
```json
{
  "defaultCardId": "64a859c2f1b4c3d2e1f2a3b5"
}
```
**Success Response (201 Created):** Returns the newly created card object in the user's deck.

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
**Description:** Uploads an image file. This endpoint accepts `multipart/form-data` requests.
**Request Body:**
- Key: `image`
- Value: The image file to upload.
**Success Response (200 OK):**
```json
{
  "message": "File uploaded successfully",
  "filePath": "/media/image-1678886400000.png"
}
```

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