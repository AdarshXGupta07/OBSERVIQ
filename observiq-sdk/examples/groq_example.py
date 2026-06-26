import os
from dotenv import load_dotenv
from groq import Groq
from observiq_sdk import ObservIQ

load_dotenv(r"D:\MAIN_PROJECTS\OBSERVIQ\observiq-backend\.env")

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

oiq = ObservIQ(
    api_key="oiq_264f4d9a57ebaa8de847fd7a1fc0cea13c8717fbca9e0222f5fc9deca937770f",
    base_url="http://localhost:8000"
)

traced_create = oiq.trace(
    groq_client.chat.completions.create,
    feature_name="medical_advice",
    user_identifier="patient_001"
)

print("Groq call kar raha hoon...")

response = traced_create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "user", "content": "Bukhaar mein kya karun? Short answer do."}
    ],
    max_tokens=100
)

print(f"AI Answer: {response.choices[0].message.content}")
print(f"Trace automatically ObservIQ mein save ho gayi!")