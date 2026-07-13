'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const TRFlag = () => (
    <svg viewBox="0 0 30 20" width="20" height="14" xmlns="http://www.w3.org/2000/svg">
        <rect width="30" height="20" fill="#E30A17" />
        <circle cx="11.5" cy="10" r="4.5" fill="white" />
        <circle cx="13" cy="10" r="3.6" fill="#E30A17" />
        <polygon points="17,10 18.5,7.5 21.5,8.5 19.5,10 21.5,11.5 18.5,12.5" fill="white" />
    </svg>
);

const UKFlag = () => (
    <svg viewBox="0 0 60 30" width="20" height="14" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="30" fill="#012169" />
        <line x1="0" y1="0" x2="60" y2="30" stroke="white" strokeWidth="6" />
        <line x1="60" y1="0" x2="0" y2="30" stroke="white" strokeWidth="6" />
        <line x1="0" y1="0" x2="60" y2="30" stroke="#C8102E" strokeWidth="3.6" />
        <line x1="60" y1="0" x2="0" y2="30" stroke="#C8102E" strokeWidth="3.6" />
        <rect x="24" y="0" width="12" height="30" fill="white" />
        <rect x="0" y="9" width="60" height="12" fill="white" />
        <rect x="26" y="0" width="8" height="30" fill="#C8102E" />
        <rect x="0" y="11" width="60" height="8" fill="#C8102E" />
    </svg>
);

export default function LanguageSwitcher() {
    const { lang, setLang } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setOpen(v => !v)}
                className="mono-label"
                style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    background: 'transparent',
                    border: '1px solid var(--line-strong)',
                    borderRadius: '2px', padding: '0.42rem 0.7rem',
                    cursor: 'pointer', color: 'var(--cream)',
                    fontSize: '0.68rem', letterSpacing: '0.14em',
                }}
            >
                {lang === 'tr' ? <TRFlag /> : <UKFlag />}
                <span>{lang === 'tr' ? 'TR' : 'EN'}</span>
                <span style={{ fontSize: '8px', color: 'var(--gold)' }}>{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--bg-elevated)', border: '1px solid var(--line-strong)',
                    borderRadius: '2px', boxShadow: '0 16px 40px -12px rgba(0,0,0,0.55)',
                    overflow: 'hidden', zIndex: 1000, minWidth: '150px',
                }}>
                    <button
                        onClick={() => { setLang('tr'); setOpen(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            width: '100%', padding: '0.7rem 0.9rem',
                            background: lang === 'tr' ? 'var(--gold-soft)' : 'transparent',
                            border: 'none', cursor: 'pointer',
                            fontSize: '0.88rem', color: 'var(--cream)', textAlign: 'left',
                            borderBottom: '1px solid var(--line)',
                        }}
                    >
                        <TRFlag />
                        <span>Türkçe</span>
                        {lang === 'tr' && <span style={{ marginLeft: 'auto', color: 'var(--gold)' }}>✓</span>}
                    </button>

                    <button
                        onClick={() => { setLang('en'); setOpen(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            width: '100%', padding: '0.7rem 0.9rem',
                            background: lang === 'en' ? 'var(--gold-soft)' : 'transparent',
                            border: 'none', cursor: 'pointer',
                            fontSize: '0.88rem', color: 'var(--cream)', textAlign: 'left',
                        }}
                    >
                        <UKFlag />
                        <span>English</span>
                        {lang === 'en' && <span style={{ marginLeft: 'auto', color: 'var(--gold)' }}>✓</span>}
                    </button>
                </div>
            )}
        </div>
    );
}
