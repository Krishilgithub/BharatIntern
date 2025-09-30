import os
from supabase import create_client, Client
from typing import Any

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-supabase-url.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-anon-or-service-role-key")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_candidates() -> list:
    resp = supabase.table("candidates").select("*").execute()
    return resp.data or []

def get_candidate_by_id(candidate_id: str) -> Any:
    resp = supabase.table("candidates").select("*").eq("id", candidate_id).single().execute()
    return resp.data

def get_internships() -> list:
    resp = supabase.table("internships").select("*").execute()
    return resp.data or []

def get_internship_by_id(internship_id: str) -> Any:
    resp = supabase.table("internships").select("*").eq("id", internship_id).single().execute()
    return resp.data

def get_applications_by_candidate(candidate_id: str) -> list:
    resp = supabase.table("applications").select("*").eq("candidate_id", candidate_id).execute()
    return resp.data or []

def get_applications_by_internship(internship_id: str) -> list:
    resp = supabase.table("applications").select("*").eq("internship_id", internship_id).execute()
    return resp.data or []

def insert_application(application: dict) -> Any:
    resp = supabase.table("applications").insert(application).execute()
    return resp.data

def update_application_status(app_id: str, status: str) -> Any:
    resp = supabase.table("applications").update({"status": status}).eq("id", app_id).execute()
    return resp.data
