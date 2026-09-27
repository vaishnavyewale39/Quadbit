import React, { useRef, useEffect } from 'react';

const ActivityLog = ({ events }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div 
      className="raksha-card"
      style={{
        padding: '22px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase'
          }}>
            RECENT ACTIVITY
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-elevated)',
            padding: '2px 8px',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)'
          }}>
            {events.length} Events
          </span>
        </div>

        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Real-time Audit Log
        </span>
      </div>

      {/* Activity List */}
      <div 
        ref={scrollRef}
        style={{
          width: '100%',
          maxHeight: '140px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingRight: '4px'
        }}
      >
        {events.map((item, idx) => {
          let dotColor = 'var(--text-secondary)';

          if (item.type === 'alert' || item.text.includes('Alert') || item.text.includes('distress')) {
            dotColor = 'var(--alert-red)';
          } else if (item.type === 'phrase' || item.text.includes('Secret phrase')) {
            dotColor = 'var(--warning-amber)';
          } else if (item.type === 'safe' || item.text.includes('safe') || item.text.includes('verified')) {
            dotColor = 'var(--safe-green)';
          } else if (item.type === 'active' || item.text.includes('connected') || item.text.includes('initialized')) {
            dotColor = 'var(--primary-accent)';
          }

          return (
            <div 
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '12px',
                lineHeight: '1.5'
              }}
            >
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: '11px',
                color: 'var(--text-muted)',
                flexShrink: 0
              }}>
                {item.time}
              </span>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: dotColor,
                marginTop: '6px',
                flexShrink: 0
              }} />
              <span style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityLog;