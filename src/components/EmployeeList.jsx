import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, UserX } from 'lucide-react';

const EmployeeList = ({ onSelectEmployee, onEditEmployee, onDeleteClick }) => {
  // Filters & State
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [layout, setLayout] = useState('grid'); // 'grid' or 'list'
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounced search trigger (fetch on state change)
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          search,
          department,
          role,
          status,
          sortBy,
          sortOrder,
          page: currentPage.toString(),
          limit: '8' // 8 employees per page is nice for the layout grid
        });

        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${apiBase}/api/employees?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to load employee records.');
        }
        const data = await response.json();
        setEmployees(data.employees);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Add a slight delay for search input typing to avoid hitting the API on every keypress
    const delayDebounce = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, department, role, status, sortBy, sortOrder, currentPage]);

  // Reset page when filters change
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    if (filterType === 'department') setDepartment(value);
    if (filterType === 'role') setRole(value);
    if (filterType === 'status') setStatus(value);
  };

  return (
    <div>
      <div className="page-title-area">
        <div>
          <h1 className="page-title">Employee Directory</h1>
          <p className="page-subtitle">Search, filter, and modify staff records</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="control-bar glass-panel">
        <div className="search-wrapper">
          <Search />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="select-input"
            value={department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="General">General</option>
          </select>

          <select
            className="select-input"
            value={role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Manager">Manager</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="HR Specialist">HR Specialist</option>
            <option value="Sales Rep">Sales Rep</option>
            <option value="Marketing Strategist">Marketing Strategist</option>
            <option value="Financial Analyst">Financial Analyst</option>
            <option value="Employee">Employee</option>
          </select>

          <select
            className="select-input"
            value={status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            className="select-input"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
          >
            <option value="createdAt-DESC">Newest First</option>
            <option value="createdAt-ASC">Oldest First</option>
            <option value="firstName-ASC">Name (A-Z)</option>
            <option value="firstName-DESC">Name (Z-A)</option>
            <option value="salary-DESC">Salary (High to Low)</option>
            <option value="salary-ASC">Salary (Low to High)</option>
            <option value="joinDate-DESC">Join Date (Newest)</option>
            <option value="joinDate-ASC">Join Date (Oldest)</option>
          </select>

          <div className="layout-toggle">
            <button
              className={`layout-btn ${layout === 'grid' ? 'active' : ''}`}
              onClick={() => setLayout('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`layout-btn ${layout === 'list' ? 'active' : ''}`}
              onClick={() => setLayout('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="page-loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Querying registry records...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          <p>Error loading employees: {error}</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="empty-state glass-panel">
          <UserX />
          <h3 className="empty-state-title">No Records Found</h3>
          <p>Try refining your search queries or filter categories</p>
        </div>
      ) : layout === 'grid' ? (
        /* GRID VIEW */
        <div className="employees-grid">
          {employees.map((emp) => {
            const init = `${emp.firstName[0] || ''}${emp.lastName[0] || ''}`.toUpperCase();
            return (
              <div key={emp.id} className="employee-card glass-panel">
                <span className={`card-status-badge ${emp.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                  {emp.status}
                </span>

                {emp.avatarUrl ? (
                  <img src={emp.avatarUrl} alt="Avatar" className="card-avatar" />
                ) : (
                  <div className="card-avatar-placeholder">{init}</div>
                )}

                <h3 className="card-name">{emp.firstName} {emp.lastName}</h3>
                <span className="card-role">{emp.role}</span>
                <span className="card-dept">{emp.department}</span>

                <div className="card-footer">
                  <button className="card-btn card-btn-view" onClick={() => onSelectEmployee(emp.id)}>
                    <Eye size={14} />
                    <span>Details</span>
                  </button>
                  <button className="card-btn card-btn-edit" onClick={() => onEditEmployee(emp.id)}>
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="card-btn card-btn-view"
                    style={{ flex: '0 0 auto', padding: '0.6rem 0.75rem', borderColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
                    onClick={() => onDeleteClick(emp)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="table-responsive glass-panel">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Salary</th>
                <th>Joined</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const init = `${emp.firstName[0] || ''}${emp.lastName[0] || ''}`.toUpperCase();
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="table-identity">
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} alt="Avatar" className="table-avatar" />
                        ) : (
                          <div className="table-avatar-placeholder">{init}</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div>
                          <div className="table-email">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.role}</td>
                    <td>${parseFloat(emp.salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>{new Date(emp.joinDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>
                      <span className={`card-status-badge ${emp.status === 'Active' ? 'badge-active' : 'badge-inactive'}`} style={{ position: 'static' }}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="table-action-btn" title="View details" onClick={() => onSelectEmployee(emp.id)}>
                          <Eye size={16} />
                        </button>
                        <button className="table-action-btn" title="Edit record" onClick={() => onEditEmployee(emp.id)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="table-action-btn delete" title="Delete employee" onClick={() => onDeleteClick(emp)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalCount > 0 && (
        <div className="pagination-area">
          <div>
            Showing <span style={{ color: '#fff', fontWeight: 600 }}>{employees.length}</span> of{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>{totalCount}</span> employees
          </div>

          <div className="pagination-btn-group">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
