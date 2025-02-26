import React, { useState } from 'react';
import '../styles/NotificationForm.css';
import Button from "./Button";
import Dropdown from "./Dropdown";
import axios from "axios";

const NotificationForm = ({ onSubmit, cryptocurrencies }) => {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptocurrencies[0]?.id || "");
  const [notificationType, setNotificationType] = useState("Price");
  const [thresholdValue, setThresholdValue] = useState("");
  const [lowerThresholdValue, setLowerThresholdValue] = useState("");
  const [notificationMethod, setNotificationMethod] = useState("Email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\+1\d{10}$/;
    return phoneRegex.test(number);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailSuccess(null);
    setEmailError(null);

    try {
      await axios.post(`${API_URL}/send-email`, { email });
      setEmailSuccess("Email sent successfully!");
    } catch (err) {
      console.error("Error sending email:", err);
      setEmailError("Failed to send the email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPhoneNumber(null);
    setPhoneSuccess(null);
    setPhoneError(null);

    // Only make the API call if the notification method is "Phone Call" and phone number is valid
    if (notificationMethod === 'Phone Call') {
      if (!validatePhoneNumber(phoneNumber)) {
        // Catch error for invalid phone number
        setPhoneError('Please enter a valid phone number (+1XXXXXXXXXX).');
        return; // Stop further execution
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/make-call/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone_number: phoneNumber }),
        });

        const result = await response.json();

        // Handle response from backend
        if (response.ok) {
          setPhoneSuccess('Phone call request has been triggered!');
          setPhoneError(null); // Clear any previous error
        } else {
          // Handle backend error
          setPhoneError(result.error || 'Failed to make the call. Please try again.');
        }
      } catch (error) {
        console.error('Error making phone call:', error);
        setPhoneError('Failed to make the call. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetAlert = async () => {
    if (!thresholdValue) {
      setError("Threshold value is required.");
      return;
    }

    // Clear error if validation passes
    setPhoneError('');

    const alertData = {
      crypto_id: selectedCrypto,
      notification_type: notificationType,
      threshold_price: parseFloat(thresholdValue),
      lower_threshold_price: parseFloat(lowerThresholdValue),
      notification_method: notificationMethod,
      phoneNumber: notificationMethod === 'Phone Call' ? phoneNumber : null, // Include phone number only if Phone Call is selected
      email: notificationMethod === 'Email' ? email : null, // Include email only if Phone Call is selected
    };

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/alerts/`, alertData);
      console.log("Alert created:", response.data);
      onSubmit(alertData);
      console.log(alertData);
      setError(null);
    } catch (err) {
      console.error("Error setting alert:", err);
      setError("Setting alerts is not available at the moment.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCryptoDetails = cryptocurrencies.find(
    (crypto) => crypto.id == selectedCrypto
  );

  return (
    <div className="notification-form">
      <h2>Set Notification</h2>

      {/* Dropdown for Cryptocurrency Selection */}
      <Dropdown
        label="Select Cryptocurrency:"
        options={cryptocurrencies.map((crypto) => ({
          value: crypto.id,
          label: crypto.name,
        }))}
        onSelect={setSelectedCrypto}
        selectedValue={selectedCrypto}
      />

      {/* Display Selected Cryptocurrency Details */}
      {selectedCryptoDetails && (
        <div className="crypto-details">
          <p>
            Market Cap: ${selectedCryptoDetails.market_cap.toLocaleString()}
          </p>
          <p>Hourly Price: ${selectedCryptoDetails.hourly_price}</p>
          <p>
            Hourly Percentage Change: {selectedCryptoDetails.hourly_percentage}%
          </p>
          <p>
            Last Updated:{" "}
            {new Date(selectedCryptoDetails.time_updated).toLocaleString()}
          </p>
        </div>
      )}

      {/* Dropdown for Notification Type */}
      <Dropdown
        label="Get notified by change in:"
        options={[
          { value: "Price", label: "Price" },
          { value: "Percentage", label: "Percentage" },
        ]}
        onSelect={setNotificationType}
        selectedValue={notificationType}
      />

      {/* Input for Threshold */}
      <div className="input-group">
        <label>Set Upper Threshold:</label>
        <input
          type="number"
          value={thresholdValue}
          onChange={(e) => setThresholdValue(e.target.value)}
          step="any"
          placeholder="Enter threshold value"
        />
      </div>
      
      <div className="input-group">
        <label>Set Lower Threshold:</label>
        <input
          type="number"
          value={lowerThresholdValue}
          onChange={(e) => setLowerThresholdValue(e.target.value)}
          step="any"
          placeholder="Enter threshold value"
        />
      </div>

      {/* Dropdown for Notification Method */}
      <Dropdown
        label="Notification Method"
        options={[
          { value: "Email", label: "Email" },
          { value: "Phone Call", label: "Phone Call" },
          //{ value: "SMS", label: "SMS" },
        ]}
        onSelect={setNotificationMethod}
        selectedValue={notificationMethod}
      />

      {/* Dynamically Render Email Input if "Email" is Selected */}
      {notificationMethod === "Email" && (
        <div className="email-section">
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="ex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
          {emailSuccess && <p style={{ color: "green" }}>{emailSuccess}</p>}
          {emailError && <p style={{ color: "red" }}>{emailError}</p>}
        </div>
      )}

      {/* Conditional Input for Phone Number */}
      {notificationMethod === 'Phone Call' && (
        <div className="phone-section">
          <form onSubmit={handlePhoneNumberSubmit}>
            <input
              type="text"
              placeholder="+1xxxxxxxxxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            {/* Button is disabled if phone number is invalid or loading */}
            <button type="submit" disabled={loading || (notificationMethod === 'Phone Call' && !validatePhoneNumber(phoneNumber))}>
              {loading ? "Calling..." : "Call"}
            </button>

            {/* Only show the error if the phone number is invalid and has been entered */}
            {phoneNumber && !validatePhoneNumber(phoneNumber) && (
              <p style={{ color: "red", fontSize: "0.9em" }}>
                {phoneError || "Please enter a valid phone number (+1xxxxxxxxxx)."}
              </p>
            )}
          </form>
          {phoneSuccess && <p style={{ color: "green", fontSize: "0.9em" }}>{phoneSuccess}</p>}
          {phoneError && <p style={{ color: "red" }}>{phoneError}</p>}
        </div>
      )}
      {/* Disaply Error message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Submit Button */}
      <Button
        text={loading ? "Setting Alert..." : "Set Alert!"}
        onClick={handleSetAlert}
        disabled={loading}
      />
    </div>
  );
};

export default NotificationForm;
