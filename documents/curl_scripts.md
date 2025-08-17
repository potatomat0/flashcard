# cURL Scripts for Flashcard App API

This document provides `cURL` command examples for testing the Flashcard App API.

**Base URL:** `http://localhost:5001/api`

---

## User Management

### Register a New User
```bash
curl -X POST http://localhost:5001/api/users/register \
-H "Content-Type: application/json" \
-d 
{
  "username": "john_doe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login User
```bash
curl -X POST http://localhost:5001/api/users/login \
-H "Content-Type: application/json" \
-d 
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Update User Profile
```bash
# Replace <your_jwt_token> with the actual token from the login response
curl -X PATCH http://localhost:5001/api/users/profile \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d 
{
  "name": "Johnathan Doe",
  "email": "john.doe@new-email.com"
}
```

### Delete User Account
```bash
# Replace <your_jwt_token> with the actual token from the login response
curl -X DELETE http://localhost:5001/api/users/profile \
-H "Authorization: Bearer <your_jwt_token>"
```

---

## Default Deck Management (Public)

### Get All Default Decks (Paginated)
```bash
# No authentication required
curl -X GET "http://localhost:5001/api/default-decks?page=1&limit=5"
```

### Get Single Default Deck
```bash
# No authentication required, replace <deckId> with an actual ID
curl -X GET http://localhost:5001/api/default-decks/<deckId>
```

### Get Cards in Default Deck (Paginated)
```bash
# No authentication required, replace <deckId> with an actual ID
curl -X GET "http://localhost:5001/api/default-decks/<deckId>/cards?page=1&limit=10"
```

---

## Personal Deck Management

### Create a New Deck
```bash
# Replace <your_jwt_token>
curl -X POST http://localhost:5001/api/decks \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d 
{
  "name": "My First Deck",
  "description": "A deck for learning cURL commands",
  "url": "https://example.com/image.jpg"
}
```

### Get All Decks
```bash
# Replace <your_jwt_token> with the actual token from the login response
curl -X GET http://localhost:5001/api/decks \
-H "Authorization: Bearer <your_jwt_token>"
```

### Get All Decks (Paginated)
```bash
# Replace <your_jwt_token> with the actual token from the login response
# Gets page 2 with 5 decks per page
curl -X GET "http://localhost:5001/api/decks?page=2&limit=5" 
-H "Authorization: Bearer <your_jwt_token>"
```

### Get Single Deck
```bash
# Replace <your_jwt_token> and <deckId> with actual values
curl -X GET http://localhost:5001/api/decks/<deckId> \
-H "Authorization: Bearer <your_jwt_token>"
```

### Update a Deck
```bash
# Replace <your_jwt_token> and <deckId> with actual values
curl -X PATCH http://localhost:5001/api/decks/<deckId> \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d 
{
  "name": "My Updated Deck Name"
}
```

### Delete a Deck
```bash
# Replace <your_jwt_token> and <deckId> with actual values
curl -X DELETE http://localhost:5001/api/decks/<deckId> \
-H "Authorization: Bearer <your_jwt_token>"
```

---

## Personal Card Management

### Add Card to Deck
```bash
# Replace <your_jwt_token> and <deckId> with actual values
curl -X POST http://localhost:5001/api/decks/<deckId>/cards \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d 
{
  "name": "cURL",
  "definition": "A command-line tool for transferring data with URL syntax.",
  "url": "/media/image-1678886400000.png",
  "hint": "It is used to test APIs.",
  "example": ["curl -X GET https://api.example.com/users"]
}
```

### Add Default Card to Personal Deck
```bash
# Replace <your_jwt_token>, <deckId>, and <defaultCardId>
curl -X POST http://localhost:5001/api/decks/<deckId>/cards/from-default \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d 
{
  "defaultCardId": "<defaultCardId>"
}
```

### Get All Cards in Deck
```bash
# Replace <your_jwt_token> and <deckId> with actual values
curl -X GET http://localhost:5001/api/decks/<deckId>/cards \
-H "Authorization: Bearer <your_jwt_token>"
```

### Get All Cards in Deck (Paginated)
```bash
# Replace <your_jwt_token> and <deckId> with actual values
# Gets page 1 with 10 cards per page
curl -X GET "http://localhost:5001/api/decks/<deckId>/cards?page=1&limit=10" \
-H "Authorization: Bearer <your_jwt_token>"
```

### Update a Card
```bash
# Replace <your_jwt_token> and <cardId> with actual values
curl -X PATCH http://localhost:5001/api/cards/<cardId> \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d 
{
  "name": "cURL (Updated)",
  "definition": "A powerful command-line tool for making HTTP requests."
}
```

### Delete a Card
```bash
# Replace <your_jwt_token> and <cardId> with actual values
curl -X DELETE http://localhost:5001/api/cards/<cardId> \
-H "Authorization: Bearer <your_jwt_token>"

### Create Review Session for Personal Deck
```bash
# Replace <your_jwt_token> and <deckId>
curl -X POST http://localhost:5001/api/decks/<deckId>/review-session \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d 
{
  "flashcard": 10
}
```

### Create Review Session for Default Deck
```bash
# No authentication required, replace <deckId>
curl -X POST http://localhost:5001/api/default-decks/<deckId>/review-session \
-H "Content-Type: application/json" \
-d 
{
  "flashcard": 10
}
```

### Submit Card Review Result
```bash
# Replace <your_jwt_token> and <cardId> with actual values
curl -X POST http://localhost:5001/api/cards/<cardId>/review \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d 
{
  "retrievalLevel": "easy",
  "hintWasShown": false
}
```