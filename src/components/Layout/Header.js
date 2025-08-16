import React from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { DataSourceContext } from '../../context/DataSourceContext';


const Header = ({ title, breadcrumbs = [] }) => {
  const { useMockData, setUseMockData } = useContext(DataSourceContext);
  return (
    <div className="header">
      <div>
        <h2>{title}</h2>
        {breadcrumbs.length > 1 && (
          <div className="breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {crumb.path ? (
                  <Link to={crumb.path}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="breadcrumb-separator">/</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="header-actions">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16, color: '#6B7280' }}>
          <input
            type="checkbox"
            checked={useMockData}
            onChange={(e) => setUseMockData(e.target.checked)}
            title="Use mock demo data"
          />
          Demo Data
        </label>
        <span className="current-time">
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default Header;