import requests
import logging

logger = logging.getLogger(__name__)

class TraceSender:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def send(self, trace_data: dict):
        self._send_trace(trace_data)

    def _send_trace(self, trace_data: dict):
        try:
            response = requests.post(
                f"{self.base_url}/traces",
                headers=self.headers,
                json=trace_data,
                timeout=10
            )
            if response.status_code != 200:
                logger.warning(f"ObservIQ: Trace send failed — {response.status_code}")
        except requests.exceptions.Timeout:
            logger.warning("ObservIQ: Request timeout")
        except requests.exceptions.ConnectionError:
            logger.warning("ObservIQ: Connection error")
        except Exception as e:
            logger.warning(f"ObservIQ: Unexpected error — {e}")