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

## Deck Management

### Create a New Deck
```bash
# Replace <your_jwt_token> with the actual token from the login response
curl -X POST http://localhost:5001/api/decks \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d 
{
  "name": "My First Deck",
  "description": "A deck for learning cURL commands"
}
```

### Get All Decks
```bash
# Replace <your_jwt_token> with the actual token from the login response
curl -X GET http://localhost:5001/api/decks \
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

## Card Management

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
  "hint": "It is used to test APIs."
}
```

### Get All Cards in Deck
```bash
# Replace <your_jwt_token> and <deckId> with actual values
curl -X GET http://localhost:5001/api/decks/<deckId>/cards \
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
```

---

## Review Sessions

### Create Review Session
```bash
# Replace <your_jwt_token> and <deckId> with actual values
curl -X POST http://localhost:5001/api/decks/<deckId>/review-session \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d 
{
  "reviewSize": 10
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
