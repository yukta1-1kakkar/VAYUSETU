from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.db import Base

def utc_now():
    return datetime.now(timezone.utc)

class RouteWeight(Base):
    """
    DGCA Route Passenger Traffic Weights Table.
    Stores normalized passenger traffic weights calculated from DGCA domestic city-pair reports.
    Formula: Weight(r) = Passengers(r) / Sum(Passengers over all routes)
    """
    __tablename__ = "route_weights"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    route_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., 'DEL-BOM'
    origin = Column(String(50), index=True, nullable=False)                 # e.g., 'DEL' or 'DELHI'
    destination = Column(String(50), index=True, nullable=False)            # e.g., 'BOM' or 'MUMBAI'
    total_passengers = Column(Float, nullable=False, default=0.0)
    weight = Column(Float, nullable=False, default=0.0)                    # Normalized weight (sum over all routes = 1.0)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    fare_observations = relationship("FareObservation", back_populates="route", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<RouteWeight(route_id='{self.route_id}', weight={self.weight:.6f}, passengers={self.total_passengers})>"


class FareObservation(Base):
    """
    Real-time Airfare Observation Table.
    Stores scraped / ingested airline fare data across routes, airlines, and advance purchase windows.
    """
    __tablename__ = "fare_observations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    route_id = Column(String(50), ForeignKey("route_weights.route_id"), index=True, nullable=False)
    airline = Column(String(50), index=True, nullable=False)                # e.g., 'IndiGo', 'Air India'
    travel_date = Column(Date, nullable=False, index=True)
    observation_date = Column(Date, nullable=False, index=True)
    advance_purchase_days = Column(Integer, nullable=False, index=True)     # e.g., 1, 7, 15, 30
    fare = Column(Float, nullable=False)                                    # Total fare in INR
    base_fare = Column(Float, nullable=True)
    taxes = Column(Float, nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    source = Column(String(50), default="scraper", nullable=False)          # e.g., 'makemytrip', 'indigo', 'mock'
    created_at = Column(DateTime, default=utc_now, nullable=False)

    route = relationship("RouteWeight", back_populates="fare_observations")

    __table_args__ = (
        Index("idx_route_obs_adv", "route_id", "observation_date", "advance_purchase_days"),
        Index("idx_route_airline_dates", "route_id", "airline", "travel_date", "observation_date", "advance_purchase_days"),
    )

    def __repr__(self):
        return f"<FareObservation(route='{self.route_id}', airline='{self.airline}', fare={self.fare}, obs_date='{self.observation_date}')>"


class CPIReference(Base):
    """
    Consumer Price Index (CPI) Reference Data Table.
    Stores official CPI reference indices for transport/airfare inflation comparison.
    """
    __tablename__ = "cpi_reference"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    month = Column(String(20), unique=True, index=True, nullable=False)     # e.g., '2026-01' or 'JAN 2026'
    combined_index = Column(Float, nullable=False)                          # All-India CPI Combined Index
    inflation_pct = Column(Float, nullable=True)                            # YoY / MoM inflation percentage

    def __repr__(self):
        return f"<CPIReference(month='{self.month}', combined_index={self.combined_index})>"
