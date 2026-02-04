from typing import Optional, Dict
from .models import Branch, FAQEntry
import requests

def normalize(text: str) -> str:
    return text.lower()


def match_faq(message: str) -> Optional[Dict]:
    msg = normalize(message)
    # 🌤️ VREMENSKA PROGNOZA
    if any(k in msg for k in ["stepeni", "temperatura", "vreme", "vrijeme"]):
        try:
            r = requests.get(
                "http://localhost:8000/api/weather/",
                timeout=5
            )
            r.raise_for_status()
            data = r.json()

            return {
                "intent": "weather_current",
                "reply": (
                f"Trenutno je {round(data['temperature'])}°C u {data['city']}, "
                f"osjeća se kao {round(data['feels_like'])}°C."
                        ),          
                "link": ""
            }
        except Exception:
            return {
                "intent": "weather_current",
                "reply": "Ne mogu trenutno da dohvatim vremensku prognozu.",
                "link": ""
            }
    
    if any(k in msg for k in ["radno vreme", "radno vrijeme", "kada rade", "radite", "radite li"]):
        return {
            "intent": "branches_hours",
            "reply": "Filijale rade radnim danima od 08:00 do 16:00.",
            "link": ""
        }

   
    if any(k in msg for k in ["filijale", "poslovnice", "gde se nalazite", "adresa"]):
        branches = Branch.objects.all().order_by("city", "name")
        if not branches:
            return {
                "intent": "branches_list",
                "reply": "Trenutno nema dostupnih filijala.",
                "link": ""
            }

        lines = [f"{b.city}, {b.address}" for b in branches[:5]]
        reply = "Naše filijale se nalaze na sledećim adresama: " + "; ".join(lines) + "."
        return {
            "intent": "branches_list",
            "reply": reply,
            "link": ""
        }

   
    if any(k in msg for k in ["dokument", "papiri", "šta mi treba", "sta mi treba"]):
        return {
            "intent": "docs_required",
            "reply": (
                "Potrebna dokumentacija zavisi od usluge. "
                "Za otvaranje računa obično je potrebna lična karta, "
                "a za kredite i dodatna finansijska dokumentacija."
            ),
            "link": ""
        }

 
    if any(k in msg for k in ["termin", "zakaz", "rezerv"]):
        return {
            "intent": "appointments_help",
            "reply": (
                "Termin se zakazuje izborom filijale po adresi, "
                "a zatim dostupnog slobodnog termina."
            ),
            "link": ""
        }

    return None
