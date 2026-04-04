'use client';

import { useState, useRef, useEffect } from 'react';
import { CHAT_MODELS, canAccessModel, type Tier } from '@/config/platform';

interface ModelSelectorProps {
  userTier: Tier;
  selectedModel: string;
  extendedThinking: boolean;
  onSelect: (modelId: string) => void;
  onExtendedThinkingChange: (enabled: boolean) => void;
  onNewChatWithModel?: (modelId: string) => void;
}

export function ModelSelector({
  userTier,
  selectedModel,
  extendedThinking,
  onSelect,
  onExtendedThinkingChange,
  onNewChatWithModel,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ bottom: number; left: number }>({ bottom: 0, left: 0 });

  const current = CHAT_MODELS.find(m => m.id === selectedModel) ?? CHAT_MODELS[0];
  const isMax = current.supportsExtendedThinking;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left,
      });
    }
    setOpen(v => !v);
    setMoreOpen(false);
  };

  const getDesc = (id: string) => {
    const m = CHAT_MODELS.find(x => x.id === id);
    return m?.description ?? '';
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px 12px',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontSize: '14px',
          fontWeight: 500,
          fontFamily: 'var(--font-sans)',
          transition: 'background 0.15s, border-color 0.15s',
          minWidth: '170px',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)';
          e.currentTarget.style.borderColor = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--card-bg)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <span>{current.name}</span>
        {/* Reserve space always so badge never causes layout shift */}
        <span style={{ minWidth: '72px', display: 'flex', alignItems: 'center' }}>
          {extendedThinking && (
            <span style={{
              color: 'var(--accent)',
              fontWeight: 500,
              fontSize: '12px',
              background: 'rgba(217,119,87,0.12)',
              border: '1px solid rgba(217,119,87,0.25)',
              borderRadius: '4px',
              padding: '1px 5px',
              whiteSpace: 'nowrap',
            }}>EXTENDED</span>
          )}
        </span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            width: 14, height: 14,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            marginLeft: 'auto',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown — fixed position so it never gets clipped by parent overflow */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: dropdownPos.bottom,
            left: dropdownPos.left,
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 200,
          }}
        >
          {/* Primary menu */}
          <div style={{
            width: '320px',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            overflow: 'visible',
            position: 'relative',
            zIndex: 10,
          }}>
            {/* Selected model row */}
            <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px 16px 0 0', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '15px', fontFamily: 'var(--font-sans)' }}>{current.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>{getDesc(selectedModel)}</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '0 16px' }} />

            {/* Extended Thinking toggle */}
            {isMax ? (
              <div
                style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => onExtendedThinkingChange(!extendedThinking)}
              >
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '15px', fontFamily: 'var(--font-sans)' }}>Extended thinking</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>Think longer for complex tasks</div>
                </div>
                {/* Toggle switch */}
                <div style={{
                  width: 38, height: 22, borderRadius: 11, position: 'relative',
                  background: extendedThinking ? 'var(--accent)' : 'var(--border-strong)',
                  transition: 'background 0.2s',
                  flexShrink: 0, cursor: 'pointer',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2,
                    left: extendedThinking ? 18 : 2,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4, cursor: 'not-allowed' }}>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '15px', fontFamily: 'var(--font-sans)' }}>Extended thinking</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>Only available with DIGITN MAX</div>
                </div>
                <div style={{ width: 38, height: 22, borderRadius: 11, background: 'var(--border)', position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--text-tertiary)', position: 'absolute', top: 2, left: 2 }} />
                </div>
              </div>
            )}

            {/* More models row */}
            <div
              style={{
                padding: '14px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer',
                borderRadius: '0 0 16px 16px',
                background: moreOpen ? 'var(--card-bg)' : 'var(--bg-primary)',
                transition: 'background 0.15s',
              }}
              onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--card-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = moreOpen ? 'var(--card-bg)' : 'var(--bg-primary)')}
            >
              <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '15px', fontFamily: 'var(--font-sans)' }}>More models</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Secondary menu — slides out to the right */}
          {moreOpen && (
            <div style={{
              position: 'absolute',
              left: '312px',
              bottom: 0,
              width: '260px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.3), 0 10px 40px rgba(0,0,0,0.5)',
              padding: '12px 0',
              zIndex: 20,
            }}>
              <div style={{ padding: '0 16px 8px', color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'var(--font-sans)' }}>
                Start a new chat
              </div>
              {CHAT_MODELS.map(model => {
                const accessible = canAccessModel(userTier, model);
                return (
                  <div
                    key={model.id}
                    onClick={() => {
                      if (accessible) {
                        if (onNewChatWithModel) {
                          try { localStorage.setItem('digitn-selected-model', model.id); } catch {}
                          onNewChatWithModel(model.id);
                        } else {
                          onSelect(model.id);
                          if (!model.supportsExtendedThinking) onExtendedThinkingChange(false);
                        }
                        setOpen(false);
                        setMoreOpen(false);
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: accessible ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (accessible) e.currentTarget.style.background = 'var(--card-strong)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>{model.name}</span>
                    {!accessible && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); window.location.href = '/app/upgrade'; }}
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                          border: 'none', borderRadius: '20px',
                          padding: '3px 12px', fontSize: '12px', fontWeight: 600,
                          color: '#fff', cursor: 'pointer',
                          fontFamily: 'var(--font-sans)', letterSpacing: '0.02em',
                        }}
                      >
                        UPGRADE
                      </button>
                    )}
                    {accessible && model.id === selectedModel && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
