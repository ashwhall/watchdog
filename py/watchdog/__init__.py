"""
Watchdog package for monitoring and keeping services alive.
"""

__version__ = "1.0.0"

# Import main components for easy access
from .run import main, wait_forever

__all__ = ["main", "wait_forever"]
