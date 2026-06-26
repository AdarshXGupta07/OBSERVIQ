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
        try:
            response = requests.post(
                f"{self.base_url}/traces",
                headers=self.headers,
                json=trace_data,
                timeout=10
            )
            print(f"ObservIQ trace sent: {response.status_code}")
        except Exception as e:
            print(f"ObservIQ error: {e}")