'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const TRFlag = () => (
    <svg viewBox="0 0 30 20" width="24" height="16" xmlns="http://www.w3.org/2000/svg">
        <rect width="30" height="20" fill="#E30A17" />
        <circle cx="11.5" cy="10" r="4.5" fill="white" />
        <circle cx="13" cy="10" r="3.6" fill="#E30A17" />
        <polygon points="17,10 18.5,7.5 21.5,8.5 19.5,10 21.5,11.5 18.5,12.5" fill="white" />
    </svg>
);

const UKFlag = () => (
    <svg viewBox="0 0 60 30" width="24" height="16" xmlns="http://www.w3.org/2000/svg">
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
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '6px', padding: '5px 10px',
                    cursor: 'pointer', color: 'white',
                    fontSize: '13px', fontWeight: 500,
                }}
            >
                {lang === 'tr' ? <TRFlag /> : <UKFlag />}
                <span>{lang === 'tr' ? 'TR' : 'EN'}</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    background: 'white', border: '1px solid #e5e7eb',
                    borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    overflow: 'hidden', zIndex: 1000, minWidth: '130px',
                }}>
                    {/* Türkçe seçeneği */}
                    <button
                        onClick={() => { setLang('tr'); setOpen(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            width: '100%', padding: '10px 14px',
                            background: lang === 'tr' ? '#f0faf0' : 'transparent',
                            border: 'none', cursor: 'pointer',
                            fontSize: '14px', color: '#111827', textAlign: 'left',
                            borderBottom: '1px solid #f3f4f6',
                        }}
                    >
                        <TRFlag />
                        <span>Türkçe</span>
                        {lang === 'tr' && <span style={{ marginLeft: 'auto', color: '#2D5A27' }}>✓</span>}
                    </button>

                    {/* English seçeneği */}
                    <button
                        onClick={() => { setLang('en'); setOpen(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            width: '100%', padding: '10px 14px',
                            background: lang === 'en' ? '#f0faf0' : 'transparent',
                            border: 'none', cursor: 'pointer',
                            fontSize: '14px', color: '#111827', textAlign: 'left',
                        }}
                    >
                        <UKFlag />
                        <span>English</span>
                        {lang === 'en' && <span style={{ marginLeft: 'auto', color: '#2D5A27' }}>✓</span>}
                    </button>
                </div>
            )}
        </div>
    );
}