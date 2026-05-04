"""QR Code generation for shortened URLs

This module handles creating QR codes for URL Shortener shortened links.
QR codes are generated on-the-fly (not cached) to ensure they're always current.
"""

import io
from qrcode import QRCode, constants
from qrcode.image.pure import PymagingImage


# ============================================================================
# QR Code Configuration
# ============================================================================

# QR code error correction level
# L = ~7% recovery, M = ~15% recovery, H = ~30% recovery
ERROR_CORRECTION_LEVEL = constants.ERROR_CORRECT_H

# QR code version (None = auto-detect based on data size)
QR_VERSION = None

# QR code box size (pixels per box)
BOX_SIZE = 10

# QR code border (quiet zone in boxes)
BORDER = 2


# ============================================================================
# QR Code Generation
# ============================================================================

def generate_qrcode_png(short_url: str) -> bytes:
    """
    Generate QR code as PNG binary data.
    
    Args:
        short_url: Full shortened URL (e.g., "https://yourapp.com/abc123")
                   This is the data encoded in the QR code
    
    Returns:
        bytes: PNG image binary data ready to send as HTTP response
        
    Raises:
        ValueError: If URL is invalid or too long for QR code
        Exception: If PNG generation fails
    """
    try:
        # Create QR code instance
        qr = QRCode(
            version=QR_VERSION,  # Auto-detect size
            error_correction=ERROR_CORRECTION_LEVEL,
            box_size=BOX_SIZE,
            border=BORDER,
        )
        
        # Add data to QR code
        qr.add_data(short_url)
        qr.make(fit=True)
        
        # Create PIL Image object
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to PNG bytes
        png_bytes = io.BytesIO()
        img.save(png_bytes, format="PNG")
        png_bytes.seek(0)
        
        return png_bytes.getvalue()
        
    except Exception as e:
        raise Exception(f"Failed to generate QR code: {str(e)}")


def get_qrcode_size_estimate(short_url: str) -> dict:
    """
    Estimate QR code size and complexity.
    Useful for debugging or monitoring.
    
    Args:
        short_url: The URL to encode
        
    Returns:
        dict: Information about QR code size
    """
    try:
        qr = QRCode(
            version=QR_VERSION,
            error_correction=ERROR_CORRECTION_LEVEL,
            box_size=BOX_SIZE,
            border=BORDER,
        )
        
        qr.add_data(short_url)
        qr.make(fit=True)
        
        return {
            "url_length": len(short_url),
            "qr_version": qr.version,
            "qr_box_count": qr.modules_count,
            "pixel_size": qr.modules_count * BOX_SIZE,
            "error_correction": "HIGH (30%)",
        }
    except Exception as e:
        return {"error": str(e)}


# ============================================================================
# Constants for QR Code Sizing
# ============================================================================

"""
QR CODE SIZE REFERENCE:

Version 1: 21x21 modules (smallest)
Version 5: 37x37 modules
Version 10: 57x57 modules
Version 40: 177x177 modules (largest)

With BOX_SIZE=10:
- Version 1: 210x210 pixels (2.1 KB PNG)
- Version 5: 370x370 pixels (4-5 KB PNG)
- Version 10: 570x570 pixels (8-10 KB PNG)

Shortened URLs are usually short, so QR codes stay small (v1-v5).
"""
