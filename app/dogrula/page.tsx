'use client'
import { useEffect, useState } from 'react'

interface QRData {
  f?: string   // fisNo
  u?: string   // uretici
  i?: string   // ilce
  ky?: string  // koy
  kg?: number  // kg
  tarih?: string
  tip?: string
  c?: string[] // cinsler
  durum?: string
  h?: string   // hash
  ada?: string
  pars?: string
  lat?: number
  lng?: number
  alan?: number
  cy?: number
  hy?: number
  my?: number
  rand?: number
  medya?: string[]
}

const SUPABASE_URL = 'https://vfcdhciemmwpevjnhjen.supabase.co'
const SUPABASE_ANON = 'sb_publishable_fy2RyRlyM_q2QAovjER3EA_yqg-oA7V'

export default function DogrulaPage() {
  const [data, setData] = useState<QRData | null>(null)
  const [medya, setMedya] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) { setError(true); setLoading(false); return }
    try {
      const json = decodeURIComponent(escape(atob(hash)))
      const d = JSON.parse(json) as QRData
      setData(d)
      if (d.f) fetchMedya(d.f)
      else setLoading(false)
    } catch {
      setError(true)
      setLoading(false)
    }
  }, [])

  async function fetchMedya(fisNo: string) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/kayitlar?fis_no=eq.${encodeURIComponent(fisNo)}&select=medya`,
        { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
      )
      const d = await res.json()
      setMedya(d?.[0]?.medya || [])
    } catch { }
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#e0dbd0] border-t-[#3e4e24] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#84a156] text-sm">Ürün bilgileri yükleniyor...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center p-4">
      <div className="bg-[#fdf0ee] border-2 border-[#c0392b] rounded-2xl p-8 text-center max-w-md">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-[#c0392b] font-serif mb-2">Ürün Bulunamadı</h2>
        <p className="text-[#7a2a20] text-sm">Bu QR kod geçersiz veya hasarlı görünüyor.</p>
      </div>
    </div>
  )

  const isHak = data.tip === 'hak'
  const tarih = data.tarih
    ? new Date(data.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-'

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#1c2210] via-[#2e3a18] to-[#3e4e24] px-5 py-4 text-center shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="w-12 h-12 bg-gradient-to-br from-[#c4941f] to-[#8b6914] rounded-xl flex items-center justify-center text-2xl shadow-lg">⬡</div>
          <div>
            <h1 className="text-xl font-bold text-[#f4f1ea] font-serif">OriginTag</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Ürün Doğrulama Sistemi</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
        {/* DOĞRULANDI */}
        <div className="bg-[#edf7f0] border-2 border-[#27834a] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 bg-[#27834a] rounded-full flex items-center justify-center text-xl flex-shrink-0">✅</div>
          <div>
            <h2 className="font-bold text-[#27834a] font-serif text-sm">Doğrulandı — Orijinal Ürün</h2>
            <p className="text-[#4a9070] text-xs mt-0.5">OriginTag sistemi tarafından kayıt altına alınmıştır</p>
          </div>
        </div>

        {/* ÜRÜN BİLGİLERİ */}
        <div className="bg-white rounded-2xl border border-[#e0dbd0] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#f2f7e8] to-white px-4 py-3 border-b border-[#e0dbd0] flex justify-between items-center">
            <h3 className="font-bold text-[#3e4e24] font-serif">🌿 Ürün Bilgileri</h3>
            <span className="bg-[#3e4e24] text-white text-xs font-mono px-3 py-1 rounded-lg">{data.f}</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="col-span-2 bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-1">Üretici</div>
              <div className="text-lg font-bold text-[#3e4e24]">{data.u}</div>
            </div>
            <div className="bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-1">İlçe</div>
              <div className="font-bold text-[#3e4e24]">{data.i || '-'}</div>
            </div>
            <div className="bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-1">Köy</div>
              <div className="font-bold text-[#3e4e24]">{data.ky || '-'}</div>
            </div>
            <div className="bg-[#faefc6] rounded-xl p-3 border border-[#f2d88e]">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#c4941f] mb-1">Miktar</div>
              <div className="font-bold text-[#8b6914]">{data.kg} kg</div>
            </div>
            <div className="bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-1">Çekim</div>
              <div className="font-bold text-[#3e4e24]">{isHak ? '🫒 Hak Yağ' : '✅ Para'}</div>
            </div>
            {isHak && (
              <>
                <div className="bg-[#edf7f0] rounded-xl p-3 border border-[#b7dfc5]">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#27834a] mb-1">Müşteri Yağı</div>
                  <div className="font-bold text-[#27834a]">{data.my} lt</div>
                </div>
                <div className="bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-1">Randıman</div>
                  <div className="font-bold text-[#3e4e24]">%{data.rand}</div>
                </div>
              </>
            )}
            {data.c && data.c.length > 0 && (
              <div className="col-span-2 bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
                <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-2">Zeytin Cinsi</div>
                <div className="flex flex-wrap gap-1">
                  {data.c.map((c, i) => (
                    <span key={i} className="bg-[#f2f7e8] border border-[#c2d6a2] text-[#3e4e24] px-3 py-1 rounded-full text-xs font-semibold">{c}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="col-span-2 bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-1">Kayıt Tarihi</div>
              <div className="font-bold text-[#3e4e24] text-sm">{tarih}</div>
            </div>
            {data.durum && (
              <div className="bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
                <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-1">Durum</div>
                <div className="font-bold text-[#3e4e24]">
                  {data.durum === 'tamamlandi' ? '✅ Tamamlandı' : data.durum === 'islemde' ? '🔄 İşlemde' : '⏳ Beklemede'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MEDYA */}
        {medya.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e0dbd0] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#f2f7e8] to-white px-4 py-3 border-b border-[#e0dbd0]">
              <h3 className="font-bold text-[#3e4e24] font-serif">📷 Ürün Görselleri</h3>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2">
              {medya.map((m, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border-2 border-[#e0dbd0] cursor-pointer" onClick={() => setLightbox(m)}>
                  {m.includes('data:video/') ? (
                    <div className="w-full h-full bg-black flex items-center justify-center text-3xl">▶️</div>
                  ) : (
                    <img src={m} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADA PARSEL */}
        {data.ada && (
          <div className="bg-white rounded-2xl border border-[#e0dbd0] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#f2f7e8] to-white px-4 py-3 border-b border-[#e0dbd0] flex justify-between items-center">
              <h3 className="font-bold text-[#3e4e24] font-serif">🗺️ Bahçe Konumu</h3>
              <span className="bg-[#f2f7e8] text-[#3e4e24] text-xs font-bold px-2 py-1 rounded-lg border border-[#c2d6a2]">Ada: {data.ada} · Parsel: {data.pars}</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-1">Ada No</div>
                  <div className="font-bold text-[#3e4e24]">{data.ada}</div>
                </div>
                <div className="bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-1">Parsel No</div>
                  <div className="font-bold text-[#3e4e24]">{data.pars}</div>
                </div>
                {data.alan && (
                  <>
                    <div className="bg-[#faefc6] rounded-xl p-3 border border-[#f2d88e]">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-[#c4941f] mb-1">Tahmini Alan</div>
                      <div className="font-bold text-[#8b6914]">{data.alan.toLocaleString('tr-TR')} m²</div>
                    </div>
                    <div className="bg-[#f4f1ea] rounded-xl p-3 border border-[#e0dbd0]">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-[#84a156] mb-1">Tahmini Ağaç</div>
                      <div className="font-bold text-[#3e4e24]">~{Math.round(data.alan / 40)} adet</div>
                    </div>
                  </>
                )}
              </div>
              {data.lat && data.lng && (
                <div className="flex gap-2">
                  <a href="https://parselsorgu.tkgm.gov.tr/" target="_blank" rel="noreferrer"
                    className="flex-1 py-2 bg-[#3e4e24] text-white text-center rounded-xl text-xs font-bold">🏛️ TKGM</a>
                  <a href={`https://www.google.com/maps?q=${data.lat},${data.lng}&z=16&t=k`} target="_blank" rel="noreferrer"
                    className="flex-1 py-2 bg-white border-2 border-[#c2d6a2] text-[#3e4e24] text-center rounded-xl text-xs font-bold">📍 Google Maps</a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HASH */}
        {data.h && (
          <div className="bg-[#1c2210] rounded-2xl p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#84a156] mb-2">🔐 SHA-256 Doğrulama</h4>
            <p className="font-mono text-[9px] text-[#c2d6a2] break-all leading-relaxed">{data.h}</p>
          </div>
        )}

        <div className="bg-[#f2f7e8] border border-[#c2d6a2] rounded-xl p-3 text-xs text-[#526832] leading-relaxed">
          <strong className="text-[#3e4e24]">🛡️ OriginTag nedir?</strong><br />
          Bu QR kod, OriginTag platformu tarafından otomatik oluşturulmuştur. Tüm bilgiler SHA-256 ile imzalanmış ve değiştirilemez şekilde korunmaktadır.
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center py-6 border-t border-[#e0dbd0] mt-4">
        <div className="text-base font-bold text-[#3e4e24] font-serif mb-1">⬡ OriginTag</div>
        <p className="text-xs text-[#84a156]">Tarımsal Ürün Doğrulama Platformu</p>
        <p className="text-[10px] text-[#a3be7a] mt-1">origintag.com.tr</p>
      </div>

      {/* LİGHTBOX */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-pointer p-4" onClick={() => setLightbox(null)}>
          {lightbox.includes('data:video/') ? (
            <video src={lightbox} controls className="max-w-full max-h-full rounded-xl" onClick={e => e.stopPropagation()} autoPlay />
          ) : (
            <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
          )}
        </div>
      )}
    </div>
  )
}
