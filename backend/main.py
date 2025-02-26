from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, select
from dotenv import load_dotenv
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import os
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client
from models import Alert
from reddit_scraper import fetch_reddit_comments
from reddit_scraper import fetch_reddit_comments_with_sentiment



# Load environment variables
load_dotenv()

# FastAPI App
app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",  # React app
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = os.getenv("EMAIL_USER")  # Your email address
EMAIL_PASSWORD = os.getenv("EMAIL_PASS")  # Your email password or app-specific password

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Cryptocurrency model
class Cryptocurrency(Base):
    __tablename__ = 'cryptocurrencies'
    crypto_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    market_cap = Column(Float, nullable=True)
    hourly_price = Column(Float, nullable=True)
    hourly_percentage = Column(Float, nullable=True)
    time_updated = Column(DateTime, nullable=True)


# Create tables
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Fetch data from CoinGecko API
def fetch_coingecko_data():
    url = "https://api.coingecko.com/api/v3/coins/markets"
    crypto_ids = os.getenv("CRYPTO_IDS", "bitcoin,ethereum")
    params = {
        "vs_currency": "usd",
        "ids": crypto_ids,
        "order": "market_cap_desc",
        "per_page": 100,
        "page": 1,
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching data from CoinGecko: {e}")
        return None


# Update cryptocurrency data in the database
def update_cryptocurrency_data(db: Session, data: list):
    for crypto in data:
        crypto_id = crypto["id"]
        market_cap = crypto.get("market_cap", 0.0)
        current_price = crypto.get("current_price", 0.0)
        price_change_percentage = crypto.get("price_change_percentage_24h", 0.0)
        last_updated = crypto.get("last_updated", datetime.now().isoformat())

        existing_crypto = db.query(Cryptocurrency).filter(Cryptocurrency.name == crypto_id).first()

        if existing_crypto:
            existing_crypto.market_cap = market_cap
            existing_crypto.hourly_price = current_price
            existing_crypto.hourly_percentage = price_change_percentage
            existing_crypto.time_updated = datetime.fromisoformat(last_updated.replace("Z", ""))
        else:
            new_crypto = Cryptocurrency(
                name=crypto_id,
                market_cap=market_cap,
                hourly_price=current_price,
                hourly_percentage=price_change_percentage,
                time_updated=datetime.fromisoformat(last_updated.replace("Z", "")),
            )
            db.add(new_crypto)

    db.commit()


# Scheduler to update cryptocurrency data periodically
scheduler = BackgroundScheduler()


def scheduled_update():
    with SessionLocal() as db:
        data = fetch_coingecko_data()
        if data:
            update_cryptocurrency_data(db, data)


scheduler.add_job(scheduled_update, "interval", minutes=10)

@app.on_event("startup")
def startup_event():
    if not scheduler.running:
        scheduler.start()


@app.on_event("shutdown")
def shutdown_event():
    if scheduler.running:
        scheduler.shutdown()


# Pydantic schema for sending emails
class EmailRequest(BaseModel):
    email: EmailStr

# Phone call request model
class PhoneCallRequest(BaseModel):
    phone_number: str

EMAIL_CONFIG = {
    "SMTP_SERVER": "smtp.gmail.com",
    "SMTP_PORT": 587,
    "EMAIL_ADDRESS": os.getenv("EMAIL_USER"),
    "EMAIL_PASSWORD": os.getenv("EMAIL_PASSWORD")
}

def send_email(recipient_email: str):
    try:
        # Email content
        subject = "HodlUp - Crypto Price Alert"
        body = """
        Hi there,

        This is a test email to confirm that you have successfully subscribed to HodlUp Crypto Alerts.

        Stay tuned for real-time price alerts for your favorite cryptocurrencies!

        Best regards,
        HodlUp Team
        """

        # Create email message
        message = MIMEMultipart()
        message["From"] = EMAIL_ADDRESS
        message["To"] = recipient_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        # Connect to the SMTP server and send the email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, recipient_email, message.as_string())

        print(f"Email sent successfully to {recipient_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")


# Function to make a phone call using Twilio
def make_call(phone_number: str):
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        raise HTTPException(status_code=500, detail="Twilio credentials are missing.")

    # Initialize Twilio Client
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    try:
        call = client.calls.create(
            twiml="<Response><Say>Hello, this is HodlUp Team calling! Wake up! Your Bitcoin just hit the threshold you set—don’t snooze while your wallet cries! Check it now or regret later!</Say></Response>",
            to=phone_number,
            from_=TWILIO_PHONE_NUMBER,
        )
        return {"status": "success", "message": f"Call initiated successfully. Call SID: {call.sid}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


# Endpoint to send an email
@app.post("/send-email/")
def send_test_email(request: EmailRequest):
    send_email(request.email)
    return {"status": "success", "message": "Email sent successfully"}

# Endpoint to make a phone call
@app.post("/make-call/")
def trigger_phone_call(request: PhoneCallRequest):
    return make_call(request.phone_number)


# Endpoint to update cryptocurrencies
@app.post("/update-cryptocurrencies/")
def update_cryptocurrencies(db: Session = Depends(get_db)):
    data = fetch_coingecko_data()
    if not data:
        raise HTTPException(status_code=500, detail="Failed to fetch data from CoinGecko.")
    update_cryptocurrency_data(db, data)
    return {"status": "success", "message": "Cryptocurrencies updated successfully."}


# Endpoint to get all cryptocurrencies
@app.get("/cryptocurrencies/")
def get_all_cryptocurrencies(db: Session = Depends(get_db)):
    stmt = select(Cryptocurrency)
    cryptos = db.execute(stmt).scalars().all()

    return [
        {
            "id": crypto.crypto_id,
            "name": crypto.name,
            "market_cap": crypto.market_cap,
            "hourly_price": crypto.hourly_price,
            "hourly_percentage": crypto.hourly_percentage,
            "time_updated": crypto.time_updated.isoformat() if crypto.time_updated else None,
        }
        for crypto in cryptos
    ]

@app.post("/alerts/")
async def create_alert(alert_data: dict, db: Session = Depends(get_db)):
    print("Received alert data:", alert_data)
    # Parse alert data
    crypto_id = alert_data.get("crypto_id")
    threshold_price = alert_data.get("threshold_price")
    lower_threshold_price = alert_data.get("lower_threshold_price")
    notification_method = alert_data.get("notification_method")
    phone_number = alert_data.get("phoneNumber")
    email = alert_data.get("email")

    # Save the alert to the database
    new_alert = Alert(
        user_id=alert_data.get("user_id"),  # Ensure the `user_id` is provided
        crypto_id=crypto_id,
        threshold_price=threshold_price,
        lower_threshold_price=lower_threshold_price,
        method=alert_data.get("notification_type"),
        notification_method=notification_method,
        phone_number=phone_number,
        email=email
    )
    db.add(new_alert)
    db.commit()

    # Return success response
    return {"message": "Alert created successfully!"}

def check_alerts_and_notify():
    with SessionLocal() as db:
        current_prices = fetch_coingecko_data()
        if not current_prices:
            return
            
        price_map = {crypto["id"]: crypto["current_price"] for crypto in current_prices}
        
        alerts = db.query(Alert).all()
        for alert in alerts:
            crypto = db.query(Cryptocurrency).filter_by(crypto_id=alert.crypto_id).first()
            current_price = price_map.get(crypto.name)
            
            if current_price:
                if (alert.threshold_price and current_price >= alert.threshold_price) or \
                   (alert.lower_threshold_price and current_price <= alert.lower_threshold_price):
                    try:
                        if alert.notification_method == "Email":
                            send_email(
                                alert.email,
                                "Crypto Price Alert",
                                f"Your {crypto.name} alert threshold has been reached. Current price: ${current_price}"
                            )
                        elif alert.notification_method == "Phone Call":
                            make_call(alert.phone_number)
                        
                        db.delete(alert)
                        db.commit()
                    except Exception as e:
                        print(f"Failed to send notification: {e}")
                    
@app.get("/reddit-comments/")
def get_reddit_comments():
    try:
        # Fetch Reddit comments
        comments_data = fetch_reddit_comments(subreddit_name="cryptocurrency", limit_posts=5, limit_comments=5)
        return {"status": "success", "data": comments_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/test-reddit-scraper")
def test_reddit_scraper():
    data = fetch_reddit_comments(subreddit_name="cryptocurrency", limit_posts=3, limit_comments=3)
    return {"status": "success", "data": data}

@app.get("/reddit-comments-sentiment/")
def get_reddit_comments_with_sentiment():
    """
    API endpoint to fetch Reddit posts with sentiment analysis.
    """
    try:
        data = fetch_reddit_comments_with_sentiment(subreddit_name="cryptocurrency", limit_posts=3, limit_comments=3)
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# Schedule periodic alert checks
scheduler.add_job(check_alerts_and_notify, "interval", minutes=0.2)

