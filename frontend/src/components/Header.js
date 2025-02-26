// src/components/Header.js
import React from 'react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <img src="/logo.png" alt="HodlUp Logo" className="logo" />
        <h1>HodlUp!</h1>
        <span
          className="crypto-companion"
          style={{
            marginLeft: '10px',
            fontFamily: 'monospace',
            fontSize: '16px',
          }}
        >
          Your Ultimate Crypto Companion
        </span>
      </div>
    </header>
  );
};

export default Header;