# HODL Up - Crypto Alert and Sentiment Analysis Platform

HODL Up is an innovative cryptocurrency monitoring tool that provides customizable price alerts, sentiment analysis, and NFT creation to help users make informed investment decisions.

## Features and Functionality

- **Customizable Price Alerts**: Set specific price thresholds for cryptocurrencies and receive notifications via email or phone call.
- **Sentiment Analysis**: Analyzes Reddit posts and comments using the Reddit API, providing insights into crypto trends and news.
- **Non-Fungible Token (NFT) Creator**: Upload any image to generate an NFT, democratizing NFT creation.
- **Real-time Cryptocurrency Data**: Fetches data from the CoinGecko API for up-to-date information.
- **User-Friendly Interface**: Designed for both beginners and experienced traders.
- **Free Access**: All features available without account signup.

## Tech Stack

- **Frontend**: React, JavaScript, CSS
- **Backend**: FastAPI
- **Database**: MySQL
- **APIs**: Reddit API, CoinGecko API
- **Sentiment Analysis**: NLTK's VADER (Valence Aware Dictionary and sEntiment Reasoner) sentiment analyzer

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install required packages:
   ```bash
   pip install fastapi uvicorn sqlalchemy pymysql python-dotenv requests apscheduler email-validator twilio openai praw nltk
   ```

3. Start the backend server:
   ```bash
   ./venv/bin/uvicorn main:app --reload
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the frontend development server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables: 

```
# Database Configuration
DB_USER=your_db_user_id
DB_PASS=your_db_password
DB_HOST=your_db_host_id
DB_NAME=your_db_name

# Email Configuration
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

# Reddit API Configuration
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=your_reddit_user_agent

# Cryptocurrency Configuration
CRYPTO_IDS=bitcoin,ethereum,dogecoin  # Comma-separated list of crypto IDs

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

Replace the placeholder values with your actual credentials (provided to you in the final submission textbox) 

## How to Use HODL Up

1. **Select Cryptocurrency**: Choose from a list of available cryptocurrencies.
2. **Set Price Thresholds**: 
   - Set a lower threshold (for selling alerts)
   - Set an upper threshold (for buying alerts)
3. **Choose Change Type**: Select whether to be notified based on percentage change or absolute price change.
4. **Select Notification Type**: Choose between email or phone call notifications.
5. **View Sentiment Analysis**: Check the sentiment score for your selected cryptocurrency to gauge market sentiment.
6. **Create NFT**: Upload an image to the NFT generator to create your own unique NFT.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
