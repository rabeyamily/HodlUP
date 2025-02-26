import React, { useState, useEffect, useCallback } from "react";
import "./styles/App.css";
import NotificationForm from "./components/NotificationForm";
import Confirmation from "./components/Confirmation";
import Header from "./components/Header";
import SentimentAnalysis from "./components/SentimentAnalysis";
import axios from "axios";
import WebsiteIframe from "./components/WebsiteIframe";

function App() {
  const [alertData, setAlertData] = useState(null);
  const [cryptocurrencies, setCryptocurrencies] = useState([]);
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cryptoResponse, sentimentResponse] = await Promise.all([
        axios.get(`${API_URL}/cryptocurrencies/`),
        axios.get(`${API_URL}/reddit-comments-sentiment/`)
      ]);
      
      setCryptocurrencies(cryptoResponse.data);
      setSentimentData(sentimentResponse.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const handleSubmit = async (formData) => {
    try {
      await axios.post(`${API_URL}/alerts/`, formData);
      setAlertData(formData);
    } catch (err) {
      setError("Failed to create alert");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="App">
      <div className="main-content">
        {/* <Header /> */}
        {error && <p className="error-message">{error}</p>}
        
        {!loading && (
          <NotificationForm 
            onSubmit={handleSubmit}
            cryptocurrencies={cryptocurrencies}
          />
        )}
  
        {alertData && (
          <Confirmation
            alertData={alertData}
            onModify={() => setAlertData(null)}
            onClose={() => setAlertData(null)}
          />
        )}
      </div>
  
      {!loading && sentimentData && (
        <SentimentAnalysis sentimentData={sentimentData.data} />
      )}

      <WebsiteIframe></WebsiteIframe>
    </div>
  );
}

export default App;