import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { RootState } from '../store';
import { updateSetting } from '../store/slices/musicSlice';
import './Settings.scss';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.music);

  const handleToggle = (key: any, value: boolean) => {
    dispatch(updateSetting({ key, value: !value }));
  };

  const SettingRow = ({ title, desc, value, onToggle }: any) => (
    <div className="setting-row" onClick={onToggle}>
      <div className="text">
        <span className="title">{title}</span>
        {desc && <span className="desc">{desc}</span>}
      </div>
      <div className={`toggle ${value ? 'on' : ''}`}>
        <div className="knob" />
      </div>
    </div>
  );

  return (
    <div className="settings-screen scroll-container">
      <header className="settings-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <ArrowLeft size={24} />
        </button>
        <h2>Settings</h2>
      </header>

      <div className="settings-content">
        <section>
          <h3>Account</h3>
          <div className="account-item">
            <div className="avatar">M</div>
            <div className="info">
              <span className="name">Mriganka</span>
              <span className="view-profile">View Profile</span>
            </div>
            <ChevronRight size={20} color="var(--text-secondary)" />
          </div>
        </section>

        <section>
          <h3>Playback</h3>
          <SettingRow
            title="Full songs only"
            desc="Prefer full playable tracks over 30s previews"
            value={settings.fullSongOnly}
            onToggle={() => handleToggle('fullSongOnly', settings.fullSongOnly)}
          />
          <SettingRow
            title="Autoplay"
            desc="Keep on listening to similar tracks"
            value={settings.autoplay}
            onToggle={() => handleToggle('autoplay', settings.autoplay)}
          />
          <SettingRow
            title="Private session"
            desc="Listen anonymously"
            value={settings.privateSession}
            onToggle={() => handleToggle('privateSession', settings.privateSession)}
          />
        </section>

        <section>
          <h3>Data Saver</h3>
          <SettingRow
            title="Data Saver"
            desc="Sets audio quality to low"
            value={settings.dataSaver}
            onToggle={() => handleToggle('dataSaver', settings.dataSaver)}
          />
        </section>

        <div className="logout-section">
           <button className="logout-btn">Log out</button>
           <span className="version">Version 1.0.0-spotify-clone</span>
        </div>
      </div>
    </div>
  );
};

export default Settings;
