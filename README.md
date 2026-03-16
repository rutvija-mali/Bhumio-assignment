# Eventually Consistent Form

This project implements a single-page React application that collects an `email` and an `amount` and submits it to a mock API that simulates an eventually consistent server (returning random successes, temporary 503 errors, and delayed responses).

## State Transitions

The form's UI utilizes React state (`formState`) to control rendering. The possible states are:
- **`idle`**: The initial state, ready for input.
- **`pending`**: Form is disabled, and a request is actively being processed. If the response takes 5-10 seconds, the UI gracefully informs the user. 
- **`retrying`**: If a `503 Temporary Failure` is returned, the state switches to retrying, keeping the inputs disabled and initiating a backoff execution.
- **`success`**: The request succeeded (either immediately, after a delay, or after retries). Displays a brief success message and adds the transaction to a list of successful submissions. Form resets to `idle` after a few seconds.
- **`error`**: The request failed permanently (exhausted all retries).

## Retry Logic

If the mock API throws a `503 Temporary Failure`, the `handleSubmit` function in `App.jsx` handles it utilizing an exponential/delayed retry mechanism:
- A `while` loop checks for the number of `attempts`.
- A 2-second delay (`setTimeout` wrapped in a Promise) is enforced between each retry attempt.
- The system allows a maximum of 3 retries.
- If the max retries are exceeded, the process breaks out of the loop and updates the state to `error`.

## Deduplication and Idempotency

Duplicate records and race conditions can occur if a user double-clicks the "Submit" button rapidly or manages to re-submit while a retry is pending. 
To prevent this:
1. **UI Blocking**: The submit button and all input fields are completely `disabled` during the `pending` or `retrying` phases.
2. **Ref Blocking**: A `pendingRequestRef` (React `useRef`) explicitly prevents function execution. If `handleSubmit` is called while the ref is `true`, it immediately returns, blocking concurrent executions.
3. Every submission generates a unique ID (`Date.now()`) simulating an idempotency key.

## Run Locally

This app uses Vite.
```bash
npm install
npm run dev
```
### Demo : https://bhumio-assignment-roan.vercel.app/
