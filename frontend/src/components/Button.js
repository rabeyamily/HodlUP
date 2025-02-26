// src/components/Button.js
import React from 'react';
import '../styles/Button.css';

export default function Button({ text, onClick }) {
  return (
    <button className="custom-button" onClick={onClick}>
      {text}
    </button>
  );
}
