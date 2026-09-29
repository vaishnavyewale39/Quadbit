/**
 * notificationService.js
 * Decoupled notification dispatch service for RAKSHA Silent Alerts.
 * Dispatches emergency payloads to trusted contacts via Email and SMS.
 * Connects to RAKSHA backend dispatch server (port 3000) for real delivery.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const BACKEND_ENDPOINTS = BACKEND_URL
  ? [`${BACKEND_URL}/api/alert`]
  : [
      'http://localhost:3000/api/alert',
      'http://localhost:8000/api/alert'
    ];

const STATUS_ENDPOINTS = BACKEND_URL
  ? [`${BACKEND_URL}/api/status`]
  : [
      'http://localhost:3000/api/status',
      'http://localhost:8000/api/status'
    ];

let cachedWorkingEndpoint = null;
let cachedWorkingStatusEndpoint = null;

export const callBackendAlert = async (payload) => {
  const endpointsToTry = cachedWorkingEndpoint 
    ? [cachedWorkingEndpoint, ...BACKEND_ENDPOINTS.filter(ep => ep !== cachedWorkingEndpoint)]
    : BACKEND_ENDPOINTS;

  for (const endpoint of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        cachedWorkingEndpoint = endpoint;
        const data = await response.json();
        return { ok: true, data };
      }
    } catch {
      // Continue to next candidate endpoint
    }
  }

  return { ok: false, error: 'All backend endpoints offline' };
};

/**
 * Fetch backend providers configuration status (Email, SMS).
 */
export const fetchBackendStatus = async () => {
  const endpointsToTry = cachedWorkingStatusEndpoint
    ? [cachedWorkingStatusEndpoint, ...STATUS_ENDPOINTS.filter(ep => ep !== cachedWorkingStatusEndpoint)]
    : STATUS_ENDPOINTS;

  for (const endpoint of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        cachedWorkingStatusEndpoint = endpoint;
        const data = await response.json();
        return {
          online: true,
          email: {
            connected: Boolean(data.configured?.email),
            detail: data.providers?.email || 'Active'
          },
          sms: {
            connected: Boolean(data.configured?.sms),
            detail: data.providers?.sms || 'Active'
          }
        };
      }
    } catch {
      // Continue
    }
  }

  return {
    online: false,
    email: { connected: false, detail: 'Backend offline (Port 3000)' },
    sms: { connected: false, detail: 'Backend offline (Port 3000)' }
  };
};

/**
 * Builds the official RAKSHA distress alert message.
 */
export const buildAlertMessage = ({ locationLink, timestamp, detectedTrigger, recipientName }) => {
  return [
    '🚨 RAKSHA EMERGENCY ALERT 🚨',
    '',
    'A critical distress condition was detected by the RAKSHA safety monitoring system.',
    '',
    `👤 Protected User: ${recipientName || 'Protected User'}`,
    `📍 Location: ${locationLink || 'Location unavailable'}`,
    `🕒 Time: ${timestamp || new Date().toLocaleTimeString()}`,
    `⚠️ Detected Signal: ${detectedTrigger || 'Elevated vocal distress / Secret phrase'}`,
    '',
    'Please check on the user immediately.',
    '',
    '🛡️ RAKSHA — Silent Protection. Smarter Safety.'
  ].join('\n');
};

/**
 * Send Email alert to a contact.
 */
export const sendEmail = async (contact, alertData) => {
  const message = buildAlertMessage({ ...alertData, recipientName: contact.name });

  const res = await callBackendAlert({
    contactEmail: contact.email,
    contact: contact.email,
    channel: 'EMAIL',
    payload: message,
    location: alertData.locationLink,
    recipientName: contact.name,
    emergencyId: alertData.emergencyId,
    detectedTrigger: alertData.detectedTrigger
  });

  if (res.ok) {
    const data = res.data;
    const emailRes = data.results?.email || data.email;
    if (emailRes) {
      return {
        success: Boolean(emailRes.success),
        mode: emailRes.mode || 'real',
        provider: emailRes.provider || 'Gmail SSL SMTP (Delivered)',
        messageId: emailRes.messageId || `email-${Date.now()}`,
        previewUrl: emailRes.previewUrl || null,
        timestamp: new Date().toLocaleTimeString(),
        detail: emailRes.detail || data.message,
        error: emailRes.error || null
      };
    }
    return {
      success: Boolean(data.success),
      mode: 'backend',
      provider: 'Gmail SSL SMTP (Delivered)',
      messageId: `email-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      detail: data.message || 'Dispatched via server'
    };
  }

  return {
    success: false,
    mode: 'offline',
    provider: 'Backend Offline',
    messageId: `email-offline-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    detail: 'Backend offline. Start backend server to dispatch email.',
    error: 'Backend offline'
  };
};

/**
 * Send SMS alert to a contact.
 */
export const sendSMS = async (contact, alertData) => {
  const message = buildAlertMessage({ ...alertData, recipientName: contact.name });

  const res = await callBackendAlert({
    contactPhone: contact.phone,
    contact: contact.phone,
    channel: 'SMS',
    payload: message,
    location: alertData.locationLink,
    recipientName: contact.name,
    emergencyId: alertData.emergencyId,
    detectedTrigger: alertData.detectedTrigger
  });

  if (res.ok) {
    const data = res.data;
    const smsRes = data.results?.sms || data.sms;
    if (smsRes) {
      return {
        success: Boolean(smsRes.success),
        mode: smsRes.mode || 'real',
        provider: smsRes.provider || 'Fast2SMS Gateway',
        messageId: smsRes.messageId || `sms-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        detail: smsRes.detail || data.message,
        error: smsRes.error || null
      };
    }
    return {
      success: Boolean(data.success),
      mode: 'backend',
      provider: 'Fast2SMS Gateway',
      messageId: `sms-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      detail: data.message || 'Dispatched via server'
    };
  }

  return {
    success: false,
    mode: 'offline',
    provider: 'Backend Offline',
    messageId: `sms-offline-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    detail: 'Backend offline. Start backend server to dispatch cellular SMS.',
    error: 'Backend offline'
  };
};

/**
 * Dispatches Email and SMS to an individual contact concurrently.
 */
export const sendAlertToContact = async (contact, alertData) => {
  const [emailResult, smsResult] = await Promise.all([
    sendEmail(contact, alertData),
    sendSMS(contact, alertData)
  ]);

  return {
    contactId: contact.id,
    name: contact.name,
    email: emailResult,
    sms: smsResult,
    success: emailResult.success || smsResult.success
  };
};

/**
 * Dispatches emergency alerts to all ACTIVE trusted contacts in parallel.
 * Disabled contacts are safely excluded.
 */
export const dispatchAlertToActiveContacts = async (contacts, alertData) => {
  const activeContacts = contacts.filter((c) => c.status === 'Active');

  if (activeContacts.length === 0) {
    return {
      activeCount: 0,
      dispatchedCount: 0,
      successfulEmailCount: 0,
      successfulSmsCount: 0,
      results: [],
      timestamp: new Date().toLocaleTimeString()
    };
  }

  const results = await Promise.all(
    activeContacts.map((contact) => sendAlertToContact(contact, alertData))
  );

  const successfulResults = results.filter((result) => result.success);
  const successfulEmailCount = results.filter((result) => result.email?.success).length;
  const successfulSmsCount = results.filter((result) => result.sms?.success).length;

  return {
    activeCount: activeContacts.length,
    dispatchedCount: successfulResults.length,
    successfulEmailCount,
    successfulSmsCount,
    results,
    timestamp: new Date().toLocaleTimeString()
  };
};

/**
 * Transmits live location updates during an ongoing emergency.
 */
export const updateLiveLocation = async (emergencyId, locationData, recipientName = 'Protected User') => {
  if (!emergencyId || !locationData || !locationData.lat || !locationData.lon) return;

  const endpoint = cachedWorkingEndpoint 
    ? cachedWorkingEndpoint.replace('/api/alert', '/api/location-update')
    : 'http://localhost:3000/api/location-update';

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emergencyId,
        lat: locationData.lat,
        lon: locationData.lon,
        accuracy: locationData.accuracy || 10,
        timestamp: new Date().toISOString(),
        recipientName
      })
    });
  } catch {
    // Non-blocking background sync
  }
};
