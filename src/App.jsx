import { useState, useRef } from 'react';
import { mockSubmit } from './api/mockApi';
import './index.css';

function App() {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');

  // States can be 'idle', 'pending', 'retrying', 'success', 'error'
  const [formState, setFormState] = useState('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [message, setMessage] = useState('');

  // Keep track of submissions to ensure no duplicates
  const [submissions, setSubmissions] = useState([]);

  // AbortController to handle unmounting or cancellation if needed
  const pendingRequestRef = useRef(false);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pendingRequestRef.current) return; // Prevent duplicate submissions explicitly

    const submissionData = {
      id: Date.now(),
      email,
      amount: Number(amount)
    };

    pendingRequestRef.current = true;
    setFormState('pending');
    setMessage('Submitting... please wait.');
    setRetryCount(0);

    let attempts = 0;
    const maxRetries = 3;
    let success = false;

    while (attempts <= maxRetries && !success) {
      try {
        if (attempts > 0) {
          setFormState('retrying');
          setMessage(`Temporary failure. Retrying... (Attempt ${attempts}/${maxRetries})`);
          await delay(2000); // 2s delay between retries
        }

        const response = await mockSubmit(submissionData);

        if (response.status === 200) {
          success = true;
          setFormState('success');
          setMessage(`Success: ${response.message}`);

          setSubmissions((prev) => [
            { ...submissionData, finalStatus: 'Success' },
            ...prev
          ]);

          // Reset form fields
          setEmail('');
          setAmount('');
        }
      } catch (error) {
        if (error.status === 503) {
          attempts++;
          if (attempts > maxRetries) {
            setFormState('error');
            setMessage('Failed after maximum retries. Please try again later.');
          }
        } else {
          // Unhandled error
          setFormState('error');
          setMessage('An unexpected error occurred.');
          break;
        }
      }
    }

    pendingRequestRef.current = false;

    // Clear success/error message after a few seconds
    if (success || attempts > maxRetries) {
      setTimeout(() => {
        setFormState('idle');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <header className="header">
          <h1>Transfer Funds</h1>
          <p>Submit your transfer request securely.</p>
        </header>

        <section className={`form-card panel ${formState}`}>
          <form onSubmit={handleSubmit} className="transfer-form">
            <div className="input-group">
              <label htmlFor="email">Recipient Email</label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={formState === 'pending' || formState === 'retrying'}
                className="simple-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="amount">Amount ($)</label>
              <input
                type="number"
                id="amount"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                disabled={formState === 'pending' || formState === 'retrying'}
                className="simple-input"
              />
            </div>

            <button
              type="submit"
              disabled={formState === 'pending' || formState === 'retrying' || !email || !amount}
              className={`submit-btn ${formState}`}
            >
              {formState === 'pending' && <span className="loader"></span>}
              {formState === 'retrying' && <span className="loader"></span>}
              <span className="btn-text">
                {formState === 'idle' || formState === 'success' || formState === 'error'
                  ? 'Submit Transfer'
                  : formState === 'pending'
                    ? 'Processing...'
                    : 'Retrying...'}
              </span>
            </button>
          </form>

          {message && (
            <div className={`status-message ${formState}`}>
              {message}
            </div>
          )}
        </section>

        {submissions.length > 0 && (
          <section className="recent-submissions panel">
            <h2>Recent Successful Transfers</h2>
            <div className="submissions-list">
              {submissions.map((sub) => (
                <div key={sub.id} className="submission-item">
                  <div className="sub-details">
                    <span className="sub-email">{sub.email}</span>
                    <span className="sub-amount">${sub.amount.toFixed(2)}</span>
                  </div>
                  <div className="sub-status success-badge">
                    ✓ Completed
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
