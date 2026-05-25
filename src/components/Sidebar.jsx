import React from 'react';
import { LayoutDashboard, Users, UserPlus, Database, X } from 'lucide-react';

const Sidebar = ({ activeView, onViewChange, isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>Quantum EMS</span>
        {isOpen && (
          <button className="menu-toggle" style={{ marginLeft: 'auto' }} onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>

      <ul className="sidebar-menu">
        <li>
          <a
            className={`sidebar-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('dashboard');
              onClose();
            }}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </a>
        </li>
        <li>
          <a
            className={`sidebar-item ${activeView === 'directory' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('directory');
              onClose();
            }}
          >
            <Users />
            <span>Directory</span>
          </a>
        </li>
        <li>
          <a
            className={`sidebar-item ${activeView === 'add-employee' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('add-employee');
              onClose();
            }}
          >
            <UserPlus />
            <span>Add Employee</span>
          </a>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="sidebar-db-status">
          <span className="status-dot pulse"></span>
          <span>System Connected</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
