from typing import Optional, Dict
from .models import Branch, FAQEntry


def normalize(text: str) -> str:
    return text.lower()


def match_faq(message: str) -> Optional[Dict]:
    msg = normalize(message)

    
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
