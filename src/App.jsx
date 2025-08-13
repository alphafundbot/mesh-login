import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(1);

  return (
    <div className="cockpit">
      <h1>Welcome, Strategist Nehemie</h1>
      <p>Your cockpit is live and sovereign.</p>
      <p>Mutation lineage is active.</p>
      <button onClick={() => setCount(count + 1)}>
        Mutation count: {count}
      </button>
    </div>
  );
}

export default App;
