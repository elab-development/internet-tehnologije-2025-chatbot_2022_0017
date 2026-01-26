import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
Ti si bankarski chatbot. Vrati ISKLJUČIVO validan JSON:
{
  "intent": "greeting|branches_hours|branches_list|appointments_help|appointments_slots|fx_rate|docs_required|faq|unknown",
  "reply": "kratak i koristan odgovor",
  "link": "opciono"
}
"""

def groq_client() -> OpenAI:
    key = os.getenv("GROQ_API_KEY")
    if not key:
        raise RuntimeError("Nedostaje GROQ_API_KEY env var.")

    base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

    return OpenAI(
        api_key=key,
        base_url=base_url
    )

def groq_chat_json(user_message: str, context: str = "") -> dict:
    client = groq_client()
    model = os.getenv("GROQ_MODEL", "llama3-8b-8192")

    messages = [{"role": "system", "content": SYSTEM_PROMPT.strip()}]
    if context:
        messages.append({"role": "system", "content": context})
    messages.append({"role": "user", "content": user_message})

    resp = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.2,
    )

    content = (resp.choices[0].message.content or "").strip()

    try:
        data = json.loads(content)
        data["link"] = data.get("link") or ""
        return data
    except Exception:
        return {
            "intent": "unknown",
            "reply": content or "Nisam uspeo da generišem odgovor."
        }
