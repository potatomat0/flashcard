
# Flashcard App API Documentation

## Introduction for Beginners
Welcome to the Flashcard App API! An API (Application Programming Interface) is a set of rules that allows different software applications to talk to each other. This API is the "backend" of our flashcard app. It handles all the data and logic, like storing users, decks, and cards in a database. A "frontend" (like a website or mobile app) will use this API to get and show information to the user.

### Key Concepts
- **HTTP Methods:** You'll see methods like `POST`, `GET`, `PATCH`, and `DELETE`. These are standard verbs for web requests.
    - `GET`: Retrieve data (e.g., get a list of decks).
    - `POST`: Create new data (e.g., create a new user or a new card).
    - `PATCH`: Update existing data (e.g., change a deck's name).
    - `DELETE`: Remove data (e.g., delete a card).
- **JSON (JavaScript Object Notation):** A lightweight format for sending data. It's easy for both humans and machines to read. All data sent to and from this API will be in JSON format.
- **RESTful API:** This API follows REST principles, which is an architectural style for designing networked applications. It means we use standard HTTP methods and a clear, hierarchical URL structure (like `/decks/{deckId}/cards`) to represent and interact with our data.
- **cURL:** The examples use a command-line tool called `cURL`. It's used to make HTTP requests and is a great way to test an API without needing a full frontend application.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Deck Management](#deck-management)
5. [Card Management](#card-management)
6. [Review Sessions](#review-sessions)
7. [Error Handling](#error-handling)
8. [Data Models](#data-models)

## Getting Started

### Base URL
All API endpoints start with this URL.
```
http://localhost:5001/api
```

### Content Type
When you send data to the API (with `POST` or `PATCH`), you must tell the server you're sending JSON. You do this by setting a "header".
```
Content-Type: application/json
```

### Authentication
For most actions, the API needs to know who you are. After you log in, you get a special, temporary password called a **JWT (JSON Web Token)**. You must include this token in the `Authorization` header for all protected requests. The `Bearer` part just indicates the type of token.
```
Authorization: Bearer <your_jwt_token>
```

---

## User Management
All endpoints in this section (except register and login) require authentication.

### Register a New User

**Endpoint:** `POST /api/users/register`

**Description:** Creates a new user account. The username and email must be unique.

**Request Body:**
```json
{
  "username": "john_doe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login User

**Endpoint:** `POST /api/users/login`

**Description:** Authenticates a user with their email and password. If successful, it returns a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Update User Profile

**Endpoint:** `PATCH /api/users/profile`

**Authentication:** Required

**Description:** Updates the name and/or email for the currently logged-in user.

**Request Body:**
```json
{
  "name": "Johnathan Doe",
  "email": "john.doe@new-email.com"
}
```

**Success Response (200 OK):**
```json
{
    "_id": "64a859c2f1b4c3d2e1f2a3b4",
    "username": "john_doe",
    "name": "Johnathan Doe",
    "email": "john.doe@new-email.com"
}
```

### Delete User Account

**Endpoint:** `DELETE /api/users/profile`

**Authentication:** Required

**Description:** Permanently deletes the logged-in user's account and all of their associated decks and cards. This action is irreversible.

**Success Response (200 OK):**
```json
{
  "message": "User account and all associated data deleted successfully."
}
```

---

## Deck Management
All endpoints in this section require authentication.

### Create a New Deck

**Endpoint:** `POST /api/decks`

**Description:** Creates a new flashcard deck for the currently logged-in user.

### Get All Decks

**Endpoint:** `GET /api/decks`

**Description:** Retrieves all decks belonging to the authenticated user.

### Get Single Deck

**Endpoint:** `GET /api/decks/{deckId}`

**Description:** Retrieves a specific deck by its ID. The `{deckId}` in the URL must be replaced with an actual deck ID.

### Update a Deck

**Endpoint:** `PATCH /api/decks/{deckId}`

**Description:** Updates a deck's name and/or description. `PATCH` is used for partial updates.

### Delete a Deck

**Endpoint:** `DELETE /api/decks/{deckId}`

**Description:** Permanently deletes a deck and all of its cards. This action is irreversible.

---

## Card Management
All endpoints in this section require authentication.

### Add Card to Deck

**Endpoint:** `POST /api/decks/{deckId}/cards`

**Description:** Adds a new flashcard to a specific deck.

### Get All Cards in Deck

**Endpoint:** `GET /api/decks/{deckId}/cards`

**Description:** Retrieves all cards belonging to a specific deck.

### Update a Card

**Endpoint:** `PATCH /api/cards/{cardId}`

**Description:** Updates any field of an existing card.

### Delete a Card

**Endpoint:** `DELETE /api/cards/{cardId}`

**Description:** Permanently deletes a single card from its deck.

---

## Review Sessions

### Create Review Session

**Endpoint:** `POST /api/decks/{deckId}/review-session`

**Description:** Generates a customized review session with one or more review methods. The server selects a pool of cards using a weighted random algorithm and then assigns them to the requested methods.

**Default Behavior:** If the request body is empty (`{}`), the endpoint will automatically create a `flashcard` review session. The session size will be 10, or the total number of cards in the deck if it is less than 10.

**Request Body:**
Provide a JSON object where keys are the desired review methods (`flashcard`, `mcq`, `fillInTheBlank`) and values are the number of cards for each.

*Example: Request 10 flashcards and 5 multiple-choice questions.*
```json
{
  "flashcard": 10,
  "mcq": 5
}
```

**Success Response (200 OK):**
The server returns an object with keys for each requested method. Each key holds an array of the generated review items.

*Example Response:*
```json
{
  "flashcard": [
    {
      "_id": "64a859c2f1b4c3d2e1f2a3b4",
      "deck_id": "...",
      "name": "Hola",
      "definition": "Hello",
      "frequency": 3,
      "...": "..."
    }
  ],
  "mcq": [
    {
      "card_id": "64a859c2f1b4c3d2e1f2a3b5",
      "prompt": "Adiós",
      "options": ["Goodbye", "Hello", "Thank you", "Sorry"],
      "correctAnswer": "Goodbye"
    }
  ]
}
```

### Submit Card Review Result

**Endpoint:** `POST /api/cards/{cardId}/review`

**Description:** Submits your performance on a single card review. This updates the card's `frequency` score, which powers the spaced repetition system.

**Request Body:**
```json
{
  "retrievalLevel": "easy",
  "hintWasShown": false
}
```

---

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request.
- `2xx` (e.g., `200 OK`, `201 Created`): Success!
- `4xx` (e.g., `400 Bad Request`, `401 Unauthorized`, `404 Not Found`): Client Error. You did something wrong (e.g., sent bad data, weren't logged in).
- `5xx` (e.g., `500 Internal Server Error`): Server Error. Something went wrong on our end.

---

## Data Models
This is the structure of the data as it's stored in the database.

### User Model
```json
{
  "_id": "ObjectId",
  "username": "string (unique, required)",
  "name": "string (required)",
  "email": "string (unique, required)",
  "passwordHash": "string (required, hashed)",
  "emailConfirmed": "boolean (default: false)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Deck Model
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (reference to User)",
  "name": "string (required)",
  "description": "string (optional)",
  "size": "number (default: 0)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Card Model
```json
{
  "_id": "ObjectId",
  "deck_id": "ObjectId (reference to Deck)",
  "name": "string (required)",
  "definition": "string (required)",
  "hint": "string (optional)",
  "category": "Array<string> (optional)",
  "frequency": "number (1-5, default: 3)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
---

## Notes for Frontend Development

1. **Token Management**: Store the JWT token securely. A frontend application should send it with every authenticated request. If the API returns a `401 Unauthorized` error, it means the token is missing, invalid, or expired, and the user should be prompted to log in again.
2. **Deck Size Updates**: The `size` field in decks is automatically handled by the API. The frontend doesn't need to calculate this.
3. **Spaced Repetition**: The core learning feature relies on the frontend accurately reporting the `retrievalLevel` and `hintWasShown` for each card reviewed.
4. **Client-Side Validation**: While the API validates all incoming data, adding validation to the frontend (e.g., checking for a valid email format before sending) creates a much better user experience.
