import os
import json
import re
from typing import Any, Dict
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
Ti si bankarski chatbot za Srbiju.
Odgovori ISKLJUČIVO validnim JSON-om (bez dodatnog teksta, bez markdown-a).

Schema:
{
  "intent": "greeting|branches_hours|branches_list|appointments_help|appointments_slots|fx_rate|docs_required|faq|unknown",
  "reply": "kratak i koristan odgovor na srpskom",
  "link": "opciono, ili prazno"
}

Pravila:
- reply max ~2-4 rečenice, jasno i profesionalno
- Nikad ne izmišljaj tarife/kurseve ako nisu u kontekstu; ako nema info → intent=unknown i uputi na kontakt
- link neka bude "" ako nema
- JSON mora da se parsira sa json.loads bez greške
""".strip()


def groq_client() -> OpenAI:
    key = os.getenv("GROQ_API_KEY")
    if not key:
        raise RuntimeError("Nedostaje GROQ_API_KEY env var.")
    base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
    return OpenAI(api_key=key, base_url=base_url)


def _extract_first_json_object(text: str) -> str:
    """
    Ako model vrati tekst + JSON, probaj da izvučeš prvi JSON objekat.
    Radi i kad ima leading/trailing teksta.
    """
    # Najčešće: JSON je u jednom komadu. Pokušaj najbrže:
    text = text.strip()
    if text.startswith("{") and text.endswith("}"):
        return text

    # Fallback: nađi prvi {...} blok (greedy, ali radi za jedan objekt)
    m = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if m:
        return m.group(0).strip()

    return ""


def _normalize_output(data: Dict[str, Any]) -> Dict[str, str]:
    intent = str(data.get("intent") or "unknown")
    reply = str(data.get("reply") or "").strip()
    link = str(data.get("link") or "").strip()

    allowed = {
        "greeting", "branches_hours", "branches_list", "appointments_help",
        "appointments_slots", "fx_rate", "docs_required", "faq", "unknown"
    }
    if intent not in allowed:
        intent = "unknown"

    if not reply:
        reply = "Ne mogu pouzdano da odgovorim na to. Molim vas kontaktirajte banku."

    return {"intent": intent, "reply": reply, "link": link}


def groq_chat_json(user_message: str, context: str = "") -> Dict[str, str]:
    client = groq_client()
    model = os.getenv("GROQ_MODEL", "llama3-8b-8192")

    # Bolje: context kao "knowledge" blok u user poruci (manje konflikta sa system pravilima)
    user_content = user_message.strip()
    if context.strip():
        user_content = (
            "KONTEKST (pouzdan, koristi ga kao izvor istine):\n"
            f"{context.strip()}\n\n"
            "PITANJE KORISNIKA:\n"
            f"{user_message.strip()}"
        )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    # Neki OpenAI-compatible serveri podržavaju response_format za JSON.
    # Ako Groq to podržava za tvoj model/account, ovo značajno stabilizuje izlaz.
    # Ako ne podržava, samo izbaci ovaj parametar.
    try:
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
            max_tokens=300,
            # response_format={"type": "json_object"},  # <- uključi ako radi kod tebe
        )
    except TypeError:
        # Ako wrapper ne prihvata response_format ili max_tokens
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
        )

    content = (resp.choices[0].message.content or "").strip()

    # 1) Probaj direktno
    try:
        return _normalize_output(json.loads(content))
    except Exception:
        pass

    # 2) Probaj da izvučeš JSON iz teksta
    json_blob = _extract_first_json_object(content)
    if json_blob:
        try:
            return _normalize_output(json.loads(json_blob))
        except Exception:
            pass

    # 3) Fallback
    return {
        "intent": "unknown",
        "reply": content or "Nisam uspeo da generišem odgovor.",
        "link": ""
    }
