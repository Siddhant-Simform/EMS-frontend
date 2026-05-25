import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, FileText, Download, Edit2, Trash2, Clock } from 'lucide-react';

const EmployeeDetails = ({ employeeId, onBack, onEdit, onDeleteClick }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${apiBase}/api/employees/${employeeId}`);
        if (!response.ok) {
          throw new Error('Employee record could not be loaded.');
        }
        const data = await response.json();
        setEmployee(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) {
      fetchEmployeeDetails();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="page-loading-wrapper">
        <div className="loading-spinner"></div>
        <p>Retrieving profile dossier...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#ef4444' }}>Error: {error || 'Employee not found.'}</p>
        <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </button>
      </div>
    );
  }

  const init = `${employee.firstName[0] || ''}${employee.lastName[0] || ''}`.toUpperCase();

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </button>
      </div>

      <div className="profile-panel glass-panel">
        <div className="profile-cover"></div>
        
        <div className="profile-header-area">
          {employee.avatarUrl ? (
            <img src={employee.avatarUrl} alt="Avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">{init}</div>
          )}
          
          <div className="profile-identity">
            <div className="profile-name-row">
              <h1 className="profile-name">{employee.firstName} {employee.lastName}</h1>
              <span className={`card-status-badge ${employee.status === 'Active' ? 'badge-active' : 'badge-inactive'}`} style={{ position: 'static' }}>
                {employee.status}
              </span>
            </div>
            <p className="profile-role">{employee.role} • <span style={{ color: 'var(--text-secondary)' }}>{employee.department}</span></p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', zIndex: 10 }}>
            <button className="btn-primary" onClick={() => onEdit(employee.id)}>
              <Edit2 size={16} />
              <span>Edit</span>
            </button>
            <button
              className="btn-secondary"
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              onClick={() => onDeleteClick(employee)}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-info-grid">
            {/* Contact Details Card */}
            <div className="profile-info-card">
              <h3 className="info-card-title">Contact Details</h3>
              <div className="info-item">
                <Mail />
                <div>
                  <div className="info-text-label">Email Address</div>
                  <a href={`mailto:${employee.email}`} className="info-text-val" style={{ textDecoration: 'none' }}>
                    {employee.email}
                  </a>
                </div>
              </div>
              <div className="info-item">
                <Phone />
                <div>
                  <div className="info-text-label">Phone Number</div>
                  <div className="info-text-val">{employee.phone || 'Not provided'}</div>
                </div>
              </div>
            </div>

            {/* Employment Details Card */}
            <div className="profile-info-card">
              <h3 className="info-card-title">Employment Details</h3>
              <div className="info-item">
                <Calendar />
                <div>
                  <div className="info-text-label">Join Date</div>
                  <div className="info-text-val">
                    {new Date(employee.joinDate).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <div className="info-item">
                <DollarSign />
                <div>
                  <div className="info-text-label">Salary (Annual)</div>
                  <div className="info-text-val">
                    ${parseFloat(employee.salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* System Metadata Card */}
            <div className="profile-info-card">
              <h3 className="info-card-title">Security & Log</h3>
              <div className="info-item">
                <Clock />
                <div>
                  <div className="info-text-label">Created At</div>
                  <div className="info-text-val" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(employee.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="info-item">
                <Clock />
                <div>
                  <div className="info-text-label">Last Updated</div>
                  <div className="info-text-val" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(employee.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Tab */}
          <div className="documents-panel">
            <h3 className="info-card-title" style={{ marginBottom: '1rem' }}>Attached Documents</h3>
            {employee.resumeUrl ? (
              <div className="doc-row">
                <div className="doc-info">
                  <FileText size={20} />
                  <div>
                    <div className="doc-name">
                      {employee.resumeUrl.substring(employee.resumeUrl.lastIndexOf('/') + 1)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Dossier CV / Resume contract file
                    </div>
                  </div>
                </div>
                <a
                  href={employee.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ display: 'inline-flex', padding: '0.5rem 1rem', textDecoration: 'none' }}
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No CV or resume document is attached to this employee's profile.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
