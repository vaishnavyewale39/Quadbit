import React from 'react';

const ConfirmDeleteDialog = ({ isOpen, onClose, onConfirm, contactName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--alert-red)',
            margin: 0
          }}>
            Remove Trusted Contact?
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
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

        <div style={{ padding: '24px' }}>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-primary)',
            lineHeight: '1.6',
            margin: '0 0 20px 0'
          }}>
            Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>{contactName || 'this contact'}</strong> from your emergency network?
            They will no longer receive automated emergency dispatches if distress is detected.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                padding: '9px 20px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(201, 92, 92, 0.15)',
                border: '1px solid rgba(201, 92, 92, 0.45)',
                color: 'var(--alert-red)',
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(201, 92, 92, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(201, 92, 92, 0.15)'}
            >
              Remove Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog;