import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, PlusSquare } from 'lucide-react';
import './BottomNav.scss';

interface BottomNavProps {
  onCreateOpen: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onCreateOpen }) => {
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
      <NavLink to="/library" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Library size={24} />
        <span>Your Library</span>
      </NavLink>
      <button className="nav-item" onClick={onCreateOpen}>
        <PlusSquare size={24} />
        <span>Create</span>
      </button>
    </nav>
  );
};

export default BottomNav;
