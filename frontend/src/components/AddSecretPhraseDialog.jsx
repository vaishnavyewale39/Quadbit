import React, { useState } from 'react';

const CONDITIONS = [
  'Multi-signal (Phrase + High Stress)',
  'Phrase detected once',
  'Phrase detected twice',
  'Phrase detected during elevated voice stress',
  'Phrase detected after prolonged silence',
  'Custom condition'
];

const AddSecretPhraseDialog = ({ isOpen, onClose, onSave, editingPhrase }) => {
  if (!isOpen) return null;

  return (
    <AddSecretPhraseDialogContent 
      onClose={onClose} 
      onSave={onSave} 
      editingPhrase={editingPhrase} 
    />
  );
};

const AddSecretPhraseDialogContent = ({ onClose, onSave, editingPhrase }) => {
  const [phrase, setPhrase] = useState(editingPhrase ? editingPhrase.phrase : '');
  const [condition, setCondition] = useState(editingPhrase ? editingPhrase.condition : CONDITIONS[0]);
  const [action] = useState(
    editingPhrase ? (editingPhrase.action || 'Activate Silent Alert & Notify 3 Trusted Contacts') : 'Activate Silent Alert & Notify 3 Trusted Contacts'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phrase.trim()) return;

    onSave({
      id: editingPhrase ? editingPhrase.id : Date.now().toString(),
      phrase: phrase.trim(),
      condition,
      action,
      enabled: editingPhrase ? editingPhrase.enabled : true
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
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0
          }}>
            {editingPhrase ? 'Edit Secret Phrase' : 'Add Secret Phrase'}
          </h3>
          <button 
            onClick={onClose}
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* 1. Secret Phrase */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              Secret Phrase
            </label>
            <input
              type="text"
              required
              placeholder='e.g. "check the oven", "did you feed the dog?"'
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontFamily: 'var(--font-serif)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>
              Choose a casual, natural phrase you can state innocuously in conversation.
            </p>
          </div>

          {/* 2. Condition */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              Trigger Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontFamily: 'var(--font-serif)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {CONDITIONS.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>
              Multi-signal conditions combine acoustic tension with speech recognition to prevent false alarms.
            </p>
          </div>

          {/* 3. Action */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              Action on Detection
            </label>
            <input
              type="text"
              readOnly
              value={action}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(42, 55, 48, 0.25)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontFamily: 'var(--font-serif)',
                outline: 'none'
              }}
            />
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
              {editingPhrase ? 'Save Changes' : 'Add Phrase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSecretPhraseDialog;