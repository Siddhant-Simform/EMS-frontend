import React, { useEffect, useState } from 'react';
import { Users, Activity, DollarSign, UserX, UserPlus, TrendingUp } from 'lucide-react';

const Dashboard = ({ onViewChange, onSelectEmployee }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${apiBase}/api/employees/stats`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats.');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-loading-wrapper">
        <div className="loading-spinner"></div>
        <p>Analyzing company directories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <p>Error loading dashboard: {error}</p>
        <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const { totalEmployees, activeCount, inactiveCount, avgSalary, departmentBreakdown, recentHires } = stats || {
    totalEmployees: 0,
    activeCount: 0,
    inactiveCount: 0,
    avgSalary: '0.00',
    departmentBreakdown: [],
    recentHires: []
  };

  // Find max department count for chart scaling
  const maxCount = departmentBreakdown.length > 0
    ? Math.max(...departmentBreakdown.map(d => parseInt(d.count)))
    : 1;

  return (
    <div>
      <div className="page-title-area">
        <div>
          <h1 className="page-title">Executive Summary</h1>
          <p className="page-subtitle">Real-time overview of organization metrics and distribution</p>
        </div>
        <button className="btn-primary" onClick={() => onViewChange('add-employee')}>
          <UserPlus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel indigo">
          <div className="metric-header">
            <span>Total Staff</span>
            <div className="metric-icon-wrapper">
              <Users size={20} />
            </div>
          </div>
          <div className="metric-value">{totalEmployees}</div>
          <div className="metric-trend">
            <TrendingUp size={14} style={{ color: '#10b981' }} />
            <span>Active directory counts</span>
          </div>
        </div>

        <div className="metric-card glass-panel emerald">
          <div className="metric-header">
            <span>Active Status</span>
            <div className="metric-icon-wrapper">
              <Activity size={20} />
            </div>
          </div>
          <div className="metric-value">{activeCount}</div>
          <div className="metric-trend">
            <span style={{ color: '#10b981', fontWeight: 600 }}>
              {totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 0}%
            </span>
            <span>of total staff active</span>
          </div>
        </div>

        <div className="metric-card glass-panel rose">
          <div className="metric-header">
            <span>Inactive Status</span>
            <div className="metric-icon-wrapper">
              <UserX size={20} />
            </div>
          </div>
          <div className="metric-value">{inactiveCount}</div>
          <div className="metric-trend">
            <span style={{ color: '#ef4444', fontWeight: 600 }}>
              {totalEmployees > 0 ? Math.round((inactiveCount / totalEmployees) * 100) : 0}%
            </span>
            <span>on leave / separated</span>
          </div>
        </div>

        <div className="metric-card glass-panel cyan">
          <div className="metric-header">
            <span>Average Salary</span>
            <div className="metric-icon-wrapper">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">${parseFloat(avgSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="metric-trend">
            <span>Standard base package</span>
          </div>
        </div>
      </div>

      {/* Analytics & Recent hires */}
      <div className="dashboard-grid">
        {/* SVG Department Chart */}
        <div className="chart-card glass-panel">
          <h2 className="chart-title">Department Distribution</h2>
          <div className="chart-container">
            {departmentBreakdown.length === 0 ? (
              <div style={{ margin: 'auto', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No department data available.
              </div>
            ) : (
              <svg className="svg-chart" viewBox="0 0 500 240">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="barHoverGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                <line x1="40" y1="100" x2="480" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                <line x1="40" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.1)" />

                {/* Map bars */}
                {departmentBreakdown.map((dept, index) => {
                  const width = 440;
                  const barSpacing = width / departmentBreakdown.length;
                  const barWidth = Math.min(45, barSpacing - 20);
                  const x = 50 + index * barSpacing + (barSpacing - barWidth) / 2 - 10;
                  
                  const countVal = parseInt(dept.count);
                  const barHeight = (countVal / maxCount) * 150; // max height 150px
                  const y = 200 - barHeight;

                  return (
                    <g key={dept.department}>
                      {/* Bar */}
                      <rect
                        className="chart-bar-rect"
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                      />
                      {/* Value label on top of bar */}
                      <text
                        className="chart-text-value"
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                      >
                        {countVal}
                      </text>
                      {/* Department name axis label */}
                      <text
                        className="chart-text"
                        x={x + barWidth / 2}
                        y="220"
                        textAnchor="middle"
                      >
                        {dept.department.length > 8 ? `${dept.department.substring(0, 7)}.` : dept.department}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Recent Hires */}
        <div className="chart-card glass-panel">
          <h2 className="chart-title">Recent Hires</h2>
          <div className="recent-hires-list">
            {recentHires.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No recent hires.
              </div>
            ) : (
              recentHires.map(employee => {
                const init = `${employee.firstName[0] || ''}${employee.lastName[0] || ''}`.toUpperCase();
                return (
                  <div
                    key={employee.id}
                    className="hire-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectEmployee(employee.id)}
                  >
                    {employee.avatarUrl ? (
                      <img src={employee.avatarUrl} alt="Avatar" className="hire-avatar" />
                    ) : (
                      <div className="hire-avatar-placeholder">{init}</div>
                    )}
                    <div className="hire-info">
                      <div className="hire-name">{employee.firstName} {employee.lastName}</div>
                      <div className="hire-dept">{employee.department} • {employee.role}</div>
                    </div>
                    <div className="hire-date">
                      {new Date(employee.joinDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
