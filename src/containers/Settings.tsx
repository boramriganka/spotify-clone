import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Settings.scss';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [toggles, setToggles] = useState(() => {
    const saved = localStorage.getItem('spotify_settings_toggles');
    return saved ? JSON.parse(saved) : {
      privateSession: false,
      autoplay: true,
      gapless: true,
      dataSaver: false,
      downloadWifiOnly: true,
      normalizeVolume: true,
      showCanvas: true,
    };
  });

  useEffect(() => {
    localStorage.setItem('spotify_settings_toggles', JSON.stringify(toggles));
  }, [toggles]);

  const handleToggle = (key: string) => {
    setToggles((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: 'Provider Status (Neo Debug)',
      items: [
        { label: 'Audius API', type: 'status', status: 'Active' },
        { label: 'Jamendo API', type: 'status', status: 'Active' },
        { label: 'iTunes Fallback', type: 'status', status: 'Ready' },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Private session', type: 'toggle', key: 'privateSession', subtitle: 'Hide your listening activity' },
        { label: 'Profile', type: 'link' },
      ]
    },
    {
      title: 'Playback',
      items: [
        { label: 'Autoplay', type: 'toggle', key: 'autoplay', subtitle: 'Keep the music playing when yours ends' },
        { label: 'Gapless playback', type: 'toggle', key: 'gapless' },
        { label: 'Normalize volume', type: 'toggle', key: 'normalizeVolume' },
      ]
    },
    {
      title: 'Data Saver',
      items: [
        { label: 'Data Saver', type: 'toggle', key: 'dataSaver', subtitle: 'Reduces data usage' },
        { label: 'Download over Wi-Fi only', type: 'toggle', key: 'downloadWifiOnly' },
      ]
    },
    {
      title: 'Content and display',
      items: [
        { label: 'Show Canvas', type: 'toggle', key: 'showCanvas' },
        { label: 'Explicit content', type: 'link' },
      ]
    },
  ];

  return (
    <div className="settings-screen">
      <header className="settings-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
        <h1>Settings</h1>
        <button className="search-btn"><Search size={24} /></button>
      </header>

      <div className="settings-content scroll-container">
        {sections.map((section) => (
          <div key={section.title} className="settings-section">
            <h2>{section.title}</h2>
            {section.items.map((item: any) => (
              <div key={item.label} className="settings-item" onClick={() => item.type === 'toggle' && handleToggle(item.key)}>
                <div className="item-text">
                  <span className="label">{item.label}</span>
                  {item.subtitle && <span className="subtitle">{item.subtitle}</span>}
                </div>
                {item.type === 'toggle' ? (
                  <div className={`toggle-switch ${toggles[item.key] ? 'active' : ''}`}>
                    <div className="toggle-thumb" />
                  </div>
                ) : item.type === 'status' ? (
                  <span className="status-text">{item.status}</span>
                ) : (
                  <ChevronRight size={20} color="var(--text-secondary)" />
                )}
              </div>
            ))}
          </div>
        ))}

        <button className="logout-btn">Log out</button>
      </div>
    </div>
  );
};

export default Settings;
