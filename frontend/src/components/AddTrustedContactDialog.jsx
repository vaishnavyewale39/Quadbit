import React, { useState } from 'react';

const PRIORITY_OPTIONS = ['Primary', 'Secondary', 'Backup'];
const STATUS_OPTIONS = ['Active', 'Disabled'];

const AddTrustedContactDialog = ({ isOpen, onClose, onSave, editingContact }) => {
  if (!isOpen) return null;

  return (
    <AddTrustedContactDialogContent key={editingContact ? editingContact.id : "new"}
      onClose={onClose}
      onSave={onSave}
      editingContact={editingContact}
    />
  );
};

const AddTrustedContactDialogContent = ({ onClose, onSave, editingContact }) => {
  const [formData, setFormData] = useState(() => ({
    name: editingContact?.name || '',
    relationship: editingContact?.relationship || '',
    phone: editingContact?.phone || '',
    email: editingContact?.email || '',
    priority: editingContact?.priority || 'Primary',
    status: editingContact?.status === 'Disabled' ? 'Disabled' : 'Active'
  }));

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }

    // Phone validation (digits, plus, spaces, dashes; at least 7 digits)
    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (digitsOnly.length < 7) {
      errs.phone = 'Enter a valid phone number (at least 7 digits)';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: editingContact ? editingContact.id : `c-${Date.now()}`,
      name: formData.name.trim(),
      relationship: formData.relationship.trim() || 'Emergency Contact',
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      priority: formData.priority,
      status: formData.status
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
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
              {editingContact ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
            </h3>
            <p style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              margin: '2px 0 0 0'
            }}>
              Configured recipient for automated silent emergency dispatches
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Name & Relationship Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                Full Name *
              </label>
              <input
                type="text"
                placeholder='e.g. "Mom", "Aarav Sharma"'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: errors.name ? '1px solid var(--alert-red)' : '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '13px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = errors.name ? 'var(--alert-red)' : 'var(--primary-accent)'}
                onBlur={(e) => e.target.style.borderColor = errors.name ? 'var(--alert-red)' : 'var(--border-subtle)'}
              />
              {errors.name && (
                <span style={{ fontSize: '11px', color: 'var(--alert-red)', marginTop: '4px', display: 'block' }}>
                  {errors.name}
                </span>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                Relationship
              </label>
              <input
                type="text"
                placeholder='e.g. "Mother", "Sister", "Friend"'
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '13px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>
          </div>

          {/* Phone & Email Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: errors.phone ? '1px solid var(--alert-red)' : '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = errors.phone ? 'var(--alert-red)' : 'var(--primary-accent)'}
                onBlur={(e) => e.target.style.borderColor = errors.phone ? 'var(--alert-red)' : 'var(--border-subtle)'}
              />
              {errors.phone && (
                <span style={{ fontSize: '11px', color: 'var(--alert-red)', marginTop: '4px', display: 'block' }}>
                  {errors.phone}
                </span>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                placeholder="contact@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: errors.email ? '1px solid var(--alert-red)' : '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '13px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = errors.email ? 'var(--alert-red)' : 'var(--primary-accent)'}
                onBlur={(e) => e.target.style.borderColor = errors.email ? 'var(--alert-red)' : 'var(--border-subtle)'}
              />
              {errors.email && (
                <span style={{ fontSize: '11px', color: 'var(--alert-red)', marginTop: '4px', display: 'block' }}>
                  {errors.email}
                </span>
              )}
            </div>
          </div>


          {/* Priority & Status Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                Escalation Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                Network Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 22px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-accent)',
                border: 'none',
                color: '#0B0F0D',
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(123, 174, 140, 0.25)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bright-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-accent)'}
            >
              {editingContact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTrustedContactDialog;