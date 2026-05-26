import React from 'react';
import { musicService } from '../providers';
import './Settings.scss';

const DebugProviders: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    // In a real app, this would come from a service tracking these metrics
    setStats({
      audius: { status: 'active', latency: '120ms', searches: 45 },
      jamendo: { status: 'active', latency: '210ms', searches: 12 },
      itunes: { status: 'active (fallback)', latency: '85ms', searches: 110 },
      lastError: 'None',
      lastFallback: 'Jamendo -> Audius'
    });
  }, []);

  if (!stats) return <div>Loading provider status...</div>;

  return (
    <div className="debug-providers">
      <h1>Provider Status Debug</h1>
      <section>
        <h3>Audius</h3>
        <p>Status: <span className="status-ok">{stats.audius.status}</span></p>
        <p>Latency: {stats.audius.latency}</p>
      </section>
      <section>
        <h3>Jamendo</h3>
        <p>Status: <span className="status-ok">{stats.jamendo.status}</span></p>
        <p>Latency: {stats.jamendo.latency}</p>
      </section>
      <section>
        <h3>iTunes Fallback</h3>
        <p>Status: {stats.itunes.status}</p>
        <p>Latency: {stats.itunes.latency}</p>
      </section>
      <section className="metrics">
        <h3>Recent Activity</h3>
        <p>Last playback error: {stats.lastError}</p>
        <p>Last fallback used: {stats.lastFallback}</p>
      </section>
    </div>
  );
};

export default DebugProviders;
