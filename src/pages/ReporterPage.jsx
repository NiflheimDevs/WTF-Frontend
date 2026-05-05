import { useState, useEffect, useRef } from 'react'
import { Droplets, Truck, Plus, Minus, ChevronDown, Check, ArrowRight, Loader2, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'

// #backend-needed: replace with real API call
// import api from '../api/axios'

// #backend-needed: replace with real regions from GET /api/v1/regions
const MOCK_REGIONS = [
  { id: '1',  name: 'Mehrshahr',   district: 'West'  },
  { id: '2',  name: 'Eslamshahr',  district: 'West'  },
  { id: '3',  name: 'Shahriar',    district: 'West'  },
  { id: '4',  name: 'Karaj',       district: 'North' },
  { id: '5',  name: 'Andisheh',    district: 'North' },
  { id: '6',  name: 'Bahaddasht',  district: 'North' },
  { id: '7',  name: 'Varamin',     district: 'East'  },
  { id: '8',  name: 'Pakdasht',    district: 'East'  },
  { id: '9',  name: 'Robat Karim', district: 'South' },
  { id: '10', name: 'Boomehen',    district: 'South' },
]

// ── Region Dropdown ────────────────────────────────────────────────
function RegionDropdown({ value, onChange, error }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const inputRef            = useRef(null)
  const overlayRef          = useRef(null)

  const selected = MOCK_REGIONS.find(r => r.id === value)

  const filtered = search.trim()
    ? MOCK_REGIONS.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    : MOCK_REGIONS

  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.district]) acc[r.district] = []
    acc[r.district].push(r)
    return acc
  }, {})

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!overlayRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full h-11 px-3 flex items-center justify-between bg-neutral-0 rounded-md text-base font-sans cursor-pointer transition-colors duration-100 border ${error ? 'border-danger-fg' : 'border-neutral-200'} ${selected ? 'text-neutral-900 font-semibold' : 'text-neutral-400'}`}
      >
        <span>{selected ? selected.name : 'Select your region…'}</span>
        <ChevronDown size={16} className="text-neutral-500" />
      </button>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div
            ref={overlayRef}
            className="animate-slide-in-bottom w-full max-h-[70vh] bg-neutral-0 rounded-t-xl flex flex-col overflow-hidden shadow-overlay"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-9 h-1 rounded-full bg-neutral-300" />
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
              <input
                ref={inputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search region…"
                className="w-full h-10 px-3 border border-neutral-200 rounded-md text-base font-sans bg-neutral-50 text-neutral-700 outline-none"
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto pb-6">
              {Object.entries(grouped).map(([district, regions]) => (
                <div key={district}>
                  <div className="px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-400">
                    {district}
                  </div>
                  {regions.map(region => (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => { onChange(region.id); setOpen(false); setSearch('') }}
                      className={`w-full px-4 py-3 flex items-center justify-between border-none text-base font-sans cursor-pointer text-left transition-colors duration-100 ${value === region.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'bg-transparent text-neutral-700 font-normal'}`}
                    >
                      {region.name}
                      {value === region.id && <Check size={16} className="text-primary-500" />}
                    </button>
                  ))}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-neutral-500 text-sm">
                  No regions found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Need Type Selector ─────────────────────────────────────────────
function NeedTypeSelector({ value, onChange }) {
  const options = [
    { id: 'bottles', label: 'Water Bottles', icon: Droplets },
    { id: 'tanker',  label: 'Tanker Truck',  icon: Truck   },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(({ id, label, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`min-h-16 flex flex-col items-center justify-center gap-1.5 rounded-md text-sm font-medium font-sans cursor-pointer transition-all duration-[120ms] border-2 ${active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 bg-neutral-0 text-neutral-700'}`}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
            onMouseUp={e =>   { e.currentTarget.style.transform = 'scale(1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <Icon size={22} />
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Quantity Stepper ───────────────────────────────────────────────
function QuantityStepper({ value, onChange, needType }) {
  const max = needType === 'tanker' ? 5 : 50
  const min = 1

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`w-11 h-11 flex items-center justify-center border border-neutral-200 rounded-l-md bg-neutral-50 transition-colors duration-100 ${value <= min ? 'text-neutral-400 cursor-not-allowed' : 'text-neutral-700 cursor-pointer'}`}
      >
        <Minus size={16} />
      </button>

      <div className="w-16 h-11 flex items-center justify-center border-t border-b border-neutral-200 font-mono text-base font-medium text-neutral-900 bg-neutral-0">
        {value}
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`w-11 h-11 flex items-center justify-center border border-neutral-200 rounded-r-md bg-neutral-50 transition-colors duration-100 ${value >= max ? 'text-neutral-400 cursor-not-allowed' : 'text-neutral-700 cursor-pointer'}`}
      >
        <Plus size={16} />
      </button>

      <span className="ml-3 text-sm text-neutral-500">max {max}</span>
    </div>
  )
}

// ── Field Label ────────────────────────────────────────────────────
function Label({ children, optional }) {
  return (
    <label className="block mb-1.5 text-sm font-semibold text-neutral-700">
      {children}
      {optional && (
        <span className="ml-1.5 font-normal text-neutral-500 text-[13px]">(optional)</span>
      )}
    </label>
  )
}

// ── Field Error ────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-danger-fg">{message}</p>
}

// ── Success View ───────────────────────────────────────────────────
function SuccessView({ requestId, onReset }) {
  return (
    <div className="animate-fade-in flex flex-col items-center text-center px-6 py-12 gap-4">
      <div className="w-18 h-18 rounded-full bg-success-bg flex items-center justify-center">
        <Check size={36} className="text-success-fg" strokeWidth={2.5} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Request received</h2>
        <p className="text-sm text-neutral-500">
          A dispatcher has been notified — typical response is within 2 hours.
        </p>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-md px-5 py-2.5">
        <p className="text-[11px] text-neutral-400 uppercase tracking-widest mb-1">Your reference ID</p>
        <p className="font-mono text-lg font-medium text-neutral-900">{requestId}</p>
      </div>

      <button
        onClick={onReset}
        className="mt-2 bg-transparent border-none text-primary-500 text-sm font-semibold font-sans cursor-pointer underline"
      >
        Submit another request
      </button>
    </div>
  )
}

// ── Main Reporter Page ─────────────────────────────────────────────
export default function ReporterPage() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    document.documentElement.classList.remove('dark')
  }, [])

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lang, setLang]         = useState('en')

  const [region,   setRegion]   = useState('')
  const [needType, setNeedType] = useState('bottles')
  const [quantity, setQuantity] = useState(1)
  const [phone,    setPhone]    = useState('')
  const [note,     setNote]     = useState('')

  const [errors,    setErrors]    = useState({})
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [requestId, setRequestId] = useState(null)
  const [phoneWarn, setPhoneWarn] = useState(false)

  const textareaRef = useRef(null)

  useEffect(() => {
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 96) + 'px'
  }, [note])

  useEffect(() => { setQuantity(1) }, [needType])

  const handlePhoneChange = (val) => {
    setPhone(val)
    if (val.length > 0) {
      const cleaned = val.replace(/\D/g, '')
      setPhoneWarn(cleaned.length > 0 && cleaned.length !== 11)
    } else {
      setPhoneWarn(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!region) errs.region = 'Region is required.'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      // #backend-needed: replace with:
      // const res = await api.post('/requests', { region_id: region, need_type: needType, quantity, phone: phone || undefined, note: note || undefined })
      // setRequestId(res.data.id)
      await new Promise(r => setTimeout(r, 1200))
      setRequestId('REQ-' + Math.random().toString(36).slice(2, 6).toUpperCase())
      setSubmitted(true)
    } catch {
      toast.error('Could not submit your request. Please try again.', { duration: Infinity })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setRegion(''); setNeedType('bottles'); setQuantity(1)
    setPhone(''); setNote(''); setErrors({})
    setSubmitted(false); setRequestId(null)
  }

  const noteLen = note.length

  return (
    <div className="min-h-screen bg-neutral-0 flex flex-col font-sans">

      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-warning-bg border-b border-warning-fg px-4 py-1.5 flex items-center gap-2 text-sm text-warning-fg font-medium">
          <WifiOff size={14} />
          You're offline. Your request will be sent when connection returns.
        </div>
      )}

      {/* Top bar */}
      <header className="h-14 border-b border-neutral-200 flex items-center justify-between px-4 bg-neutral-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Droplets size={20} className="text-primary-500" />
          <span className="text-sm font-bold text-neutral-900">
            {lang === 'en' ? 'Water Supply' : 'سامانه گزارش آب'}
          </span>
        </div>
        <button
          onClick={() => setLang(l => l === 'en' ? 'fa' : 'en')}
          className="border border-neutral-200 rounded-md px-2.5 py-1 text-xs font-semibold text-neutral-500 bg-transparent cursor-pointer font-sans"
        >
          {lang === 'en' ? 'فا' : 'EN'}
        </button>
      </header>

      {/* Hero */}
      <div className="px-6 pt-10 pb-8 min-h-[30vh] flex flex-col justify-center">
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-neutral-900 mb-1.5">
          {lang === 'en' ? 'Report a water need' : 'گزارش نیاز آب'}
        </h1>
        <p className="text-base text-neutral-500 leading-relaxed mb-6">
          {lang === 'en'
            ? 'No login required. Takes 30 seconds. Help is dispatched fast.'
            : 'بدون نیاز به ورود. ۳۰ ثانیه. کمک سریع ارسال می‌شود.'}
        </p>
        <div className="flex items-center gap-1.5 text-neutral-400">
          <div className="w-px h-5 bg-neutral-300" />
          <span className="text-[11px] uppercase tracking-widest font-medium">Fill the form below</span>
        </div>
      </div>

      {/* Form card */}
      <main className="flex-1 px-4 pb-8 w-full max-w-lg mx-auto">
        <div className="bg-neutral-0 border border-neutral-200 rounded-lg p-6 shadow-card">
          {submitted ? (
            <SuccessView requestId={requestId} onReset={handleReset} />
          ) : (
            <div className="flex flex-col gap-5">

              {/* Region */}
              <div>
                <Label>Region</Label>
                <RegionDropdown
                  value={region}
                  onChange={val => { setRegion(val); setErrors(e => ({ ...e, region: null })) }}
                  error={errors.region}
                />
                <FieldError message={errors.region} />
              </div>

              {/* Need type */}
              <div>
                <Label>What do you need?</Label>
                <NeedTypeSelector value={needType} onChange={setNeedType} />
              </div>

              {/* Quantity */}
              <div>
                <Label>How many?</Label>
                <QuantityStepper value={quantity} onChange={setQuantity} needType={needType} />
              </div>

              {/* Phone */}
              <div>
                <Label optional>Phone number</Label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  placeholder="0912 345 6789"
                  className="w-full h-11 px-3 border border-neutral-200 rounded-md text-base font-sans bg-neutral-0 text-neutral-700 outline-none focus:border-primary-500 transition-colors duration-100 box-border"
                />
                {phoneWarn && (
                  <p className="mt-1 text-xs text-warning-fg">
                    Please enter a valid 11-digit Iranian phone number.
                  </p>
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  Your phone is only used to coordinate delivery.
                </p>
              </div>

              {/* Note */}
              <div>
                <Label optional>Additional note</Label>
                <textarea
                  ref={textareaRef}
                  value={note}
                  onChange={e => setNote(e.target.value.slice(0, 280))}
                  placeholder="Any details that help dispatchers…"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-md text-base font-sans bg-neutral-0 text-neutral-700 outline-none resize-none leading-relaxed focus:border-primary-500 transition-colors duration-100 box-border overflow-hidden"
                />
                {noteLen >= 240 && (
                  <p className={`mt-1 text-xs text-right ${noteLen >= 270 ? 'text-warning-fg' : 'text-neutral-500'}`}>
                    {noteLen}/280
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !isOnline}
                className={`w-full h-14 flex items-center justify-center gap-2 rounded-md text-[15px] font-semibold font-sans text-white border-none transition-colors duration-100 tracking-wide ${loading || !isOnline ? 'bg-primary-600 cursor-not-allowed' : 'bg-primary-500 cursor-pointer hover:bg-primary-600'}`}
                style={{ boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.1)' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                    SENDING…
                  </>
                ) : (
                  <>
                    {isOnline ? 'SUBMIT REQUEST' : 'OFFLINE'}
                    {isOnline && <ArrowRight size={16} />}
                  </>
                )}
              </button>

            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-[11px] text-neutral-400 uppercase tracking-widest font-medium border-t border-neutral-200">
        Provincial Crisis HQ · v1.0
      </footer>

    </div>
  )
}