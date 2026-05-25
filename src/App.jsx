import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeDetails from './components/EmployeeDetails';
import EmployeeForm from './components/EmployeeForm';
import { Menu, UserX } from 'lucide-react';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Toast Notification System
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Delete Overlay State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // View switches
  const handleViewChange = (view) => {
    setActiveView(view);
    setSelectedEmployeeId(null);
  };

  const handleSelectEmployee = (id) => {
    setSelectedEmployeeId(id);
    setActiveView('view-employee');
  };

  const handleEditEmployee = (id) => {
    setSelectedEmployeeId(id);
    setActiveView('edit-employee');
  };

  // Delete confirmation executor
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBase}/api/employees/${deleteTarget.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete record.');
      }
      addToast(`${deleteTarget.firstName} ${deleteTarget.lastName} has been removed from directory.`, 'success');
      
      // If we deleted the employee we were viewing, go back to list
      if (activeView === 'view-employee' && selectedEmployeeId === deleteTarget.id) {
        setActiveView('directory');
        setSelectedEmployeeId(null);
      } else {
        // Trigger a simple view re-render or let state propagate
        // Toggling state slightly to trigger directory fetch refresh
        setActiveView(prev => prev);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Render view
  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            onViewChange={handleViewChange}
            onSelectEmployee={handleSelectEmployee}
          />
        );
      case 'directory':
        return (
          <EmployeeList
            onSelectEmployee={handleSelectEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteClick={setDeleteTarget}
          />
        );
      case 'view-employee':
        return (
          <EmployeeDetails
            employeeId={selectedEmployeeId}
            onBack={() => setActiveView('directory')}
            onEdit={handleEditEmployee}
            onDeleteClick={setDeleteTarget}
          />
        );
      case 'add-employee':
        return (
          <EmployeeForm
            onBack={() => setActiveView('directory')}
            onSaveSuccess={() => setActiveView('directory')}
            addToast={addToast}
          />
        );
      case 'edit-employee':
        return (
          <EmployeeForm
            employeeId={selectedEmployeeId}
            onBack={() => setActiveView('directory')}
            onSaveSuccess={() => setActiveView('directory')}
            addToast={addToast}
          />
        );
      default:
        return (
          <Dashboard
            onViewChange={handleViewChange}
            onSelectEmployee={handleSelectEmployee}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-accent)', fontWeight: 800 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <span style={{ fontSize: '1.1rem' }}>Quantum EMS</span>
        </div>
        <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </header>

      {/* Navigation Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Core View Area */}
      <main className="main-content">
        {renderCurrentView()}
      </main>

      {/* Delete Confirmation Modal Overlay */}
      {deleteTarget && (
        <div className="overlay">
          <div className="modal glass-panel">
            <div className="modal-icon-danger">
              <UserX size={28} />
            </div>
            <h2 className="modal-title">Delete Employee Record?</h2>
            <p className="modal-desc">
              Are you sure you want to permanently remove <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong> from the corporate directory? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--color-danger)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)' }}
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
