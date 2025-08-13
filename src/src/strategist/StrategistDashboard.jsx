import SessionTracePanel from './SessionTracePanel';
import MonetizationPanel from './MonetizationPanel';
import DeploymentStatusPanel from './DeploymentStatusPanel';

const strategistId = import.meta.env.VITE_STRATEGIST_ID || 'nehemie.destine';
const walletSeed = import.meta.env.VITE_WALLET_SEED || '***';

export default function StrategistDashboard() {
  return (
    <div
      className="strategist-dashboard"
      style={{
        border: '2px solid #555',
        padding: 24,
        borderRadius: 16,
        background: '#181925',
        color: '#e4e6ef',
        maxWidth: 520,
        margin: '0 auto'
      }}
    >
      <h2>🧬 Strategist Identity</h2>
      <ul>
        <li><b>ID:</b> {strategistId}</li>
        <li>
          <b>Wallet Seed:</b>{" "}
          <span style={{ fontFamily: "monospace" }}>{walletSeed}</span>
        </li>
        <li>
          <b>Mutation Lineage:</b>{" "}
          <span style={{ color: "#25d" }}>Live</span>
        </li>
      </ul>
      <SessionTracePanel />
      <MonetizationPanel />
      <DeploymentStatusPanel />
    </div>
  );
}
