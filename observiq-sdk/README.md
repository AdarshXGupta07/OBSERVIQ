# ObservIQ SDK

> **PostHog for AI agents.** Monitor every LLM call in production — automatically.

[![PyPI version](https://badge.fury.io/py/observiq-sdk.svg)](https://badge.fury.io/py/observiq-sdk)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## What is ObservIQ?

ObservIQ is a production-grade AI observability platform. Add **2 lines of code** to any AI application and instantly get:

- ✅ Real-time trace monitoring — every LLM call recorded
- ✅ Cost tracking — per feature, per user, per model
- ✅ Latency analytics — p50, p95, p99 breakdowns
- ✅ AI-powered anomaly detection — Groq detects issues automatically
- ✅ Multi-tenant — isolate data per team with API keys

## Installation

```bash
pip install observiq-sdk
```

## Quick Start

```python
from groq import Groq
from observiq_sdk import ObservIQ

# Setup
groq_client = Groq(api_key="your-groq-key")
oiq = ObservIQ(
    api_key="oiq_your_key_here",
    base_url="https://api.observiq.io"  # or http://localhost:8000
)

# Wrap your AI function — that's it!
response = oiq.trace(groq_client.chat.completions.create)(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)
# Trace automatically saved to ObservIQ dashboard ✅
```

## Supported Providers

| Provider | Status |
|----------|--------|
| Groq | ✅ Supported |
| OpenAI | ✅ Supported |
| Anthropic | ✅ Supported |
| Any OpenAI-compatible API | ✅ Supported |

## Features

### Automatic Capture
ObservIQ automatically captures:
- Model name
- Input prompt (first 1000 chars)
- Output response (first 1000 chars)
- Latency (ms)
- Token usage (prompt + completion)
- Cost (USD) — calculated per model pricing
- Status (success/error)
- Error messages

### Feature Tracking
```python
response = oiq.trace(
    groq_client.chat.completions.create,
    feature_name="customer_support",   # track by feature
    user_identifier="user_123"         # track by user
)(model="llama-3.3-70b-versatile", messages=[...])
```

### Error Tracking
Errors are automatically captured — no extra code needed:
```python
try:
    response = oiq.trace(groq_client.chat.completions.create)(...)
except Exception as e:
    # ObservIQ already logged this error trace
    raise
```

### Disable in Tests
```python
oiq = ObservIQ(
    api_key="oiq_xxx",
    enabled=False  # No traces sent in test environment
)
```

## Dashboard

View all your traces at [observiq.io](https://observiq.io)

## License

MIT © 2026 ObservIQ