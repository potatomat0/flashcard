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

-   **Data Fetching:** Use React Query to fetch the list of all user decks from the `GET /api/decks` endpoint. See the "Handling Pagination" section for details on fetching paginated data.
-   **UI:**
    -   Display the decks in a grid or list format. Each deck item should show its name, description, and size.
    -   Clicking a deck should navigate the user to `/decks/:deckId`.
    -   Include a "Create New Deck" button that opens a modal or navigates to a new page with a creation form.
    -   Display pagination controls (e.g., "First", "Previous", "Next", "Last" buttons) to allow the user to navigate through their decks.
-   **Mutations:**
    -   After creating a new deck, React Query should automatically refetch the deck list to display the new addition.
    -   Each deck item should have "Edit" and "Delete" buttons. Deleting a deck should trigger a confirmation modal before calling the API. On success, the deck list should be refetched.

### 3.3. Deck View (`/decks/:deckId`)

-   **Data Fetching:** Fetch details for the specific deck and a list of all cards within it from `GET /api/decks/:deckId/cards`. See the "Handling Pagination" section for details on fetching paginated data.
-   **UI:**
    -   Display deck information at the top.
    -   Display cards in a table or list.
    -   Display pagination controls to navigate through the cards in the deck.
    -   Include a "Start Review Session" button.
    -   Include an "Add Card" button that opens a creation modal.
-   **Mutations:** Handle card creation, updates, and deletions, ensuring the card list is refetched via React Query upon success.

### 3.4. Updating a Card's Image

Updating a card's image is a two-step process that requires two separate API calls. This ensures that a file is successfully uploaded and has a valid URL before the card record is updated in the database.

**Step 1: Upload the New Image**

-   **Trigger:** The user clicks an "Edit Image" button on a card and selects a new image file from their device.
-   **Action:** The frontend immediately sends the selected file to the image upload endpoint.
-   **API Request:**
    -   **Method:** `POST`
    -   **Endpoint:** `/api/upload`
    -   **Body:** The request body must be `multipart/form-data`, with the image file attached to the `image` key.
-   **Response Handling:**
    -   The frontend should display a loading indicator while the upload is in progress.
    -   Upon a successful response, the frontend must capture the `filePath` (which is the new, permanent URL of the image) from the JSON response.

**Step 2: Update the Card with the New URL**

-   **Trigger:** This step is triggered automatically upon the successful completion of Step 1.
-   **Action:** The frontend takes the `filePath` URL received from the upload endpoint and uses it to update the card.
-   **API Request:**
    -   **Method:** `PATCH`
    -   **Endpoint:** `/api/cards/{cardId}` (where `{cardId}` is the ID of the card being edited).
    -   **Body:** The request body is a JSON object containing only the fields to be updated. In this case, it's the `url`.
      ```json
      {
        "url": "https://res.cloudinary.com/your_cloud_name/image/upload/v16.../new_image.png"
      }
      ```
-   **Response Handling:**
    -   Upon a successful `PATCH` request, the frontend should show a success message.
    -   Using a library like React Query, the frontend should then automatically refetch the card list for the deck to ensure the UI displays the newly updated image.

This sequence ensures a robust update process and prevents broken image links in the database.

### 3.5. The Review Session (`/review/:deckId`)

This is the most complex piece of frontend logic.

### 3.5. Handling Pagination

The API provides paginated data for endpoints like `GET /api/decks` and `GET /api/decks/:deckId/cards`. The frontend is responsible for managing the user's current page and rendering the navigation controls.

#### **API Response Structure**

A paginated API response will look like this:

```json
{
  "totalPages": 10,
  "currentPage": 2,
  "totalDecks": 98,
  "decks": [
    { "...deck data..." }
  ]
}
```

-   `totalPages`: The total number of pages available.
-   `currentPage`: The page of data currently being displayed.
-   `totalDecks` / `totalCards`: The total number of items.
-   `decks` / `cards`: The array of items for the current page.

#### **Frontend Logic**

The frontend must maintain the current page number in its state. When the user clicks a navigation button, the frontend updates this state and makes a new API call with the desired page number.

**Example Implementation (React with Hooks)**

This example shows a simplified component for displaying a paginated list of decks.

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Your configured Axios instance

const PaginatedDecks = () => {
  // State to hold the API response data
  const [data, setData] = useState({ totalPages: 0, currentPage: 0, decks: [] });
  // State to manage the current page the user wants to see
  const [page, setPage] = useState(1);
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook to fetch data whenever the 'page' state changes
  useEffect(() => {
    const fetchDecks = async () => {
      setLoading(true);
      try {
        // Make the API call with the current page number
        const response = await axios.get(`/api/decks?page=${page}&limit=10`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch decks.');
        setData({ totalPages: 0, currentPage: 0, decks: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, [page]); // This effect re-runs whenever 'page' is updated

  // --- Navigation Handlers ---

  const handleFirstPage = () => {
    setPage(1);
  };

  const handlePreviousPage = () => {
    // Decrement page number, but not below 1
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    // Increment page number, but not beyond the total number of pages
    setPage((prevPage) => Math.min(prevPage + 1, data.totalPages));
  };

  const handleLastPage = () => {
    setPage(data.totalPages);
  };

  // --- Render Logic ---

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>My Decks</h1>
      <ul>
        {data.decks.map(deck => (
          <li key={deck._id}>{deck.name}</li>
        ))}
      </ul>

      {/* Pagination Controls */}
      <div>
        <button onClick={handleFirstPage} disabled={data.currentPage === 1}>
          First
        </button>
        <button onClick={handlePreviousPage} disabled={data.currentPage === 1}>
          Previous
        </button>
        <span>
          Page {data.currentPage} of {data.totalPages}
        </span>
        <button onClick={handleNextPage} disabled={data.currentPage === data.totalPages}>
          Next
        </button>
        <button onClick={handleLastPage} disabled={data.currentPage === data.totalPages}>
          Last
        </button>
      </div>
    </div>
  );
};

export default PaginatedDecks;
```

This same logic can be applied to any component that needs to display paginated data, such as the list of cards within a deck. Using a library like React Query can further simplify the data fetching, loading, and error handling logic.

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
