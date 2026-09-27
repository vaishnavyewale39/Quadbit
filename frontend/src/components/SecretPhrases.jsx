import React, { useState } from 'react';
import AddSecretPhraseDialog from './AddSecretPhraseDialog';

const SecretPhrases = ({ phrases, onUpdatePhrases }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(null);

  const handleToggle = (id) => {
    onUpdatePhrases(
      phrases.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleDelete = (id) => {
    if (phrases.length <= 1) {
      alert('You must keep at least one configured secret phrase.');
      return;
    }
    onUpdatePhrases(phrases.filter((p) => p.id !== id));
  };

  const handleSave = (phraseData) => {
    if (editingPhrase) {
      onUpdatePhrases(
        phrases.map((p) => (p.id === phraseData.id ? phraseData : p))
      );
    } else {
      onUpdatePhrases([...phrases, phraseData]);
    }
    setEditingPhrase(null);
  };

  const openAddDialog = () => {
    setEditingPhrase(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (phrase) => {
    setEditingPhrase(phrase);
    setIsDialogOpen(true);
  };

  const activeCount = phrases.filter(p => p.enabled).length;

  return (
    <div 
      className="raksha-card"
      style={{
        padding: '22px'
      }}
    >
      {/* Header with + Add button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase'
          }}>
            SECRET PHRASES
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

        {/* + Add Phrase Button - Palette 2 Accent */}
        <button
          onClick={openAddDialog}
          title="Add New Secret Phrase"
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
          <span>Add Phrase</span>
        </button>
      </div>

      {/* Phrases List with Responsive Flex/Grid and Generous Spacing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {phrases.map((item) => {
          const isWarningCondition = item.condition.toLowerCase().includes('stress') || item.condition.toLowerCase().includes('multi');

          return (
            <div
              key={item.id}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: item.enabled ? 'var(--bg-elevated)' : 'rgba(19, 26, 22, 0.6)',
                border: item.enabled ? '1px solid var(--border-subtle)' : '1px solid rgba(42, 55, 48, 0.4)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '14px',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                opacity: item.enabled ? 1 : 0.65
              }}
            >
              {/* Left: Phrase text & condition */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: item.enabled ? 'var(--text-primary)' : 'var(--text-secondary)',
                    wordBreak: 'break-word',
                    lineHeight: '1.4'
                  }}>
                    "{item.phrase}"
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Condition:</span>
                  <span style={{ 
                    color: isWarningCondition && item.enabled ? 'var(--warning-amber)' : 'var(--text-secondary)',
                    fontWeight: isWarningCondition ? 600 : 400
                  }}>
                    {item.condition}
                  </span>
                </div>
              </div>

              {/* Right: Actions & Toggle - Structured so they never collide with text */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                {/* Edit button */}
                <button
                  onClick={() => openEditDialog(item)}
                  title="Edit phrase"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '5px',
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

                {/* Delete button: subtle neutral until hovered, then alert red #C95C5C */}
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Delete phrase"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '5px',
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

                {/* Toggle Switch - Palette 2 Primary Accent */}
                <label 
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '34px',
                    height: '19px',
                    cursor: 'pointer',
                    marginLeft: '2px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => handleToggle(item.id)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: item.enabled ? 'var(--primary-accent)' : 'var(--border-subtle)',
                    borderRadius: '9999px',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: item.enabled ? '17px' : '2px',
                      width: '15px',
                      height: '15px',
                      backgroundColor: item.enabled ? '#0B0F0D' : 'var(--text-secondary)',
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

      <AddSecretPhraseDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        editingPhrase={editingPhrase}
      />
    </div>
  );
};

export default SecretPhrases;