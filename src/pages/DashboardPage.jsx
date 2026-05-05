import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Droplets, LayoutDashboard, List, MapPin, Settings,
  Sun, Moon, RefreshCw, LogOut, ChevronDown, Menu, X,
  TrendingUp, TrendingDown, Minus, Clock, Loader2,
  Truck, AlertCircle, CheckCircle, XCircle, Filter
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// #backend-needed: replace all MOCK_* data with real React Query hooks:
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import api from '../api/axios'

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_KPI = {
  requestsToday:  247,
  pendingNow:      38,
  dispatchedToday: 142,
  avgResponseMin:  54,
  yesterdayTotal:  220,
  sparkline: [12, 18, 24, 31, 28, 35, 42, 38, 45, 51, 48, 55, 60, 58, 63, 57, 61, 65, 70, 68, 72, 75, 71, 69],
}

const MOCK_REGIONS = [
  { id: '1', name: 'Mehrshahr',   pending: 42 },
  { id: '2', name: 'Eslamshahr',  pending: 31 },
  { id: '3', name: 'Shahriar',    pending: 28 },
  { id: '4', name: 'Karaj',       pending: 21 },
  { id: '5', name: 'Andisheh',    pending: 17 },
  { id: '6', name: 'Varamin',     pending: 14 },
  { id: '7', name: 'Pakdasht',    pending: 9  },
  { id: '8', name: 'Boomehen',    pending: 6  },
]

const MOCK_BREAKDOWN = [
  { type: 'bottles', label: 'Water Bottles', icon: '💧', count: 184, quantity: 1240 },
  { type: 'tanker',  label: 'Tanker Truck',  icon: '🚛', count: 63,  quantity: 63   },
]

const generateMockRequests = () => [
  { id: 'A4F2K', region: 'Mehrshahr',  needType: 'tanker',  qty: 1,  status: 'pending',    submittedAt: new Date(Date.now() - 2 * 60000) },
  { id: 'A4E9M', region: 'Eslamshahr', needType: 'bottles', qty: 12, status: 'dispatched',  submittedAt: new Date(Date.now() - 8 * 60000) },
  { id: 'A4D3R', region: 'Shahriar',   needType: 'bottles', qty: 6,  status: 'fulfilled',   submittedAt: new Date(Date.now() - 14 * 60000) },
  { id: 'A4C1P', region: 'Karaj',      needType: 'tanker',  qty: 2,  status: 'pending',    submittedAt: new Date(Date.now() - 22 * 60000) },
  { id: 'A4B8Q', region: 'Andisheh',   needType: 'bottles', qty: 24, status: 'dispatched',  submittedAt: new Date(Date.now() - 35 * 60000) },
  { id: 'A4A5T', region: 'Varamin',    needType: 'bottles', qty: 8,  status: 'cancelled',   submittedAt: new Date(Date.now() - 48 * 60000) },
  { id: 'A3Z2W', region: 'Pakdasht',   needType: 'tanker',  qty: 1,  status: 'pending',    submittedAt: new Date(Date.now() - 61 * 60000) },
  { id: 'A3Y9V', region: 'Boomehen',   needType: 'bottles', qty: 18, status: 'fulfilled',   submittedAt: new Date(Date.now() - 75 * 60000) },
  { id: 'A3X6U', region: 'Mehrshahr',  needType: 'tanker',  qty: 3,  status: 'pending',    submittedAt: new Date(Date.now() - 90 * 60000) },
  { id: 'A3W3S', region: 'Eslamshahr', needType: 'bottles', qty: 30, status: 'dispatched',  submittedAt: new Date(Date.now() - 110 * 60000) },
]

// ── Helpers ────────────────────────────────────────────────────────
function relativeTime(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function useTheme() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'dark'
  )
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
    if (next === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }
  return { theme, toggle }
}

function useClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// ── Sparkline SVG ──────────────────────────────────────────────────
function Sparkline({ data }) {
  const w = 120, h = 32
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * h
  ])
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={d} fill="none" stroke="var(--color-primary-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Status Badge ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:    { label: 'Pending',    cls: 'bg-warning-bg  text-warning-fg'  },
    dispatched: { label: 'Dispatched', cls: 'bg-info-bg     text-info-fg'     },
    fulfilled:  { label: 'Fulfilled',  cls: 'bg-success-bg  text-success-fg'  },
    cancelled:  { label: 'Cancelled',  cls: 'bg-danger-bg   text-danger-fg'   },
  }
  const { label, cls } = map[status] || map.pending
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-shimmer rounded-md ${className}`} />
}

// ── KPI Card ───────────────────────────────────────────────────────
function KpiCard({ label, value, caption, delta, sparkline, intent = 'default', loading }) {
  const intentColor = {
    default: 'text-neutral-900',
    warning: 'text-warning-fg',
    danger:  'text-danger-fg',
  }
  if (loading) return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 flex flex-col gap-3">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 flex flex-col gap-2">
      {/* Label + delta */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-400">{label}</span>
        {delta && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${delta.direction === 'up' ? 'text-success-fg' : delta.direction === 'down' ? 'text-danger-fg' : 'text-neutral-400'}`}>
            {delta.direction === 'up' ? <TrendingUp size={12} /> : delta.direction === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
            {delta.value > 0 ? '+' : ''}{delta.value}%
          </span>
        )}
      </div>

      {/* Value */}
      <p className={`font-mono text-5xl font-bold tabular-nums leading-none ${intentColor[intent]}`}>
        {value}
      </p>

      {/* Sparkline */}
      {sparkline && <Sparkline data={sparkline} />}

      {/* Caption */}
      {caption && <p className="text-[13px] text-neutral-500">{caption}</p>}
    </div>
  )
}

// ── Region Rank List ───────────────────────────────────────────────
function RegionRankList({ regions, loading }) {
  const max = regions[0]?.pending || 1
  if (loading) return (
    <div className="flex flex-col gap-3">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
    </div>
  )
  return (
    <div className="flex flex-col gap-1">
      {regions.map((r, i) => (
        <div key={r.id} className="flex items-center gap-3 py-1.5 rounded-md px-2 hover:bg-neutral-100 transition-colors duration-100 cursor-pointer">
          <span className="font-mono text-xs text-neutral-400 w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
          <span className="text-sm text-neutral-700 w-28 truncate shrink-0">{r.name}</span>
          <div className="flex-1 bg-neutral-200 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(r.pending / max) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs text-neutral-900 w-6 text-right shrink-0">{r.pending}</span>
        </div>
      ))}
    </div>
  )
}

// ── Need Type Breakdown ────────────────────────────────────────────
function NeedTypeBreakdown({ data, loading }) {
  const max = Math.max(...data.map(d => d.count))
  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
  return (
    <div className="flex flex-col gap-4">
      {data.map(item => (
        <div key={item.type} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium text-neutral-700">{item.label}</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-base font-semibold text-neutral-900">{item.count}</span>
              <span className="text-xs text-neutral-400 ml-1">requests</span>
            </div>
          </div>
          <div className="bg-neutral-200 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
          <p className="text-xs text-neutral-400">Total quantity: {item.quantity.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}

// ── Action Button ──────────────────────────────────────────────────
function ActionButton({ status, requestId, onUpdate }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading]       = useState(false)

  if (status === 'fulfilled' || status === 'cancelled') {
    return <span className="text-neutral-400 text-sm">—</span>
  }

  const action = status === 'pending'
    ? { label: 'Dispatch',       next: 'dispatched', cls: 'bg-info-bg text-info-fg hover:bg-primary-50' }
    : { label: 'Mark Fulfilled', next: 'fulfilled',  cls: 'bg-success-bg text-success-fg hover:bg-success-bg' }

  if (confirming) return (
    <div className="flex items-center gap-1">
      <button
        onClick={async () => {
          setLoading(true)
          setConfirming(false)
          try {
            // #backend-needed: replace with:
            // await api.patch(`/requests/${requestId}/status`, { status: action.next })
            await new Promise(r => setTimeout(r, 600))
            onUpdate(requestId, action.next)
            toast.success(`Request ${requestId} ${action.next}.`)
          } catch {
            toast.error("Couldn't update status. Try again.", { duration: Infinity })
          } finally {
            setLoading(false)
          }
        }}
        className="text-xs font-semibold text-success-fg bg-success-bg border-none rounded px-2 py-1 cursor-pointer"
      >
        {loading ? <Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> : 'Confirm'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="text-xs font-semibold text-neutral-500 bg-transparent border-none cursor-pointer px-1"
      >
        Cancel
      </button>
    </div>
  )

  return (
    <button
      onClick={() => setConfirming(true)}
      className={`text-xs font-semibold rounded-md px-2.5 py-1 border-none cursor-pointer transition-colors duration-100 font-sans whitespace-nowrap ${action.cls}`}
    >
      {action.label}
    </button>
  )
}

// ── Requests Table ─────────────────────────────────────────────────
function RequestsTable({ requests, onUpdate, loading, filter, onFilterChange }) {
  const statuses = ['all', 'pending', 'dispatched', 'fulfilled', 'cancelled']

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  if (loading) return (
    <div className="flex flex-col gap-2">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
    </div>
  )

  return (
    <div>
      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter size={14} className="text-neutral-400" />
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => onFilterChange(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border-none cursor-pointer font-sans capitalize transition-colors duration-100
              ${filter === s ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              {['ID', 'Region', 'Need', 'Qty', 'Status', 'Submitted', 'Action'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <AlertCircle size={24} />
                    <p className="text-sm font-medium">No requests match these filters</p>
                    <button
                      onClick={() => onFilterChange('all')}
                      className="text-xs text-primary-500 font-semibold bg-transparent border-none cursor-pointer font-sans underline"
                    >
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : filtered.map(req => (
              <tr
                key={req.id}
                className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors duration-100 cursor-pointer"
              >
                <td className="px-4 py-3 font-mono text-xs text-neutral-400">{req.id}</td>
                <td className="px-4 py-3 text-neutral-700 font-medium max-w-[120px] truncate">{req.region}</td>
                <td className="px-4 py-3 text-base" title={req.needType}>
                  {req.needType === 'bottles' ? '💧' : '🚛'}
                </td>
                <td className="px-4 py-3 font-mono text-neutral-700 text-right">{req.qty}</td>
                <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                <td className="px-4 py-3 text-xs text-neutral-500 font-mono whitespace-nowrap" title={req.submittedAt.toLocaleString()}>
                  {relativeTime(req.submittedAt)}
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <ActionButton status={req.status} requestId={req.id} onUpdate={onUpdate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-neutral-400 text-right font-mono">
        Showing {filtered.length} of {requests.length} requests
      </p>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────
function Sidebar({ activeNav, onNav, user, onLogout, collapsed }) {
  const navItems = [
    { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
    { id: 'requests',  label: 'Requests',  icon: List            },
    { id: 'regions',   label: 'Regions',   icon: MapPin          },
    { id: 'settings',  label: 'Settings',  icon: Settings        },
  ]

  return (
    <aside className={`fixed top-0 left-0 h-full bg-neutral-50 border-r border-neutral-200 flex flex-col z-20 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-neutral-200 shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary-500 flex items-center justify-center shrink-0">
          <Droplets size={15} color="white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm text-neutral-900 whitespace-nowrap">WaterOps</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeNav === id
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium font-sans border-none cursor-pointer transition-colors duration-100 text-left
                ${active
                  ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-500'
                  : 'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-neutral-200 pt-3">
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-700 truncate">{user?.name || 'Dispatcher'}</p>
              <p className="text-[11px] text-neutral-400 truncate">{user?.email || ''}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              className="text-neutral-400 hover:text-danger-fg bg-transparent border-none cursor-pointer p-1 transition-colors duration-100"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

// ── Top Bar ────────────────────────────────────────────────────────
function TopBar({ activeNav, theme, onThemeToggle, onMenuToggle, onRefresh, refreshing, sidebarCollapsed }) {
  const clock = useClock()
  const breadcrumb = { overview: 'Overview', requests: 'Requests', regions: 'Regions', settings: 'Settings' }

  return (
    <header
      className="fixed top-0 right-0 h-14 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between px-4 z-10 transition-all duration-200"
      style={{ left: sidebarCollapsed ? 64 : 240 }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="text-neutral-400 hover:text-neutral-700 bg-transparent border-none cursor-pointer p-1 lg:hidden"
        >
          <Menu size={18} />
        </button>
        <span className="text-sm text-neutral-400">Dispatch</span>
        <span className="text-neutral-300">›</span>
        <span className="text-sm font-semibold text-neutral-700 capitalize">{breadcrumb[activeNav]}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-success-fg animate-pulse-dot" />
          Live
        </div>

        {/* Clock */}
        <span className="font-mono text-sm text-neutral-500 hidden sm:block">{clock}</span>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="text-neutral-400 hover:text-neutral-700 bg-transparent border-none cursor-pointer p-1 transition-colors duration-100"
          title="Refresh data"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="text-neutral-400 hover:text-neutral-700 bg-transparent border-none cursor-pointer p-1 transition-colors duration-100"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const { theme, toggle } = useTheme()

  const [activeNav,   setActiveNav]   = useState('overview')
  const [collapsed,   setCollapsed]   = useState(false)
  const [refreshing,  setRefreshing]  = useState(false)
  const [kpiLoading,  setKpiLoading]  = useState(true)
  const [tableLoading,setTableLoading]= useState(true)
  const [requests,    setRequests]    = useState([])
  const [filter,      setFilter]      = useState('all')

  // Force dark theme on mount (dashboard default)
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    document.documentElement.setAttribute('data-theme', saved)
    if (saved === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [])

  // Simulate initial data load
  useEffect(() => {
    const t1 = setTimeout(() => { setKpiLoading(false) }, 800)
    const t2 = setTimeout(() => { setRequests(generateMockRequests()); setTableLoading(false) }, 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // #backend-needed: replace above with React Query:
  // const { data: kpiData,  isLoading: kpiLoading  } = useQuery({ queryKey: ['metrics'], queryFn: () => api.get('/metrics/summary').then(r => r.data), refetchInterval: 30000 })
  // const { data: requests, isLoading: tableLoading } = useQuery({ queryKey: ['requests'], queryFn: () => api.get('/requests').then(r => r.data), refetchInterval: 15000 })

  const handleRefresh = async () => {
    setRefreshing(true)
    // #backend-needed: invalidate React Query cache here
    await new Promise(r => setTimeout(r, 800))
    setRefreshing(false)
    toast.success('Data refreshed.')
  }

  const handleUpdateStatus = useCallback((id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    // #backend-needed: also call queryClient.invalidateQueries(['requests'])
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/dispatcher/login', { replace: true })
  }

  const avgIntent = MOCK_KPI.avgResponseMin < 60 ? 'default' : MOCK_KPI.avgResponseMin < 180 ? 'warning' : 'danger'
  const delta = Math.round(((MOCK_KPI.requestsToday - MOCK_KPI.yesterdayTotal) / MOCK_KPI.yesterdayTotal) * 100)

  return (
    <div className="min-h-screen bg-neutral-0 font-sans">

      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNav={setActiveNav}
        user={user}
        onLogout={handleLogout}
        collapsed={collapsed}
      />

      {/* Top bar */}
      <TopBar
        activeNav={activeNav}
        theme={theme}
        onThemeToggle={toggle}
        onMenuToggle={() => setCollapsed(c => !c)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        sidebarCollapsed={collapsed}
      />

      {/* Main canvas */}
      <main
        className="pt-14 min-h-screen transition-all duration-200"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Dispatch Overview</h1>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                Last updated: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border-none rounded-md px-3 py-2 cursor-pointer transition-colors duration-100 font-sans"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Requests Today"
              value={MOCK_KPI.requestsToday}
              delta={{ value: delta, direction: delta >= 0 ? 'up' : 'down' }}
              sparkline={MOCK_KPI.sparkline}
              caption={`vs. ${MOCK_KPI.yesterdayTotal} yesterday`}
              loading={kpiLoading}
            />
            <KpiCard
              label="Pending Right Now"
              value={MOCK_KPI.pendingNow}
              intent={MOCK_KPI.pendingNow > 50 ? 'danger' : MOCK_KPI.pendingNow > 20 ? 'warning' : 'default'}
              caption="Needs dispatch attention"
              loading={kpiLoading}
            />
            <KpiCard
              label="Dispatched Today"
              value={MOCK_KPI.dispatchedToday}
              caption="Relief shipments sent"
              loading={kpiLoading}
            />
            <KpiCard
              label="Avg Response Time"
              value={`${MOCK_KPI.avgResponseMin}m`}
              intent={avgIntent}
              caption={avgIntent === 'default' ? 'Within target' : avgIntent === 'warning' ? 'Above target' : 'Critical delay'}
              loading={kpiLoading}
            />
          </div>

          {/* Secondary panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Top Regions by Pending Need</h2>
              <RegionRankList regions={MOCK_REGIONS} loading={kpiLoading} />
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Breakdown by Need Type</h2>
              <NeedTypeBreakdown data={MOCK_BREAKDOWN} loading={kpiLoading} />
            </div>
          </div>

          {/* Requests table */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Recent Requests</h2>
            <RequestsTable
              requests={requests}
              onUpdate={handleUpdateStatus}
              loading={tableLoading}
              filter={filter}
              onFilterChange={setFilter}
            />
          </div>

        </div>
      </main>
    </div>
  )
}