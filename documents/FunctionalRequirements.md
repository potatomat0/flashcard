
# Project Blueprint: Flashcard Web Application
1. Introduction
This document outlines the design and technical specifications for a simple but efficient and polished flashcard web application. The primary goal is to provide language learners with an effective tool for studying and memorizing vocabulary and concepts through spaced repetition.
The application is built on a modern JavaScript stack:
Database: MongoDB, hosted on MongoDB Atlas (Free Tier).
Backend/API: A stateless RESTful API built with Express.js.
Frontend: A dynamic single-page application built with React.js.
The core architectural principle is a stateless API, which ensures efficiency, scalability, and optimal use of the limited free-tier database resources by offloading session management to the client-side application.
2. Core Concepts and Usage
This section describes the application's functionality from a user's perspective.
2.1. Onboarding
Create Account: New users can register with a unique username, a valid email, and a password.
Log In: Registered users can log in to access their personal decks and cards. user can also log out, update their account, or even delete their account.
2.2. Content Management (Authenticated User)
Deck Management:
View Decks: Upon logging in, the user sees a dashboard of all their created decks.
Create Deck: Users can create a new deck by providing a unique name and an optional description.
Edit/Delete Deck: Users can rename, change the description of, or permanently delete any of their decks. Deleting a deck also deletes all cards within it.
Card Management:
View Cards: Upon selecting a deck, the user can view all the cards it contains.
Create Cards: Users can add new cards to a deck, providing a name (the word/term), a definition, an optional hint, and optional categories.
Edit/Delete Cards: Users can edit any field on an existing card or delete one or more cards from a deck.
2.3. Learning Session
This is the core learning loop of the application.
Configuration: The user selects a deck and chooses to start a learning session. They can configure which review methods to include and how many cards to review for each.
Deck Review (standard flashcards)
Multiple-Choice Questions (MCQ)
Fill-in-the-Blank
Execution: The session begins, presenting the selected review methods in sequence.
Deck Review: A card's name is shown. The user can optionally reveal a hint. They must self-assess their recall ability by choosing Easy, Medium, or Hard. The card's definition is then revealed before moving to the next card.
MCQ: A card's name is shown along with several definition options (one correct, others from random cards in the same deck). The user selects an answer out of the given 4.
Fill-in-the-Blank: The user is shown either a name or a definition and must type the corresponding counterpart.
note: only flashcard/deck review has 3 options (E/M/H), the other 2 only have (E/H) which correspond to correct or wrong.
Completion: The session ends when all configured cards have been reviewed or if the user quits early. A report is displayed summarizing the performance for each method (e.g., E/M/H counts for Deck Review, right/wrong counts for MCQ).
3. Technical Functional Requirements
3.1. General
The system shall use a MongoDB database named "flashcardapps".
The backend shall be an Express.js application exposing RESTful API endpoints.
All data transfer between the client and server will use JSON.
3.2. User Management
The system shall provide an endpoint to register a new user. Usernames and emails must be unique across the system.
Passwords must be securely hashed using bcrypt before being stored in the database. Plain-text passwords must never be stored.
The system shall provide an endpoint for user authentication which, on success, returns a JSON Web Token (JWT) for use in subsequent authenticated requests.
3.3. Deck & Card Management
API endpoints must enforce ownership. A user can only view, create, edit, or delete their own decks and cards.
The size attribute of a deck (denormalized card count) must be automatically updated by the API whenever a card is added to or removed from that deck.
Deck names must be unique per user.
3.4. Review Session
The API for starting a review session must be stateless.
It will accept a deckId and settings (e.g., { review: 10, mcq: 5 }).
It will fetch all cards for the deck, perform weighted randomization based on card frequency, and return a complete, pre-generated session plan (a list of cards/questions) to the client. The server will not store this session plan.
The API for submitting a review result for a single card must be atomic.
It will accept a cardId and the user's result (e.g., { retrievalLevel: 'hard', hintWasShown: true }).
It will apply the internal adjustLvl logic to update the card's persistent frequency score in the database.
retrievalLevel and hintWasShown are transient parameters and will not be stored in the database.
4. Data Glossary and Database Schema
The database flashcard-app will contain the following collections:
4.1. users Collection
Stores information for each registered user.
Field Name	Data Type	Constraints / Description
_id	ObjectId	Primary Key, auto-generated.
username	String	Required, Unique. Used for login.
name	String	Required. Display name for the UI.
email	String	Required, Unique. Used for account management.
passwordHash	String	Required. Bcrypt-hashed user password.
emailConfirmed	Boolean	Default: false. For future email verification feature.
createdAt	Date	Auto-generated timestamp of user creation.
4.2. decks Collection
Stores user-created decks, which are containers for cards.
Field Name	Data Type	Constraints / Description
_id	ObjectId	Primary Key, auto-generated.
user_id	ObjectId	Required, Indexed. Foreign Key referencing users._id.
name	String	Required. The name of the deck.
description	String	Optional description of the deck's content.
url	String	Optional URL for a background image.
size	Number	Default: 0. Denormalized count of cards in the deck.
createdAt	Date	Auto-generated timestamp.
updatedAt	Date	Auto-generated timestamp, updated on modification.
4.3. cards Collection
Stores the individual flashcards.
Field Name	Data Type	Constraints / Description
_id	ObjectId	Primary Key, auto-generated.
deck_id	ObjectId	Required, Indexed. Foreign Key referencing decks._id.
name	String	Required. The "front" of the card (the term).
definition	String	Required. The "back" of the card (the meaning).
hint	String	Optional hint to help the user recall the definition.
example	[String]	Optional array of example sentences or uses.
category	[String]	An array of strings for user-defined tags.
frequency	Number	Required. Min: 1, Max: 5, Default: 3. Spaced repetition score.
createdAt	Date	Auto-generated timestamp.
updatedAt	Date	Auto-generated timestamp, updated on modification.
5. Key Internal Logic
This section describes critical business logic that powers the application's features.
5.1. adjustLvl (Card Frequency Update Logic)
This logic is executed by the POST /api/cards/:cardId/submit-result endpoint. It takes the card's current frequency, the user's retrieval level (E/M/H), and whether the hint was shown to calculate the new frequency.
When Hint is SHOWN:
If user clicks Easy (E): Frequency is not adjusted.
If user clicks Medium (M): Frequency increases by 1.
If user clicks Hard (H): Frequency increases by 2.
When Hint is NOT SHOWN:
If user clicks Easy (E): Frequency decreases by 1.
If user clicks Medium (M): Frequency is not adjusted.
If user clicks Hard (H): Frequency increases by 1.
Boundary Rules:
The frequency score cannot be lowered below 1.
The frequency score cannot be increased above 5.
5.2. Review Session Generation Logic
This logic is executed by the POST /api/decks/:deckId/review-session endpoint.
Input: A JSON object with review methods and their desired sizes (e.g., { "deckReview": 15, "mcq": 10 }).
Fetch: Retrieve all cards belonging to the specified deck_id from the database.
Weighted Selection: For each requested review method, create a temporary "pool" of all cards. The frequency of each card determines its weight (a card with frequency: 5 is more likely to be picked than one with frequency: 1). Randomly select cards from this pool until the desired review size is met.
Edge Case: If the requested reviewSize is greater than or equal to the total number of cards in the deck, the logic will first include one of every card (shuffled), and then perform weighted randomization for the remaining reviewSize - deck.size slots.
Edge case 2: if the deck.size of MCQ is smaller than (0 or 1), user is not allowed to choose this method. if the deck size is 2-3, then each question in the MCQ only has 1 correct answer and 1 or 2 distractor. 
Output: Return a single JSON object containing arrays of card data for each review method (e.g., { "deckReview": [...cards], "mcq": [...questions] }). For MCQs, this includes generating and attaching the incorrect answer options.
