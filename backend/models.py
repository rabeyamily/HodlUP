from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    phone_number = Column(String(50), unique=True, index=True)
    alerts = relationship("Alert", back_populates="user")

class Cryptocurrency(Base):
    __tablename__ = 'cryptocurrencies'
    crypto_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    market_cap = Column(Float)
    hourly_price = Column(Float)
    hourly_percentage = Column(Float)
    time_updated = Column(DateTime, default=datetime.utcnow)
    alerts = relationship("Alert", back_populates="cryptocurrency")

class Alert(Base):
    __tablename__ = 'alerts'
    alert_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    crypto_id = Column(Integer, ForeignKey('cryptocurrencies.crypto_id'))
    threshold_price = Column(Float)
    lower_threshold_price = Column(Float)
    method = Column(String(50))
    notification_method = Column(String(50))
    email = Column(String(255))
    phone_number = Column(String(50))
    
    user = relationship("User", back_populates="alerts")
    cryptocurrency = relationship("Cryptocurrency", back_populates="alerts")