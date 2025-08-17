# React Native Application Requirements

This document outlines the core requirements, architecture, and logic for building the mobile frontend for the Flashcard Application using React Native. It is designed to consume the existing stateless RESTful API.

## 1. Core Technologies & Libraries

-   **Framework:** [React Native](https://reactnative.dev/)
-   **Navigation:** [React Navigation](https://reactnavigation.org/) for creating a native stack-based navigation experience.
-   **Secure Storage:** [React Native Keychain](https://github.com/oblador/react-native-keychain) for securely storing the user's JWT on the device's keychain (iOS) or Keystore (Android). **This is a critical security measure and is superior to using `AsyncStorage` for sensitive data.**
-   **State Management:**
    -   **Server State/Caching:** [React Query](https://tanstack.com/query/latest) (or SWR) is highly recommended for managing API data, caching, and mutations. It significantly simplifies handling loading/error states.
    -   **Global Client State:** Zustand or React Context API for managing non-server state like authentication status.
-   **API Client:** [Axios](https://axios-http.com/) for its robust feature set, including creating pre-configured instances and interceptors.
-   **UI Library:** [React Native Paper](https://reactnativepaper.com/) (Material Design) or [UI Kitten](https://akveo.github.io/react-native-ui-kitten/) to provide a high-quality, consistent set of cross-platform components.

## 2. High-Level Architecture

### 2.1. Authentication Flow

The mobile app is entirely responsible for managing the user's session via the JWT.

1.  **Login:** Upon successful login, the API returns a JWT. The frontend must use `react-native-keychain` to store this token securely on the device.
2.  **Authenticated Requests:** An Axios instance will be configured with an interceptor to automatically retrieve the token from the keychain and attach the `Authorization: Bearer <token>` header to all protected API calls.
3.  **Handling 401 Unauthorized:** The Axios response interceptor must handle `401` errors. When one occurs, it should:
    -   Delete the credentials from the keychain.
    -   Clear any global authentication state.
    -   Reset the navigation stack to show the Login screen.
4.  **Logout:** A "logout" action will explicitly delete the credentials from the keychain, clear state, and reset the navigation stack.
5.  **App Startup:** On app launch, the frontend should attempt to retrieve credentials from the keychain. If successful, the user is directed to the main app screen; otherwise, they are sent to the Login screen.

### 2.2. Navigation

A stack-based navigator from React Navigation is recommended.

-   **Conditional Stacks:** The root navigator should conditionally render one of two stacks based on the user's authentication state:
    -   **AuthStack:** Contains the `Login` and `Register` screens.
    -   **MainStack:** Contains the authenticated app experience. This could be a Tab Navigator with screens for `Dashboard`, `Profile`, etc., and other screens like `DeckView` and `ReviewSession` pushed on top.

## 3. Feature Breakdown & Mobile Logic

### 3.1. User Onboarding (Login/Register Screens)

-   **UI:** Native forms using components from the chosen UI library.
-   **Client-Side Validation:** Implement real-time validation for inputs.
-   **State:** Manage loading and error states to provide clear user feedback (e.g., using an `ActivityIndicator`).

### 3.2. Dashboard Screen

-   **Data Fetching:** Use React Query's `useQuery` hook to fetch the list of decks from `GET /api/decks`.
-   **UI:**
    -   Use a `FlatList` for efficient, performant rendering of the deck list.
    -   Implement **Pull-to-Refresh** functionality to allow users to easily refetch their decks.
    -   Each list item should be a touchable component that navigates to the `DeckView` screen on press.
    -   A Floating Action Button (FAB) is a common mobile pattern for a "Create New Deck" action.

### 3.3. Deck View Screen

-   **Data Fetching:** Fetch deck details and the list of cards using the relevant API endpoints.
-   **UI:**
    -   Display deck info in the header.
    -   Use a `FlatList` to display the cards.
    -   Provide clear "Start Review" and "Add Card" buttons.
-   **Mutations:** Use React Query's `useMutation` for creating, updating, and deleting cards, with automatic refetching of the card list on success.

### 3.4. The Review Session Screen

The core logic is identical to the web version, but implemented with native components.

-   **State Management:** A parent `ReviewSession` component will manage the `sessionData`, `reviewQueue`, `currentIndex`, and `results`.
-   **Session Flow:**
    1.  **Setup:** A setup screen allows the user to configure and start the session.
    2.  **Initialization:** On receiving data from the API, flatten it into a `reviewQueue`.
    3.  **Rendering:** Conditionally render a native player component (`<FlashcardPlayer />`, `<MCQPlayer />`, etc.) based on the current item in the queue. These components should be optimized for touch interaction.
    4.  **Progression:** After the user answers, submit the result via the API and increment the `currentIndex` to show the next card.
    5.  **Completion:** Navigate to a summary screen upon completion.

## 4. Mobile-Specific Cross-Cutting Concerns

-   **Offline Support (Aspirational):** For a superior user experience, consider a basic offline strategy.
    -   **Caching:** React Query provides essential caching, but for true offline functionality, decks and cards could be stored in a local database (like WatermelonDB or Realm).
    -   **Queueing Mutations:** If the user edits or adds a card while offline, the action should be queued and synced with the API once a connection is re-established.
-   **Push Notifications (Enhancement):** Leverage push notifications to increase engagement.
    -   **Permissions:** The app must request user permission to send notifications.
    -   **Use Case:** Implement a system (either local or server-driven) to send reminders for users to complete their review sessions (e.g., "Time to review your Spanish deck!").
-   **Platform-Specific UI:** Use React Native's `Platform` module to handle minor UI differences between iOS and Android where necessary (e.g., status bar padding, shadow styles).
-   **Performance:** Ensure high-performance rendering by using `FlatList` correctly, memoizing components with `React.memo`, and avoiding expensive calculations in the render cycle.
