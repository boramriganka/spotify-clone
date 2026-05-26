import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Sparkles, Fingerprint } from 'lucide-react';
import CreateSheet from '../CreateSheet/CreateSheet';
import './BottomNav.scss';

const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Search size={24} />
        <span>Search</span>
      </NavLink>
      <button className="nav-item" onClick={() => (window as any).toggleAiDj?.()}>
        <Sparkles size={24} />
        <span>AI DJ</span>
      </button>
      <NavLink to="/dna" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Fingerprint size={24} />
        <span>DNA</span>
      </NavLink>
      <NavLink to="/library" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Library size={24} />
        <span>Library</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
