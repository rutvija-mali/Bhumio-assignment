export const mockSubmit = (data) => {
  return new Promise((resolve, reject) => {
    // Generate a random scenario
    // 0: Success (200)
    // 1: Temporary Failure (503)
    // 2: Delayed Success (5-10 seconds)
    
    // Weighted probabilities: 40% success, 40% failure, 20% delayed success for better testing
    const rand = Math.random();
    
    if (rand < 0.4) {
      // 200 Success immediately (well, short artificial delay)
      setTimeout(() => {
        resolve({ status: 200, message: "Success" });
      }, 500);
    } else if (rand < 0.8) {
      // 503 Temporary Failure
      setTimeout(() => {
        reject({ status: 503, message: "Temporary failure. Please try again." });
      }, 500);
    } else {
      // Delayed success (5 to 10 seconds)
      const delay = Math.floor(Math.random() * 5000) + 5000;
      setTimeout(() => {
        resolve({ status: 200, message: "Delayed success" });
      }, delay);
    }
  });
};
