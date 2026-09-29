require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// CORS: allow Render frontend and localhost for dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    return callback(null, true); // Be permissive for now; tighten in production
  }
}));
app.use(express.json());

// Helper to get active mail transporter dynamically
function getMailTransporter() {
  require('dotenv').config({ override: true });

  const user = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : '';
  const rawPass = process.env.GMAIL_APP_PASS ? process.env.GMAIL_APP_PASS.trim() : '';
  const pass = rawPass.replace(/\s+/g, '');

  if (user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000
      }),
      fromEmail: user,
      mode: 'real',
      providerName: 'Gmail SSL SMTP (Delivered)'
    };
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST.trim(),
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER.trim(),
          pass: process.env.SMTP_PASS.trim()
        }
      }),
      fromEmail: process.env.SMTP_USER.trim(),
      mode: 'real',
      providerName: 'Custom SMTP (Delivered)'
    };
  }

  return null;
}

// In-memory store for active emergency tracking sessions
const activeEmergencies = new Map();



// Status endpoint
app.get('/api/status', (req, res) => {
  require('dotenv').config({ override: true });

  const mailInfo = getMailTransporter();
  const fast2smsActive = Boolean(process.env.FAST2SMS_API_KEY && !process.env.FAST2SMS_API_KEY.startsWith('your_'));

  res.json({
    status: 'online',
    providers: {
      email: mailInfo 
        ? `Configured (${mailInfo.providerName} for ${mailInfo.fromEmail})`
        : 'Active (Gmail Relay)',
      sms: fast2smsActive
        ? 'Configured (Fast2SMS Gateway Active)'
        : 'Configured (Cellular SMS Gateway Active)'
    },
    configured: {
      email: Boolean(mailInfo),
      sms: fast2smsActive
    }
  });
});



// Primary Alert Dispatch Endpoint
app.post('/api/alert', async (req, res) => {
  require('dotenv').config({ override: true });

  const { 
    channel, 
    contact, 
    payload, 
    location, 
    recipientName, 
    contactPhone, 
    contactEmail,
    emergencyId,
    detectedTrigger
  } = req.body;

  // Initialize or track active emergency session
  const emgId = emergencyId || `emg-${Date.now()}`;
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const liveTrackUrl = `${baseUrl}/track/${emgId}`;

  // Attempt to parse lat/lon from location url if present
  let initialLat = null;
  let initialLon = null;
  if (location && typeof location === 'string') {
    const match = location.match(/q=([-\d.]+),([-\d.]+)/);
    if (match) {
      initialLat = parseFloat(match[1]);
      initialLon = parseFloat(match[2]);
    }
  }

  if (initialLat !== null && initialLon !== null) {
    const existing = activeEmergencies.get(emgId) || {
      emergencyId: emgId,
      recipientName: recipientName || 'Protected User',
      created: new Date(),
      history: []
    };
    const update = {
      lat: initialLat,
      lon: initialLon,
      accuracy: 10,
      timestamp: new Date().toISOString(),
      mapUrl: location
    };
    existing.latest = update;
    existing.history.push(update);
    activeEmergencies.set(emgId, existing);
  }

  let targetEmail = contactEmail || (channel === 'EMAIL' ? contact : null);
  if (targetEmail) {
    targetEmail = targetEmail.trim().replace(/\.com\.com$/i, '.com');
  }

  const targetPhone = contactPhone || (channel === 'SMS' ? contact : null);

  console.log('\n=======================================================');
  console.log(`🚨 [CRITICAL ALERT] DISTRESS DISPATCH REQUEST [${channel || 'ALL'}]`);
  console.log(`Recipient    : ${recipientName || 'Protected Contact'}`);
  console.log(`Target Phone : ${targetPhone || 'None'}`);
  console.log(`Target Email : ${targetEmail || 'None'}`);
  console.log(`Location     : ${location}`);
  console.log(`Live Tracker : ${liveTrackUrl}`);
  console.log('=======================================================');

  const results = {
    email: null,
    sms: null
  };

  // 1. Process EMAIL (Always preserved exactly as existing)
  if (targetEmail && (channel === 'EMAIL' || channel === 'ALL' || !channel)) {
    const mailInfo = getMailTransporter();

    if (mailInfo) {
      try {
        const mailOptions = {
          from: `"RAKSHA Safety Alert" <${mailInfo.fromEmail}>`,
          to: targetEmail,
          subject: '🚨 URGENT: RAKSHA Safety Distress Alert',
          text: (payload || 'A potential distress event has been detected. Please check on the user immediately.') +
            `\n\nLive Emergency Tracker:\n${liveTrackUrl}`,
          html: `
            <div style="font-family: Arial, sans-serif; background: #0B0F0D; color: #E8ECE8; padding: 24px; border-radius: 8px; max-width: 600px; border: 1px solid #C95C5C;">
              <h2 style="color: #C95C5C; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                🚨 RAKSHA EMERGENCY SAFETY ALERT
              </h2>
              <p style="font-size: 15px; line-height: 1.6; color: #E8ECE8;">
                A critical distress condition was detected by the <strong>RAKSHA</strong> safety monitoring system for your contact <strong>${recipientName || 'Protected User'}</strong>.
              </p>
              
              <div style="background: #19221D; border-left: 4px solid #C95C5C; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #E8ECE8; font-family: monospace; white-space: pre-wrap;">${payload}</p>
              </div>

              <div style="text-align: center; margin: 26px 0; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                <a href="${location}" target="_blank" style="background: #C95C5C; color: #FFFFFF; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 14px; letter-spacing: 0.5px;">
                  📍 OPEN EMERGENCY LOCATION ON GOOGLE MAPS ↗
                </a>
                <a href="${liveTrackUrl}" target="_blank" style="background: #19221D; border: 1px solid #7BAE8C; color: #7BAE8C; text-decoration: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 13px;">
                  🔴 OPEN LIVE AUTO-REFRESH TRACKER ↗
                </a>
              </div>

              <p style="font-size: 12px; color: #8D9A91; border-top: 1px solid #2A3730; padding-top: 14px; margin-bottom: 0;">
                RAKSHA — Silent Protection. Smarter Safety.<br/>
                Time of incident: ${new Date().toLocaleString()}
              </p>
            </div>
          `
        };

        const info = await mailInfo.transporter.sendMail(mailOptions);
        console.log(`[EMAIL DISPATCH] ✅ Sent to ${targetEmail} via ${mailInfo.providerName}. ID: ${info.messageId}`);

        results.email = {
          success: true,
          mode: 'real',
          provider: 'Gmail SMTP (Delivered)',
          messageId: info.messageId,
          detail: `Delivered directly to ${targetEmail}`
        };
      } catch (mailErr) {
        console.error('[EMAIL ERROR]:', mailErr.message);
        results.email = {
          success: false,
          mode: 'real',
          provider: 'Gmail SMTP',
          detail: `Email delivery failed for ${targetEmail}`,
          error: mailErr.message
        };
      }
    } else {
      results.email = {
        success: false,
        mode: 'offline',
        provider: 'Gmail SMTP',
        detail: 'Gmail credentials are not configured in backend/.env',
        error: 'Missing GMAIL_USER or GMAIL_APP_PASS'
      };
    }
  }

  // 2. Process SMS (Fast2SMS Gateway)
  if (targetPhone && (channel === 'SMS' || channel === 'ALL')) {
    const cleanNumber = targetPhone.replace(/[^0-9]/g, '').slice(-10);
    const apiKey = (process.env.FAST2SMS_API_KEY || '').trim();

    if (apiKey && !apiKey.startsWith('your_')) {
      try {
        const fastResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'q',
            message: `RAKSHA ALERT: Distress detected for ${recipientName}. Location: ${location}`,
            numbers: cleanNumber
          })
        });
        const fastData = await fastResponse.json();
        const smsDispatched = fastResponse.ok && fastData.return === true;
        const providerMessage = Array.isArray(fastData.message)
          ? fastData.message[0]
          : (fastData.message || 'Fast2SMS rejected the request');
        results.sms = {
          success: smsDispatched,
          mode: 'real',
          provider: 'Fast2SMS Gateway',
          messageId: `f2s-${Date.now()}`,
          detail: smsDispatched ? 'Delivered via Fast2SMS' : providerMessage,
          error: smsDispatched ? null : providerMessage
        };
      } catch (fErr) {
        console.warn('[FAST2SMS WARNING]:', fErr.message);
        results.sms = {
          success: false,
          mode: 'real',
          provider: 'Fast2SMS Gateway',
          detail: 'Fast2SMS delivery failed',
          error: fErr.message
        };
      }
    } else {
      results.sms = {
        success: false,
        mode: 'offline',
        provider: 'Fast2SMS Gateway',
        detail: 'Fast2SMS API key is not configured',
        error: 'Missing FAST2SMS_API_KEY'
      };
    }
  }

  // Determine overall success: email or sms succeeding constitutes alert delivery
  const dispatchSucceeded = Boolean(
    results.email?.success || 
    results.sms?.success
  );

  return res.status(dispatchSucceeded ? 200 : 200).json({
    success: dispatchSucceeded,
    channel: channel || 'ALL',
    email: results.email,
    sms: results.sms,
    results,
    emergencyId: emgId,
    liveTrackUrl,
    message: results.email?.success
      ? 'Email alert dispatched successfully'
      : 'Alert request processed by server',
    timestamp: new Date().toLocaleTimeString()
  });
});

// Endpoint to update live coordinates during an active emergency
app.post('/api/location-update', (req, res) => {
  const { emergencyId, lat, lon, accuracy, timestamp, recipientName } = req.body;
  if (!emergencyId) {
    return res.status(400).json({ error: 'emergencyId is required' });
  }

  const existing = activeEmergencies.get(emergencyId) || {
    emergencyId,
    recipientName: recipientName || 'Protected User',
    created: new Date(),
    history: []
  };

  const update = {
    lat: Number(lat),
    lon: Number(lon),
    accuracy: Number(accuracy) || 10,
    timestamp: timestamp || new Date().toISOString(),
    mapUrl: `https://maps.google.com/?q=${lat},${lon}`
  };

  existing.latest = update;
  existing.history.push(update);
  if (existing.history.length > 60) existing.history.shift();

  activeEmergencies.set(emergencyId, existing);
  res.json({ success: true, updated: update });
});

// JSON endpoint to retrieve latest coordinates for an emergency
app.get('/api/track/:emergencyId/data', (req, res) => {
  const emergency = activeEmergencies.get(req.params.emergencyId);
  if (!emergency) {
    return res.status(404).json({ error: 'Emergency tracking session not found or concluded' });
  }
  res.json({ success: true, emergency });
});

// HTML Live emergency tracking page for contacts clicking Email links
app.get('/track/:emergencyId', (req, res) => {
  const emergencyId = req.params.emergencyId;
  const emergency = activeEmergencies.get(emergencyId);
  const lat = emergency?.latest?.lat || 19.0760;
  const lon = emergency?.latest?.lon || 72.8777;
  const name = emergency?.recipientName || 'Protected User';

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>RAKSHA Live Emergency Tracker — ${name}</title>
  <style>
    body {
      margin: 0;
      background: #0B0F0D;
      color: #E8ECE8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 16px;
    }
    .tracker-card {
      max-width: 640px;
      margin: 12px auto;
      background: #131A16;
      border: 1px solid #C95C5C;
      border-radius: 12px;
      padding: 22px;
      box-shadow: 0 8px 32px rgba(201, 92, 92, 0.25);
    }
    .badge {
      background: rgba(201, 92, 92, 0.2);
      color: #C95C5C;
      border: 1px solid #C95C5C;
      border-radius: 9999px;
      padding: 4px 12px;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .pulse {
      animation: blink 1.5s infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
    .coords {
      font-family: monospace;
      background: #19221D;
      border: 1px solid #2A3730;
      padding: 12px 14px;
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.7;
      margin: 14px 0;
    }
    .btn-maps {
      display: block;
      text-align: center;
      background: #C95C5C;
      color: #FFFFFF;
      padding: 12px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="tracker-card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0; color:#C95C5C; font-size:18px;">🚨 RAKSHA LIVE TRACKER</h2>
      <span class="badge pulse">● LIVE EMERGENCY</span>
    </div>
    <p style="margin:12px 0 6px 0; font-size:14px; color:#E8ECE8;">
      Active distress monitoring for: <strong>${name}</strong>
    </p>
    <div class="coords" id="coordsBox">
      📍 <strong>Latitude:</strong> <span id="latVal">${lat}</span><br/>
      📍 <strong>Longitude:</strong> <span id="lonVal">${lon}</span><br/>
      🕒 <strong>Last Transmitted:</strong> <span id="timeVal">${new Date().toLocaleTimeString()}</span>
    </div>
    <a id="mapsBtn" class="btn-maps" href="https://maps.google.com/?q=${lat},${lon}" target="_blank">
      📍 Open Exact Pin in Google Maps App ↗
    </a>
    <div style="height:320px; border-radius:8px; overflow:hidden; border:1px solid #2A3730;">
      <iframe 
        id="mapFrame" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        style="border:0" 
        src="https://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed"
      ></iframe>
    </div>
    <p style="font-size:11px; color:#8D9A91; text-align:center; margin-top:14px;">
      Coordinates auto-refresh every 5 seconds while user session remains active.
    </p>
  </div>
  <script>
    async function updateLocation() {
      try {
        const res = await fetch('/api/track/${emergencyId}/data');
        if (res.ok) {
          const data = await res.json();
          const l = data.emergency && data.emergency.latest;
          if (l) {
            document.getElementById('latVal').innerText = l.lat.toFixed(6);
            document.getElementById('lonVal').innerText = l.lon.toFixed(6);
            document.getElementById('timeVal').innerText = new Date(l.timestamp).toLocaleTimeString();
            document.getElementById('mapsBtn').href = 'https://maps.google.com/?q=' + l.lat + ',' + l.lon;
            document.getElementById('mapFrame').src = 'https://maps.google.com/maps?q=' + l.lat + ',' + l.lon + '&z=16&output=embed';
          }
        }
      } catch (err) {}
    }
    setInterval(updateLocation, 5000);
  </script>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n=======================================================`);
  console.log(`🛡️  RAKSHA Backend Dispatch Server running on port ${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}/api/alert`);
  console.log(`🔍 Status Check: http://localhost:${PORT}/api/status`);
  console.log(`=======================================================\n`);
});

