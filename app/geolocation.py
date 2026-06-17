"""Geolocation service using IP address"""
try:
    import geoip2.database
    GEOIP2_AVAILABLE = True
except ImportError:
    GEOIP2_AVAILABLE = False

import os
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)

class GeoLocationService:
    """Get country, region, city from IP address"""
    
    def __init__(self):
        # Using free GeoIP2 database (download from: https://geolite.maxmind.com/geoip/databases)
        # For now, using a simple IP-to-Country mapping as fallback
        self.db_path = os.getenv("GEOIP_DB_PATH", None)
        self.reader = None
        
        if GEOIP2_AVAILABLE and self.db_path and os.path.exists(self.db_path):
            try:
                self.reader = geoip2.database.Reader(self.db_path)
            except Exception as e:
                logger.warning(f"GeoIP database not available: {e}")
    
    def get_location(self, ip_address: str) -> Dict[str, Optional[str]]:
        """Get location data from IP address"""
        try:
            if not ip_address or ip_address in ["127.0.0.1", "localhost", "testclient"]:
                return {
                    "country": None,
                    "region": None,
                    "city": None,
                    "latitude": None,
                    "longitude": None
                }
            
            if self.reader:
                response = self.reader.city(ip_address)
                return {
                    "country": response.country.iso_code,
                    "region": response.subdivisions[0].name if response.subdivisions else None,
                    "city": response.city.name,
                    "latitude": str(response.location.latitude) if response.location.latitude else None,
                    "longitude": str(response.location.longitude) if response.location.longitude else None
                }
        except Exception as e:
            logger.debug(f"Geolocation lookup failed for {ip_address}: {e}")
        
        return {
            "country": None,
            "region": None,
            "city": None,
            "latitude": None,
            "longitude": None
        }

# Global instance
geo_service = GeoLocationService()

def get_location_from_ip(ip_address: str) -> Dict[str, Optional[str]]:
    """Convenience function to get location"""
    return geo_service.get_location(ip_address)
