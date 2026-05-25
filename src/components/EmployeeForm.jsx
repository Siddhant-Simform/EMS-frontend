import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, DollarSign, Calendar, Upload, Image, FileText, X } from 'lucide-react';

const EmployeeForm = ({ employeeId, onBack, onSaveSuccess, addToast }) => {
  const isEditMode = !!employeeId;
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Employee');
  const [department, setDepartment] = useState('Engineering');
  const [salary, setSalary] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Active');
  
  // Files
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  
  // Error handling
  const [formErrors, setFormErrors] = useState({});

  // Fetch employee details if in edit mode
  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${apiBase}/api/employees/${employeeId}`);
        if (!response.ok) {
          throw new Error('Could not load employee details.');
        }
        const data = await response.json();
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setPhone(data.phone || '');
        setRole(data.role);
        setDepartment(data.department);
        setSalary(data.salary.toString());
        setJoinDate(data.joinDate);
        setStatus(data.status);
        if (data.avatarUrl) {
          setAvatarPreview(data.avatarUrl);
        }
      } catch (err) {
        addToast(err.message || 'Error loading data', 'error');
        onBack();
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchEmployee();
    }
  }, [employeeId]);

  // Handle avatar file selection & preview
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Profile picture must be an image file!', 'error');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle resume file selection
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      if (!allowedTypes.includes(file.mimetype) && !allowedTypes.includes(file.type)) {
        addToast('Resume must be a PDF, DOC, DOCX, or TXT file!', 'error');
        return;
      }
      setResumeFile(file);
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email address';
    }

    if (salary && isNaN(parseFloat(salary))) {
      errors.salary = 'Salary must be a numeric value';
    } else if (salary && parseFloat(salary) < 0) {
      errors.salary = 'Salary cannot be negative';
    }

    if (!joinDate) errors.joinDate = 'Join date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('role', role);
    formData.append('department', department);
    formData.append('salary', salary || '0');
    formData.append('joinDate', joinDate);
    formData.append('status', status);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const url = isEditMode ? `${apiBase}/api/employees/${employeeId}` : `${apiBase}/api/employees`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData // Content-Type is automatically set with boundary for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred during submission.');
      }

      addToast(
        isEditMode ? 'Employee record updated successfully!' : 'New employee registered successfully!',
        'success'
      );
      
      onSaveSuccess();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title-area">
        <div>
          <h1 className="page-title">{isEditMode ? 'Edit Employee Dossier' : 'New Employee Entry'}</h1>
          <p className="page-subtitle">
            {isEditMode ? 'Update existing directory values and attachments' : 'Add a new member to the corporate directory'}
          </p>
        </div>
      </div>

      <div className="form-panel glass-panel">
        {loading && !firstName && isEditMode ? (
          <div className="page-loading-wrapper" style={{ height: '300px' }}>
            <div className="loading-spinner"></div>
            <p>Loading dossier...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              
              {/* First Name */}
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ borderColor: formErrors.firstName ? 'var(--color-danger)' : '' }}
                  />
                </div>
                {formErrors.firstName && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.firstName}</span>
                )}
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ borderColor: formErrors.lastName ? 'var(--color-danger)' : '' }}
                />
                {formErrors.lastName && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.lastName}</span>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="jane.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderColor: formErrors.email ? 'var(--color-danger)' : '' }}
                />
                {formErrors.email && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.email}</span>
                )}
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  className="form-control select-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Role */}
              <div className="form-group">
                <label className="form-label">Role / Job Title *</label>
                <select
                  className="form-control select-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Manager">Manager</option>
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="HR Specialist">HR Specialist</option>
                  <option value="Sales Rep">Sales Rep</option>
                  <option value="Marketing Strategist">Marketing Strategist</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              {/* Salary */}
              <div className="form-group">
                <label className="form-label">Annual Salary ($)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="85000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  style={{ borderColor: formErrors.salary ? 'var(--color-danger)' : '' }}
                />
                {formErrors.salary && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.salary}</span>
                )}
              </div>

              {/* Join Date */}
              <div className="form-group">
                <label className="form-label">Hire Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  style={{ borderColor: formErrors.joinDate ? 'var(--color-danger)' : '' }}
                />
                {formErrors.joinDate && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{formErrors.joinDate}</span>
                )}
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Employee Status</label>
                <select
                  className="form-control select-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Files inputs */}
              <div className="form-group full-width" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Profile Image (Avatar)</label>
                <div className="file-upload-container">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="file-upload-preview-avatar" />
                  ) : (
                    <div className="file-upload-preview-icon">
                      <Image size={24} />
                    </div>
                  )}
                  <div className="file-upload-info">
                    <div className="file-upload-title">
                      {avatarFile ? avatarFile.name : 'Select profile image file'}
                    </div>
                    <div className="file-upload-subtitle">
                      PNG, JPG, WEBP, GIF (Max 2MB)
                    </div>
                  </div>
                  <input
                    type="file"
                    className="file-upload-input"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  {avatarPreview && (
                    <button
                      type="button"
                      className="table-action-btn delete"
                      style={{ zIndex: 10, padding: '8px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarFile(null);
                        setAvatarPreview('');
                      }}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Resume Document (PDF/DOC)</label>
                <div className="file-upload-container">
                  <div className="file-upload-preview-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-secondary)' }}>
                    <FileText size={24} />
                  </div>
                  <div className="file-upload-info">
                    <div className="file-upload-title">
                      {resumeFile ? resumeFile.name : 'Upload Curriculum Vitae / Resume'}
                    </div>
                    <div className="file-upload-subtitle">
                      PDF, DOC, DOCX, TXT (Max 5MB)
                    </div>
                  </div>
                  <input
                    type="file"
                    className="file-upload-input"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleResumeChange}
                  />
                  {resumeFile && (
                    <button
                      type="button"
                      className="table-action-btn delete"
                      style={{ zIndex: 10, padding: '8px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                      }}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onBack} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditMode ? 'Update Dossier' : 'Register Employee'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeForm;
