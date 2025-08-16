import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ title, breadcrumbs = [] }) => {
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
        <span className="current-time">
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default Header;