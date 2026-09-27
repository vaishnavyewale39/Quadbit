import React, { useState } from 'react';
import AddTrustedContactDialog from './AddTrustedContactDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

const maskPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\s+/g, '');
  if (digits.length <= 4) return digits;
  const lastFour = digits.slice(-4);
  const prefix = digits.startsWith('+91') ? '+91 ' : digits.startsWith('+') ? digits.slice(0, 3) + ' ' : '';
  return `${prefix}••••• ••${lastFour}`;
};

const getInitials = (name) => {
  if (!name) return 'TC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const TrustedContacts = ({ 
  contacts, 
  onUpdateContacts, 
  isDistress,
  alertDispatchResult = null
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);

  const activeCount = contacts.filter((c) => c.status === 'Active').length;

  const handleToggle = (id) => {
    onUpdateContacts(
      contacts.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'Active' ? 'Disabled' : 'Active';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (contact) => {
    setEditingContact(contact);
    setIsAddDialogOpen(true);
  };

  const handleSaveContact = (contactData) => {
    if (editingContact) {
      onUpdateContacts(
        contacts.map((c) => (c.id === contactData.id ? { ...c, ...contactData } : c))
      );
    } else {
      onUpdateContacts([...contacts, contactData]);
    }
    setEditingContact(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingContact) return;
    if (contacts.length <= 1) {
      alert('You must maintain at least one emergency contact in your safety network.');
      setDeletingContact(null);
      return;
    }
    onUpdateContacts(contacts.filter((c) => c.id !== deletingContact.id));
    setDeletingContact(null);
  };

  // Find delivery status for a contact if an alert was dispatched
  const getDeliveryStatus = (contactId) => {
    if (!alertDispatchResult || !alertDispatchResult.results) return null;
    return alertDispatchResult.results.find((r) => r.contactId === contactId);
  };

  return (
    <div 
      className="raksha-card"
      style={{
        padding: '22px'
      }}
    >
      {/* Header with Title, Active Badge & + Add Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase'
          }}>
            TRUSTED CONTACTS
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--primary-accent)',
            backgroundColor: 'rgba(123, 174, 140, 0.14)',
            padding: '2px 8px',
            borderRadius: '9999px',
            border: '1px solid rgba(123, 174, 140, 0.28)'
          }}>
            {activeCount} Active
          </span>
        </div>

        {/* + Add Contact Button */}
        <button
          onClick={handleOpenAdd}
          title="Add New Trusted Contact"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--primary-accent)',
            fontFamily: 'var(--font-serif)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(123, 174, 140, 0.15)';
            e.currentTarget.style.borderColor = 'var(--primary-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>+</span>
          <span>Add Contact</span>
        </button>
      </div>

      {/* Contacts List with Clean Overflow Scroll */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '340px',
        overflowY: 'auto',
        paddingRight: '2px'
      }}>
        {contacts.map((contact, idx) => {
          const isActive = contact.status === 'Active';
          const isPrimary = contact.priority === 'Primary';
          const delivery = getDeliveryStatus(contact.id);

          return (
            <div
              key={contact.id || idx}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isDistress 
                  ? (isActive ? 'rgba(201, 92, 92, 0.08)' : 'var(--bg-elevated)') 
                  : (isActive ? 'var(--bg-elevated)' : 'rgba(19, 26, 22, 0.6)'),
                border: isDistress 
                  ? (isActive ? '1px solid rgba(201, 92, 92, 0.35)' : '1px solid var(--border-subtle)') 
                  : (isActive ? '1px solid var(--border-subtle)' : '1px solid rgba(42, 55, 48, 0.4)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'border-color 0.2s ease, opacity 0.2s ease',
                opacity: isActive ? 1 : 0.65
              }}
            >
              {/* Contact Avatar Circle with Initials */}
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: isActive ? 'rgba(123, 174, 140, 0.12)' : 'rgba(42, 55, 48, 0.4)',
                border: isActive ? '1px solid rgba(123, 174, 140, 0.3)' : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: isActive ? 'var(--primary-accent)' : 'var(--text-secondary)',
                flexShrink: 0
              }}>
                {getInitials(contact.name)}
              </div>

              {/* Contact Information */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name, Relationship & Priority */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: isPrimary ? 'rgba(123, 174, 140, 0.18)' : 'rgba(141, 154, 145, 0.15)',
                    color: isPrimary ? 'var(--primary-accent)' : 'var(--text-secondary)',
                    border: isPrimary ? '1px solid rgba(123, 174, 140, 0.3)' : '1px solid var(--border-subtle)'
                  }}>
                    {contact.priority || 'Contact'}
                  </span>

                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                    {contact.name}
                  </span>

                  {contact.relationship && (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      ({contact.relationship})
                    </span>
                  )}
                </div>

                {/* Masked Phone & Email */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  marginTop: '2px'
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {maskPhone(contact.phone)}
                  </span>
                  {contact.email && (
                    <span style={{
                      color: 'var(--text-muted)',
                      wordBreak: 'break-all'
                    }}>
                      • {contact.email}
                    </span>
                  )}
                </div>

                                {/* Emergency Alert Live Delivery Status */}
                {isDistress && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {isActive ? (
                      <>
                        {/* SMS Status Badge */}
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: delivery?.sms?.success !== false ? 'var(--safe-green)' : 'var(--alert-red)',
                          backgroundColor: delivery?.sms?.success !== false ? 'rgba(112, 180, 138, 0.15)' : 'rgba(201, 92, 92, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: delivery?.sms?.success !== false ? '1px solid rgba(112, 180, 138, 0.35)' : '1px solid rgba(201, 92, 92, 0.35)'
                        }}>
                          {delivery?.sms?.success !== false ? '✓ SMS Sent' : '✕ SMS Failed'}
                        </span>

                        {/* Email Status Badge */}
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: delivery?.email?.success !== false ? 'var(--safe-green)' : 'var(--alert-red)',
                          backgroundColor: delivery?.email?.success !== false ? 'rgba(112, 180, 138, 0.15)' : 'rgba(201, 92, 92, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: delivery?.email?.success !== false ? '1px solid rgba(112, 180, 138, 0.35)' : '1px solid rgba(201, 92, 92, 0.35)'
                        }}>
                          {delivery?.email?.success !== false ? '✓ Email Sent' : '✕ Email Failed'}
                        </span>
                      </>
                    ) : (
                      <span style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-card)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        ○ Bypassed (Disabled)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Actions & Enable/Disable Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEdit(contact)}
                  title="Edit contact"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.2s, background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--primary-accent)';
                    e.currentTarget.style.backgroundColor = 'rgba(123, 174, 140, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  ✎
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeletingContact(contact)}
                  title="Remove contact"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.2s, background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--alert-red)';
                    e.currentTarget.style.backgroundColor = 'rgba(201, 92, 92, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  ✕
                </button>

                {/* Enable/Disable Toggle Switch */}
                <label 
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '32px',
                    height: '18px',
                    cursor: 'pointer',
                    marginLeft: '2px'
                  }}
                  title={isActive ? 'Active — receives alerts' : 'Disabled — bypassed during alerts'}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleToggle(contact.id)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: isActive ? 'var(--primary-accent)' : 'var(--border-subtle)',
                    borderRadius: '9999px',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: isActive ? '16px' : '2px',
                      width: '14px',
                      height: '14px',
                      backgroundColor: isActive ? '#0B0F0D' : 'var(--text-secondary)',
                      borderRadius: '50%',
                      transition: 'left 0.2s ease, background-color 0.2s ease'
                    }} />
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Escalation Sequence Indicator (inspired by trust-rose reference) */}
      <div style={{
        marginTop: '16px',
        paddingTop: '14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px'
        }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            Silent Alert Escalation Flow:
          </span>
          <span style={{ color: 'var(--safe-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--safe-green)' }} />
            Automated Dispatches
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
          fontSize: '10px'
        }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(201, 164, 92, 0.12)',
            border: '1px solid rgba(201, 164, 92, 0.3)',
            color: 'var(--warning-amber)',
            whiteSpace: 'nowrap'
          }}>
            Distress Verified
          </span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(123, 174, 140, 0.14)',
            border: '1px solid rgba(123, 174, 140, 0.3)',
            color: 'var(--primary-accent)',
            whiteSpace: 'nowrap'
          }}>
            Primary
          </span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap'
          }}>
            Secondary
          </span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap'
          }}>
            Backup
          </span>
        </div>
      </div>

      {/* Privacy Notice Footnote */}
      <div style={{
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        color: 'var(--text-muted)'
      }}>
        <span>🛡️</span>
        <span>End-to-end encrypted emergency contact registry</span>
      </div>

      {/* Add / Edit Dialog */}
      <AddTrustedContactDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deletingContact)}
        onClose={() => setDeletingContact(null)}
        onConfirm={handleConfirmDelete}
        contactName={deletingContact?.name}
      />
    </div>
  );
};

export default TrustedContacts;