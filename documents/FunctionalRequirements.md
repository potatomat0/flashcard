# Project Blueprint: Flashcard Web Application

## 1. Functional View

This section describes the application's features from a user's perspective.

### 1.1. Core Learning Concept
The application is a tool for studying and memorizing information using flashcards, powered by a Spaced Repetition System (SRS). The system tracks user performance to schedule card reviews at optimal intervals, enhancing long-term memory.

### 1.2. Onboarding & User Accounts
-   **Create Account:** New users can register with a unique username, email, and password.
-   **First Deck:** Upon registration, a new, empty deck named `"{username}'s first deck"` is automatically created for the user, giving them an immediate place to save cards.
-   **Log In/Out:** Registered users can log in to access their content and log out when finished.
-   **Account Management:** Users can update their profile information (name, email) and permanently delete their account, which also removes all their associated decks and cards.

### 1.3. Universal Content: Default Decks
-   **Pre-loaded Content:** The application provides a set of 5 universal, pre-loaded "default decks" available to all users, including guests who are not logged in.
-   **Exploration:** Anyone can browse these decks and their cards.
-   **Review:** Anyone can start a review session on a default deck to try out the learning system.
-   **Saving Cards:** While reviewing a default deck, a logged-in user can choose to save a copy of any card to one of their own personal decks (e.g., to their "first deck").

### 1.4. Personal Content Management (Authenticated Users)
-   **Deck Management:**
    -   **View:** Users see a dashboard of all their personal decks.
    -   **Create:** Users can create new decks, providing a name, an optional description, and an optional background image URL.
    -   **Edit/Delete:** Users can modify the details of their decks or permanently delete them.
-   **Card Management:**
    -   **View:** Within a deck, users can view all of its cards.
    -   **Create:** Users can add new cards to a deck, providing a term (`name`), a `definition`, an optional `word_type`, an optional `hint`, optional `example` sentences, and optional `category` tags.
    -   **Edit/Delete:** Users can edit any field on an existing card or delete cards from a deck.

### 1.5. Learning Session
-   **Configuration:** A user can start a learning session on any deck (personal or default). They can configure which review methods to include (e.g., standard flashcards, multiple-choice).
-   **Execution:** The session presents cards one by one. The user reviews the card and self-assesses their performance.
-   **Completion:** At the end of the session, a summary of the user's performance is displayed.

---

## 2. Technical View

This section describes the technical implementation details of the backend system.

### 2.1. General Architecture
-   **Database:** MongoDB (`flashcardapps` database).
-   **Backend:** A stateless RESTful API built with Express.js.
-   **Data Format:** All data transfer between client and server uses JSON.
-   **Authentication:** Stateless authentication is handled using JSON Web Tokens (JWT).

### 2.2. Data Models & Schema

#### 2.2.1. `users` Collection
-   Stores registered user information.
-   **Fields:** `_id`, `username` (unique), `name`, `email` (unique), `passwordHash`, `createdAt`.

#### 2.2.2. `decks` Collection
-   Stores user-created, personal decks.
-   **Fields:** `_id`, `user_id` (ref: `users`), `name`, `description`, `url` (for background image), `size` (denormalized card count), `createdAt`, `updatedAt`.

#### 2.2.3. `cards` Collection
-   Stores user-created, personal cards.
-   **Fields:** `_id`, `deck_id` (ref: `decks`), `name`, `definition`, `word_type` (String), `hint`, `example` ([String]), `category` ([String]), `frequency` (1-5), `createdAt`, `updatedAt`.

#### 2.2.4. `defaultdecks` Collection
-   Stores the universal, pre-loaded decks. Populated by an administrator.
-   **Fields:** `_id`, `name`, `description`, `url`, `size`, `createdAt`, `updatedAt`.

#### 2.2.5. `defaultcards` Collection
-   Stores the cards for the default decks.
-   **Fields:** `_id`, `deck_id` (ref: `defaultdecks`), `name`, `definition`, `word_type` (String), `hint`, `example` ([String]), `category` ([String]), `frequency` (1-5), `createdAt`, `updatedAt`.

### 2.3. API Functional Requirements

#### 2.3.1. User Management
-   Passwords must be securely hashed using `bcrypt`.
-   The login endpoint returns a JWT for use in subsequent authenticated requests.
-   Upon registration, the system must automatically create a new document in the `decks` collection associated with the new user's ID.

#### 2.3.2. Deck & Card Management
-   All endpoints for personal decks and cards must enforce ownership via JWT, ensuring a user can only access their own content.
-   The `size` attribute of a deck must be automatically updated by the API via `$inc` whenever a card is added to or removed from it.

#### 2.3.3. Default Content Endpoints
-   A separate set of endpoints (e.g., `/api/default-decks`) shall provide **public, unauthenticated** access to the default decks and their cards.
-   These endpoints will query the `defaultdecks` and `defaultcards` collections only.

#### 2.3.4. "Add Card" Logic
-   An authenticated endpoint (`POST /api/decks/:deckId/cards/from-default`) will handle copying a default card to a user's deck.
-   **Body:** `{ "defaultCardId": "..." }`
-   **Logic:**
    1.  Verify the user owns the target `:deckId`.
    2.  Fetch the specified `defaultCardId` from the `defaultcards` collection.
    3.  Create a new document in the `cards` collection, copying the data.
    4.  Increment the `size` of the user's deck.

#### 2.3.5. Review Session Logic
-   The API for starting a review session is stateless.
-   It accepts a deck ID and settings, fetches the relevant cards (from either `cards` or `defaultcards` based on the endpoint), and returns a pre-generated session plan to the client.
-   The API for submitting a review result for a personal card (`POST /api/cards/:cardId/review`) is atomic and updates the card's `frequency` score. This does not apply to default cards.