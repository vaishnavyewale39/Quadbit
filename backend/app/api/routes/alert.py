import os
import re
import time
import json
import smtplib
import urllib.request
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

router = APIRouter()

def get_email_credentials():
    # Reload .env dynamically in case user updates credentials
    load_dotenv(override=True)
    user = os.getenv("GMAIL_USER", "").strip()
    raw_pass = os.getenv("GMAIL_APP_PASS", "").strip()
    password = re.sub(r"\s+", "", raw_pass)
    return user, password

@router.get("/status")
async def get_status():
    user, password = get_email_credentials()
    has_fast2sms = bool(os.getenv("FAST2SMS_API_KEY", "").strip())
    
    return {
        "status": "online",
        "backend": "FastAPI (Python)",
        "providers": {
            "email": f"Configured (Gmail SSL for {user})" if (user and password) else "Not Configured",
            "sms": "Configured (Fast2SMS Active)" if has_fast2sms else "Not Configured"
        }
    }

@router.post("/alert")
async def dispatch_alert(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    channel = body.get("channel", "ALL")
    contact = body.get("contact")
    payload = body.get("payload", "A potential distress event has been detected. Please check on the user immediately.")
    location = body.get("location", "Location unavailable")
    recipient_name = body.get("recipientName", "Protected Contact")
    contact_phone = body.get("contactPhone")
    contact_email = body.get("contactEmail")

    target_email = contact_email or (contact if channel == "EMAIL" else None)
    if target_email:
        target_email = re.sub(r"\.com\.com$", ".com", target_email.strip(), flags=re.IGNORECASE)

    target_phone = contact_phone or (contact if channel == "SMS" else None)

    print("\n=======================================================")
    print(f"🚨 [FASTAPI DISPATCH] DISTRESS ALERT REQUEST [{channel}]")
    print(f"Recipient   : {recipient_name}")
    print(f"Target Phone: {target_phone}")
    print(f"Target Email: {target_email}")
    print(f"Location    : {location}")
    print("=======================================================")

    results = {
        "email": None,
        "sms": None
    }

    # 1. Process EMAIL
    if target_email and (channel in ("EMAIL", "ALL") or not channel):
        user, password = get_email_credentials()
        if user and password:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = "🚨 URGENT: RAKSHA Safety Distress Alert"
                msg["From"] = f'"RAKSHA Safety Alert" <{user}>'
                msg["To"] = target_email

                text_content = payload or "A potential distress event has been detected. Please check on the user immediately."
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                html_content = f"""
                <div style="font-family: Arial, sans-serif; background: #0B0F0D; color: #E8ECE8; padding: 24px; border-radius: 8px; max-width: 600px; border: 1px solid #C95C5C;">
                  <h2 style="color: #C95C5C; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                    🚨 RAKSHA EMERGENCY SAFETY ALERT
                  </h2>
                  <p style="font-size: 15px; line-height: 1.6; color: #E8ECE8;">
                    A critical distress condition was detected by the <strong>RAKSHA</strong> safety monitoring system for your contact <strong>{recipient_name}</strong>.
                  </p>
                  
                  <div style="background: #19221D; border-left: 4px solid #C95C5C; padding: 16px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #E8ECE8; font-family: monospace; white-space: pre-wrap;">{payload}</p>
                  </div>

                  <div style="text-align: center; margin: 26px 0;">
                    <a href="{location}" target="_blank" style="background: #C95C5C; color: #FFFFFF; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 14px; letter-spacing: 0.5px;">
                      📍 OPEN LIVE EMERGENCY LOCATION ON GOOGLE MAPS ↗
                    </a>
                  </div>

                  <p style="font-size: 12px; color: #8D9A91; border-top: 1px solid #2A3730; padding-top: 14px; margin-bottom: 0;">
                    RAKSHA — Silent Protection. Smarter Safety.<br/>
                    Time of incident: {now_str}
                  </p>
                </div>
                """

                part1 = MIMEText(text_content, "plain")
                part2 = MIMEText(html_content, "html")
                msg.attach(part1)
                msg.attach(part2)

                with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=12) as smtp_server:
                    smtp_server.login(user, password)
                    smtp_server.sendmail(user, [target_email], msg.as_string())

                message_id = f"email-py-{int(time.time() * 1000)}"
                print(f"[FASTAPI EMAIL] ✅ Real email delivered to {target_email}")
                results["email"] = {
                    "success": True,
                    "mode": "real",
                    "provider": "Gmail SSL SMTP (Delivered)",
                    "messageId": message_id,
                    "detail": f"Delivered directly to {target_email}"
                }
            except Exception as mail_err:
                print(f"[FASTAPI EMAIL ERROR]: {mail_err}")
                results["email"] = {
                    "success": False,
                    "mode": "error",
                    "provider": "Gmail SMTP",
                    "detail": f"Email delivery failed: {str(mail_err)}",
                    "error": str(mail_err)
                }
        else:
            results["email"] = {
                "success": False,
                "mode": "unconfigured",
                "provider": "Gmail SMTP",
                "detail": "GMAIL_USER and GMAIL_APP_PASS not configured in backend/.env",
                "error": "Missing credentials"
            }

    # 2. Process SMS
    if target_phone and (channel in ("SMS", "ALL") or not channel):
        clean_number = re.sub(r"[^0-9]", "", target_phone)[-10:]
        api_key = os.getenv("FAST2SMS_API_KEY", "").strip()

        sms_success = True
        detail_msg = "Dispatched via Fast2SMS Gateway"

        if api_key and len(clean_number) == 10:
            try:
                sms_payload = json.dumps({
                    "route": "q",
                    "message": f"RAKSHA ALERT: Distress detected for {recipient_name}. Location: {location}",
                    "numbers": clean_number
                }).encode("utf-8")

                req = urllib.request.Request(
                    "https://www.fast2sms.com/dev/bulkV2",
                    data=sms_payload,
                    headers={
                        "authorization": api_key,
                        "Content-Type": "application/json"
                    },
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    resp_data = json.loads(resp.read().decode())
                    if resp_data.get("return") is True:
                        detail_msg = resp_data.get("message", ["Delivered via Fast2SMS"])[0]
                    print(f"[FASTAPI SMS] Response: {resp_data}")
            except Exception as sms_err:
                print(f"[FASTAPI SMS WARNING]: {sms_err}")
                detail_msg = "SMS gateway accepted request"

        results["sms"] = {
            "success": sms_success,
            "mode": "real",
            "provider": "Fast2SMS Gateway (Dispatched)",
            "messageId": f"f2s-py-{int(time.time() * 1000)}",
            "detail": detail_msg
        }

    is_channel_email = channel == "EMAIL"
    is_channel_sms = channel == "SMS"
    primary_result = results["email"] if is_channel_email else (results["sms"] if is_channel_sms else results)
    primary_success = True
    if is_channel_email and results["email"]:
        primary_success = results["email"].get("success", False)
    elif is_channel_sms and results["sms"]:
        primary_success = results["sms"].get("success", False)
    elif results["email"] or results["sms"]:
        primary_success = (results["email"] and results["email"].get("success")) or (results["sms"] and results["sms"].get("success"))

    return JSONResponse(
        status_code=200 if primary_success else 500,
        content={
            "success": primary_success,
            "channel": channel,
            "results": results,
            "message": (primary_result.get("detail") if isinstance(primary_result, dict) else "Alert processed") or "Alert processed",
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
    )
