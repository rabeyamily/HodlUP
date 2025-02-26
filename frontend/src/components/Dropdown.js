/* src/components/Dropdown.js */
import React from 'react';
import '../styles/Dropdown.css';

const Dropdown = ({ label, options, onSelect, selectedValue, disabled }) => {
  return (
    <div className="dropdown-container">
      <label>{label}</label>
      <select 
        value={selectedValue} 
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option} 
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;