from fastapi import APIRouter, Body
import requests
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

MASUMI_API = "https://payment.masumi.network/api/trust-score"
BEARER = os.getenv("MASUMI_TOKEN")

@router.post("/trust")
async def trust(data: dict = Body(...)):
    headers = {"Authorization": f"Bearer {BEARER}"}
    res = requests.post(MASUMI_API, json=data, headers=headers)
    return res.json()
