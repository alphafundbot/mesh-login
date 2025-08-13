import { useState } from 'react';

export default function SessionTracePanel() {
  // Example session trace log; swap with live data as needed
  const [trace] = useState([
    { time: '00:32', event: 'Mutation: count is 2' },
    { time: '00:30', event: 'Cockpit started' },
    { time: '00:29', event: 'HMR pulse' }
  ]);
  return (
    <div style={{marginTop: 20}}>
      <h3>📊 Session Trace</h3>
      <ul>
        {trace.map((t, i) => (
          <li key={i}><b>{t.time}</b> — {t.event}</li>
        ))}
      </ul>
    </div>
  );
}
