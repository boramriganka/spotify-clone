import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserPlus, Zap, Clock, Bell, Settings, LogOut, X } from 'lucide-react';
import './AccountDrawer.scss';

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountDrawer: React.FC<AccountDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="account-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="drawer-header">
              <div className="profile-section">
                <div className="avatar large">M</div>
                <div className="profile-info">
                  <h3>Mriganka</h3>
                  <button className="view-profile">View Profile</button>
                </div>
              </div>
              <button onClick={onClose} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <div className="drawer-content scroll-container">
              <div className="drawer-section">
                <div className="drawer-item">
                  <UserPlus size={20} />
                  <span>Add account</span>
                </div>
                <div className="drawer-item">
                  <Zap size={20} />
                  <span>Your Premium</span>
                </div>
              </div>

              <div className="drawer-section">
                <div className="drawer-item">
                  <div className="icon-dot-wrapper">
                     <Clock size={20} />
                     <div className="new-dot" />
                  </div>
                  <span>What's new</span>
                </div>
                <div className="drawer-item">
                  <Clock size={20} />
                  <span>Listening history</span>
                </div>
                <div className="drawer-item">
                  <Settings size={20} />
                  <span>Settings and privacy</span>
                </div>
              </div>

              <div className="drawer-footer">
                <button className="logout-btn">
                  <LogOut size={20} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AccountDrawer;
