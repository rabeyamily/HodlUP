// src/components/Confirmation.js
import React from 'react';
import '../styles/Confirmation.css';

const Confirmation = ({ alertData, onModify, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1>Alert Setup Complete!</h1>
        <div className="confirmation-details">
          <p>Cryptocurrency ID: {alertData.crypto_id}</p>
          <p>Notification Type: {alertData.notification_type}</p>
          <p>Threshold Value: {alertData.threshold_price}</p>
          <p>Notification Method: {alertData.notification_method}</p>
        </div>
        <div className="modal-buttons">
          <button className="modal-button" onClick={onModify}>
            Modify Settings
          </button>
          <button className="modal-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;