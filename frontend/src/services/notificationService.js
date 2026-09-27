/**
 * notificationService.js
 * Decoupled notification dispatch service for RAKSHA Silent Alerts.
 * Dispatches emergency payloads to trusted contacts via SMS and Email abstractions.
 * Connects to RAKSHA backend dispatch server (port 3000) for real delivery.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const BACKEND_ENDPOINTS = BACKEND_URL
  ? [`${BACKEND_URL}/api/alert`]
  : [
      'http://localhost:8000/api/alert',
      'http://localhost:3000/api/alert'
    ];

let cachedWorkingEndpoint = null;

const callBackendAlert = async (payload) => {
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
 * Builds the official RAKSHA distress alert message.
 */
export const buildAlertMessage = ({ locationLink, timestamp, detectedTrigger }) => {
  return [
    '🚨 RAKSHA SAFETY ALERT 🚨',
    'A potential distress event has been detected.',
    'Please check on the user immediately.',
    '',
    `📍 Current Location: ${locationLink || 'Location unavailable'}`,
    `🕒 Time: ${timestamp || new Date().toLocaleTimeString()}`,
    `⚠️ Detected signals: ${detectedTrigger || 'Elevated vocal distress'}`,
    '',
    '🛡️ This is an automated safety alert from RAKSHA.'
  ].join('\n');
};

/**
 * Send SMS alert to a contact.
 */
export const sendSMS = async (contact, alertData) => {
  const message = buildAlertMessage(alertData);

  const res = await callBackendAlert({
    contactPhone: contact.phone,
    contact: contact.phone,
    channel: 'SMS',
    payload: message,
    location: alertData.locationLink,
    recipientName: contact.name
  });

  if (res.ok) {
    const data = res.data;
    const smsRes = data.results?.sms;
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

  // If backend is unreachable
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
 * Send Email alert to a contact.
 */
export const sendEmail = async (contact, alertData) => {
  const message = buildAlertMessage(alertData);

  const res = await callBackendAlert({
    contactEmail: contact.email,
    contact: contact.email,
    channel: 'EMAIL',
    payload: message,
    location: alertData.locationLink,
    recipientName: contact.name
  });

  if (res.ok) {
    const data = res.data;
    const emailRes = data.results?.email;
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
 * Dispatches both SMS and Email to an individual contact.
 */
export const sendAlertToContact = async (contact, alertData) => {
  const [smsResult, emailResult] = await Promise.all([
    sendSMS(contact, alertData),
    sendEmail(contact, alertData)
  ]);

  return {
    contactId: contact.id,
    name: contact.name,
    sms: smsResult,
    email: emailResult,
    success: smsResult.success || emailResult.success
  };
};

/**
 * Dispatches emergency alert to all ACTIVE trusted contacts in parallel.
 * Disabled contacts are safely excluded.
 */
export const dispatchAlertToActiveContacts = async (contacts, alertData) => {
  const activeContacts = contacts.filter((c) => c.status === 'Active');

  if (activeContacts.length === 0) {
    return {
      activeCount: 0,
      results: [],
      timestamp: new Date().toLocaleTimeString()
    };
  }

  const results = await Promise.all(
    activeContacts.map((contact) => sendAlertToContact(contact, alertData))
  );

  return {
    activeCount: activeContacts.length,
    results,
    timestamp: new Date().toLocaleTimeString()
  };
};
