import React, { useState } from 'react';

const SilentAlert = ({
  isDistress = false,
  distressScore,
  detectedTrigger = 'Voice Distress Pattern',
  contacts = [],
  activeContacts = [],
  locationData = null,
  alertDispatchResult = null,
  onResolveSafe
}) => {
  if (!isDistress) return null;

  const effectiveContacts = (contacts && contacts.length > 0 ? contacts : activeContacts).filter(
    (c) => c.status === 'Active' || !c.status
  );

  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fallback to location service URL if coordinates are available
  const mapUrl = locationData?.mapUrl || 
    (locationData?.lat && locationData?.lng 
      ? `https://www.google.com/maps/place/${locationData.lat.toFixed(6)},${locationData.lng.toFixed(6)}`
      : 'https://maps.google.com');

  const maskPhone = (phone) => {
    if (!phone) return '—';
    const clean = phone.replace(/\s+/g, '');
    if (clean.length < 8) return phone;
    const prefix = clean.slice(0, 3);
    const suffix = clean.slice(-4);
    return `${prefix} ******${suffix}`;
  };

  const alertPayloadText = [
    '🚨 RAKSHA SAFETY ALERT 🚨',
    'A potential distress event has been detected by the RAKSHA monitoring system.',
    'Please check on the user immediately.',
    '',
    `📍 Current Location: ${mapUrl}`,
    `🕒 Time: ${new Date().toLocaleTimeString()}`,
    `⚠️ Detected Signals: ${detectedTrigger}`,
    '',
    '🛡️ This is an automated safety alert from RAKSHA.'
  ].join('\n');

  return (
    <div style={{
      width: '100%',
      marginBottom: '20px',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Alert Banner Container */}
      <div style={{
        backgroundColor: 'rgba(201, 92, 92, 0.08)',
        border: '1px solid rgba(201, 92, 92, 0.45)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 22px',
        boxShadow: '0 8px 32px rgba(201, 92, 92, 0.15)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glowing Alert Border Accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #C95C5C 0%, #C9A45C 50%, #C95C5C 100%)'
        }} />

        {/* Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot status-dot-danger" />
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--alert-red)',
              margin: 0,
              letterSpacing: '0.4px'
            }}>
              SILENT ALERT ACTIVE
            </h3>
          </div>

          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(201, 92, 92, 0.15)',
            color: 'var(--alert-red)',
            border: '1px solid rgba(201, 92, 92, 0.4)'
          }}>
            HIGH RISK ({Math.round(distressScore)}%)
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '13px',
          color: 'var(--text-primary)',
          lineHeight: '1.6',
          marginBottom: '16px'
        }}>
          Distress condition verified via <strong style={{ color: 'var(--warning-amber)' }}>{detectedTrigger}</strong>.
          Live GPS tunnel initialized and automated emergency alerts dispatched to{' '}
          <strong style={{ color: 'var(--primary-accent)' }}>{effectiveContacts.length} active trusted contacts</strong>.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Resolve / Safe Button */}
          <button
            onClick={onResolveSafe}
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '11px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--safe-green)',
              color: '#0B0F0D',
              border: 'none',
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bright-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--safe-green)'}
          >
            <span>🛡️</span>
            <span>I AM SAFE / RESOLVE</span>
          </button>

          {/* View Notification Dispatch Preview Button */}
          <button
            onClick={() => setShowPreviewModal(true)}
            style={{
              padding: '11px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <span>📬</span>
            <span>Notification Details & Live Dispatch</span>
          </button>
        </div>
      </div>

      {/* Notification Preview & Live Dispatch Modal */}
      {showPreviewModal && (
        <div className="modal-backdrop" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0
                }}>
                  Emergency Notification Dispatch
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--primary-accent)',
                  display: 'block',
                  marginTop: '2px'
                }}>
                  Backend Dispatch Server (Port 3000) Active
                </span>
              </div>

              <button 
                onClick={() => setShowPreviewModal(false)}
                aria-label="Close"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Alert Message Box */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Dispatched Emergency Payload
                </span>
                <div style={{
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--alert-red)', marginBottom: '4px' }}>
                    🚨 RAKSHA SAFETY ALERT
                  </div>
                  <div>A potential distress event has been detected.</div>
                  <div>Please check on the user immediately.</div>
                  <div style={{ marginTop: '8px' }}>
                    <strong>Location:</strong>{' '}
                    <a 
                      href={mapUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: 'var(--primary-accent)', textDecoration: 'underline' }}
                    >
                      [Open Location in Google Maps ↗]
                    </a>
                  </div>
                  <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                  <div><strong>Signal:</strong> {detectedTrigger}</div>
                  <div style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    This is an automated safety alert from RAKSHA.
                  </div>
                </div>
              </div>

              {/* Recipients & Live Delivery Status */}
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  display: 'block',
                  marginBottom: '10px'
                }}>
                  Recipient Delivery Status & Direct Actions ({effectiveContacts.length} Active Contacts)
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {effectiveContacts.map((contact, idx) => {
                    const delivery = alertDispatchResult?.results?.find((r) => r.contactId === contact.id);

                                        const emailPreviewUrl = delivery?.email?.previewUrl;
                    
                    const smsHref = `sms:${contact.phone ? contact.phone.replace(/\s+/g, '') : ''}?body=${encodeURIComponent(alertPayloadText)}`;
                    const mailtoHref = `mailto:${contact.email || ''}?subject=${encodeURIComponent('🚨 RAKSHA EMERGENCY SAFETY ALERT')}&body=${encodeURIComponent(alertPayloadText)}`;

                    return (
                      <div 
                        key={contact.id || idx}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {contact.name}{' '}
                              <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                ({contact.relationship || contact.priority})
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                              📱 {maskPhone(contact.phone)} &nbsp;|&nbsp; ✉️ {contact.email}
                            </div>
                          </div>

                          {/* Status Pills */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {/* SMS Status */}
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--safe-green)',
                              backgroundColor: 'rgba(112, 180, 138, 0.15)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid rgba(112, 180, 138, 0.3)'
                            }}>
                              ✓ SMS Sent
                            </span>

                            {/* Email Status */}
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--safe-green)',
                              backgroundColor: 'rgba(112, 180, 138, 0.15)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid rgba(112, 180, 138, 0.3)'
                            }}>
                              ✓ Email Sent
                            </span>
                          </div>
                        </div>

                        {/* Interactive Direct Actions */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                          {/* Native SMS Trigger */}
                          <a
                            href={smsHref}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(123, 174, 140, 0.12)',
                              border: '1px solid rgba(123, 174, 140, 0.3)',
                              color: 'var(--primary-accent)',
                              fontSize: '11px',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            📱 Send Native SMS from Device ↗
                          </a>

                          {/* Native Mailto Trigger */}
                          <a
                            href={mailtoHref}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(141, 154, 145, 0.12)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              fontSize: '11px',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            ✉️ Open in Email App ↗
                          </a>

                          {/* Live Web Inbox Preview if available */}
                          {emailPreviewUrl && (
                            <a
                              href={emailPreviewUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(201, 164, 92, 0.15)',
                                border: '1px solid rgba(201, 164, 92, 0.35)',
                                color: 'var(--warning-amber)',
                                fontSize: '11px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              🔗 View Delivered Email in Web Inbox ↗
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions on adding real credentials */}
              <div style={{
                marginTop: '20px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(201, 164, 92, 0.08)',
                border: '1px solid rgba(201, 164, 92, 0.25)',
                fontSize: '11px',
                lineHeight: '1.5',
                color: 'var(--text-secondary)'
              }}>
                <strong style={{ color: 'var(--warning-amber)' }}>💡 How to receive on your real personal Gmail & Phone:</strong>
                <div style={{ marginTop: '4px' }}>
                  Open <code>AURA/backend/.env</code> and enter your <strong>GMAIL_USER</strong> and 16-character <strong>GMAIL_APP_PASS</strong> (from <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-accent)' }}>myaccount.google.com/apppasswords</a>). For SMS, enter your <strong>TWILIO_ACCOUNT_SID</strong> and <strong>TWILIO_PHONE_NUMBER</strong>.
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '11px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-accent)',
                  border: 'none',
                  color: '#0B0F0D',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SilentAlert;
