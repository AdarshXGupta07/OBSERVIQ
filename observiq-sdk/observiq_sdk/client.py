import time
import functools
from typing import Optional
from observiq_sdk.sender import TraceSender


class ObservIQ:
    """
    ObservIQ SDK — 2 lines mein AI monitoring.

    Usage:
        from observiq_sdk import ObservIQ
        oiq = ObservIQ(api_key="oiq_...")

        # Groq wrap karo
        response = oiq.trace(groq.chat.completions.create)(
            model="llama-3.3-70b",
            messages=[...]
        )
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "http://localhost:8000",
        enabled: bool = True
    ):
        """
        api_key  → ObservIQ ka API key (oiq_...)
        base_url → ObservIQ server ka URL
                   Development: http://localhost:8000
                   Production:  https://api.observiq.com
        enabled  → False karo toh SDK kuch nahi karega
                   Testing ke time useful
        """
        self.api_key = api_key
        self.base_url = base_url
        self.enabled = enabled
        self.sender = TraceSender(api_key, base_url)

    def trace(
        self,
        func,
        feature_name: Optional[str] = None,
        user_identifier: Optional[str] = None
    ):
        """
        Kisi bhi AI function ko wrap karo.

        Yeh ek 'decorator factory' hai:
        - func ko wrap karta hai
        - Call hone pe timer start karta hai
        - Response se data nikalta hai
        - Background mein bhejta hai
        - Original response return karta hai
        """

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # SDK disabled hai toh seedha call karo
            if not self.enabled:
                return func(*args, **kwargs)

            # Timer start
            start_time = time.time()
            error_msg = None
            response = None
            status = "success"

            try:
                # Actual AI call karo
                response = func(*args, **kwargs)

            except Exception as e:
                # AI call fail hui — error record karo
                status = "error"
                error_msg = str(e)
                raise  # Error ko aage bhi jaane do

            finally:
                # Timer stop — chahe success ho ya error
                latency_ms = int((time.time() - start_time) * 1000)

                # Data extract karo response se
                trace_data = self._extract_trace_data(
                    kwargs=kwargs,
                    response=response,
                    latency_ms=latency_ms,
                    status=status,
                    error_msg=error_msg,
                    feature_name=feature_name,
                    user_identifier=user_identifier
                )

                # Background mein bhejo
                self.sender.send(trace_data)

            return response

        return wrapper

    def _extract_trace_data(
        self,
        kwargs: dict,
        response,
        latency_ms: int,
        status: str,
        error_msg: Optional[str],
        feature_name: Optional[str],
        user_identifier: Optional[str]
    ) -> dict:
        """
        Response object se useful data nikalo.
        Groq aur OpenAI ka format same hai isliye ek function kaam karta hai.
        """

        # Model kaunsa use hua
        model = kwargs.get("model", "unknown")

        # Input — messages se pehla user message nikalo
        messages = kwargs.get("messages", [])
        input_text = None
        for msg in messages:
            if msg.get("role") == "user":
                content = msg.get("content", "")
                # Sirf pehle 1000 chars — zyada store karna expensive
                input_text = content[:1000] if content else None
                break

        # Output, tokens — response se nikalo
        output_text = None
        prompt_tokens = 0
        completion_tokens = 0
        cost_usd = 0.0

        if response is not None:
            try:
                # Groq/OpenAI response format
                if hasattr(response, "choices") and response.choices:
                    output_text = response.choices[0].message.content
                    if output_text:
                        output_text = output_text[:1000]

                # Token usage
                if hasattr(response, "usage") and response.usage:
                    prompt_tokens = response.usage.prompt_tokens or 0
                    completion_tokens = response.usage.completion_tokens or 0

                    # Cost calculate karo
                    # Groq llama pricing (approximate)
                    cost_usd = self._calculate_cost(
                        model, prompt_tokens, completion_tokens
                    )

            except Exception:
                pass  # Data extract na ho toh bhi trace save ho

        return {
            "model": model,
            "input": input_text,
            "output": output_text,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "latency_ms": latency_ms,
            "cost_usd": cost_usd,
            "status": status,
            "error_message": error_msg,
            "feature_name": feature_name,
            "user_identifier": user_identifier,
        }

    def _calculate_cost(
        self,
        model: str,
        prompt_tokens: int,
        completion_tokens: int
    ) -> float:
        """
        Token count se cost calculate karo.
        Pricing per million tokens mein hoti hai.
        """

        # Groq pricing (per million tokens)
        pricing = {
            "llama-3.3-70b-versatile": {"input": 0.59, "output": 0.79},
            "llama-3.1-8b-instant":    {"input": 0.05, "output": 0.08},
            "mixtral-8x7b-32768":      {"input": 0.24, "output": 0.24},
            "gemma2-9b-it":            {"input": 0.20, "output": 0.20},
        }

        # Model pricing dhundho — nahi mila toh default
        model_pricing = pricing.get(model, {"input": 0.50, "output": 0.50})

        # Cost = (tokens / 1,000,000) * price_per_million
        input_cost = (prompt_tokens / 1_000_000) * model_pricing["input"]
        output_cost = (completion_tokens / 1_000_000) * model_pricing["output"]

        return round(input_cost + output_cost, 6)