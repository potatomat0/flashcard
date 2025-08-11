# Frontend Application Requirements

This document outlines the core requirements, architecture, and logic for building the frontend of the Flashcard Web Application. It is designed to work with the existing stateless RESTful API.

## 1. Core Technologies & Libraries

For a robust and maintainable application, the following stack is recommended:

-   **Framework:** [React.js](https://reactjs.org/) (or a comparable framework like Vue/Svelte).
-   **Routing:** [React Router](https://reactrouter.com/) for managing navigation and protected routes.
-   **State Management:**
    -   **Server State/Caching:** [React Query](https://tanstack.com/query/latest) or SWR. This is **critical** for fetching, caching, and updating data from the API, and will simplify logic for loading states, errors, and refetching after mutations.
    -   **Global Client State:** Zustand or React Context API for managing global state like the user's authentication status and JWT.
-   **API Client:** [Axios](https://axios-http.com/) for making HTTP requests. Its ability to create instances and interceptors is invaluable for handling authentication.
-   **Styling:** A component library like [Material-UI](https://mui.com/) or a utility-first CSS framework like [Tailwind CSS](https://tailwindcss.com/) to ensure a polished and consistent UI.

## 2. High-Level Architecture

### 2.1. Authentication Flow

The frontend is entirely responsible for managing the user's session.

1.  **Login:** On successful login, the API returns a JWT. The frontend must store this token securely in `localStorage`.
2.  **Authenticated Requests:** An Axios instance must be configured to automatically attach the `Authorization: Bearer <token>` header to every outgoing request that requires authentication.
3.  **Handling 401 Unauthorized:** The Axios instance must have a **response interceptor**. If the API returns a `401` status code, it means the token is expired or invalid. The interceptor must:
    -   Clear the JWT from `localStorage`.
    -   Clear the user's authentication state.
    -   Redirect the user to the `/login` page.
4.  **Logout:** A "logout" action will simply clear the token from `localStorage` and the global state, then redirect to the login page.

### 2.2. Routing

-   **Public Routes:** `/login`, `/register`.
-   **Protected Routes:** `/dashboard`, `/decks/:deckId`, `/review/:deckId`, `/profile`. These routes must be wrapped in a component that checks for a valid authentication token. If no token exists, the user should be immediately redirected to `/login`.

## 3. Feature Breakdown & Frontend Logic

### 3.1. User Onboarding (Login/Register Pages)

-   **Forms:** Each page will contain a form with inputs for credentials.
-   **Client-Side Validation:** Implement real-time validation before submitting the form (e.g., "Email is not valid," "Passwords do not match," "Password must be at least 8 characters").
-   **State:** Manage loading and error states. The "Submit" button should be disabled while the API request is in flight. Display any error messages returned from the server.

### 3.2. Dashboard (`/dashboard`)

-   **Data Fetching:** Use React Query to fetch the list of all user decks from the `GET /api/decks` endpoint.
-   **UI:**
    -   Display the decks in a grid or list format. Each deck item should show its name, description, and size.
    -   Clicking a deck should navigate the user to `/decks/:deckId`.
    -   Include a "Create New Deck" button that opens a modal or navigates to a new page with a creation form.
-   **Mutations:**
    -   After creating a new deck, React Query should automatically refetch the deck list to display the new addition.
    -   Each deck item should have "Edit" and "Delete" buttons. Deleting a deck should trigger a confirmation modal before calling the API. On success, the deck list should be refetched.

### 3.3. Deck View (`/decks/:deckId`)

-   **Data Fetching:** Fetch details for the specific deck and a list of all cards within it from `GET /api/decks/:deckId/cards`.
-   **UI:**
    -   Display deck information at the top.
    -   Display cards in a table or list.
    -   Include a "Start Review Session" button.
    -   Include an "Add Card" button that opens a creation modal.
-   **Mutations:** Handle card creation, updates, and deletions, ensuring the card list is refetched via React Query upon success.

### 3.4. The Review Session (`/review/:deckId`)

This is the most complex piece of frontend logic.

#### **State Management**

A parent component (e.g., `ReviewSessionPage`) will be responsible for managing the state of the entire session:

-   `sessionData`: The complete response object from `POST /api/decks/:deckId/review-session`.
-   `reviewQueue`: A flattened and ordered array of all review items (flashcards, MCQs, etc.).
-   `currentIndex`: A number tracking the user's position in the `reviewQueue`.
-   `results`: An array to store the user's performance on each card (e.g., `{ card_id, result: 'correct' }`).

#### **Session Flow Logic**

1.  **Setup:** Before the session starts, the UI should allow the user to configure the review methods and sizes (e.g., input fields for flashcard, MCQ counts). Clicking "Start" sends the request to the backend.
2.  **Initialization:** On receiving the `sessionData` from the API, the frontend will:
    -   Flatten the data into the `reviewQueue`. For example: `[{ type: 'flashcard', data: {...} }, { type: 'mcq', data: {...} }]`.
    -   Set `currentIndex` to `0`.
3.  **Rendering:** The component will render the item at `reviewQueue[currentIndex]`. It will use conditional rendering based on the item's `type`:
    -   If `type` is `flashcard`, render a `<FlashcardPlayer />` component.
    -   If `type` is `mcq`, render an `<MCQPlayer />` component.
    -   If `type` is `fillInTheBlank`, render a `<FillInTheBlankPlayer />` component.
4.  **Submission & Progression:**
    -   Each player component (`FlashcardPlayer`, etc.) handles its own UI interaction.
    -   When the user answers, the player component determines the outcome (e.g., 'easy', 'hard').
    -   It then calls a submission function passed down from the parent page. This function will:
        a.  Make the API call to `POST /api/cards/{cardId}/review` with the translated result.
        b.  Store the result locally in the `results` array.
        c.  Increment the `currentIndex`. This will cause React to re-render and show the next item in the queue.
5.  **Completion:** When `currentIndex` equals the length of the `reviewQueue`, the session is over. The UI should navigate to a summary screen displaying the data from the `results` array.

#### **Translating Results for the API**

The frontend must translate the objective outcome of a review into the format the `submitCardReview` endpoint expects.

-   **Flashcard:** The user directly provides `easy`, `medium`, or `hard`. This is a direct mapping.
-   **MCQ / Fill-in-the-Blank:**
    -   If the user's answer is **correct**, the frontend sends `{ retrievalLevel: 'easy', hintWasShown: false }`.
    -   If the user's answer is **incorrect**, the frontend sends `{ retrievalLevel: 'hard', hintWasShown: false }`.

## 4. Cross-Cutting Concerns

-   **Loading States:** Every view that fetches data must have a clear loading state (e.g., a skeleton screen or a spinner) to prevent layout shifts and inform the user.
-   **Error Handling:** API errors should be gracefully handled and displayed to the user via toast notifications or inline messages.
-   **Responsive Design:** The application must be fully responsive and usable on both desktop and mobile devices.
