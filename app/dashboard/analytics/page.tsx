"use client"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, TrendingUp } from "lucide-react"
import Sidebar from "@/components/dashboard/sidebar"
import { useEffect, useMemo, useState } from "react"

export default function AnalyticsDashboard() {
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  )
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    avgResponseTime: number
    totalMessages: number
    activeContacts: number
    channelVolume: { channel: string; count: number }[]
    responseTimeData: { time: string; avg: number }[]
    messageVolumeDaily?: { date: string; count: number }[]
  }>({ avgResponseTime: 0, totalMessages: 0, activeContacts: 0, channelVolume: [], responseTimeData: [], messageVolumeDaily: [] })

  const COLORS = ["#4ade80", "#60a5fa", "#a78bfa", "#f472b6", "#f59e0b"]

  const formatDateLabel = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ startDate, endDate })
      const res = await fetch(`/api/analytics?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || json?.details || "Failed to load analytics")
      // Normalize responseTimeData time to label
      const rt = (json.responseTimeData || []).map((d: any) => ({
        time: typeof d.time === "string" ? d.time : new Date(d.time).toISOString().slice(0, 10),
        avg: d.avg,
      }))
      setData({
        avgResponseTime: json.avgResponseTime || 0,
        totalMessages: json.totalMessages || 0,
        activeContacts: json.activeContacts || 0,
        channelVolume: json.channelVolume || [],
        responseTimeData: rt,
        messageVolumeDaily: (json.messageVolumeDaily || []).map((d: any) => ({
          date: typeof d.date === "string" ? d.date : new Date(d.date).toISOString().slice(0, 10),
          count: d.count,
        })),
      })
    } catch (e: any) {
      setError(e?.message || "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  // Lightweight auto-refresh to keep numbers up to date
  useEffect(() => {
    const id = setInterval(() => {
      fetchAnalytics()
    }, 30000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  const channelData = useMemo(() => {
    return data.channelVolume.map((c) => ({ name: c.channel, value: c.count }))
  }, [data.channelVolume])

  const volumeData = useMemo(() => {
    if (data.messageVolumeDaily && data.messageVolumeDaily.length > 0) {
      return data.messageVolumeDaily.map((d) => ({ date: d.date, volume: d.count }))
    }
    return []
  }, [data.messageVolumeDaily])

  // Last 15 days line series (fill missing dates with 0)
  const volumeLast15Days = useMemo(() => {
    const end = new Date(endDate)
    const start = new Date(end)
    start.setDate(end.getDate() - 14)
    const map = new Map<string, number>()
    volumeData.forEach((d) => map.set(d.date.slice(0, 10), d.volume))
    const rows: { date: string; volume: number }[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10)
      rows.push({ date: key, volume: map.get(key) ?? 0 })
    }
    return rows
  }, [volumeData, endDate])

  const exportCSV = async () => {
    const params = new URLSearchParams({ format: "csv", type: "summary", startDate, endDate })
    // Let the browser handle the download via Content-Disposition
    const link = document.createElement("a")
    link.href = `/api/analytics/export?${params.toString()}`
    link.rel = "noopener"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="min-h-screen">
      {/* Fixed background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/20 px-6 py-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-white text-3xl font-bold">Analytics</h1>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  aria-label="Start date"
                />
                <span className="text-white/60">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  aria-label="End date"
                />
                <button
                  onClick={fetchAnalytics}
                  disabled={loading}
                  className="px-3 py-2 bg-black hover:bg-black/80 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                  <div className="text-white/70 text-sm font-medium">Avg Response Time</div>
                  <div className="text-white text-3xl font-bold mt-2">{data.avgResponseTime.toFixed(1)} min</div>
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    -12% from last week
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                  <div className="text-white/70 text-sm font-medium">Total Messages</div>
                  <div className="text-white text-3xl font-bold mt-2">{data.totalMessages}</div>
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    +8% from last week
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                  <div className="text-white/70 text-sm font-medium">Active Contacts</div>
                  <div className="text-white text-3xl font-bold mt-2">{data.activeContacts}</div>
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    +15% from last week
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Message Volume */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">Message Volume (Last 15 Days)</h3>
                  {volumeLast15Days.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-white/60 text-sm">
                      No messages in selected range
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={volumeLast15Days}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" tickFormatter={formatDateLabel} stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
                        <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.9)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          labelFormatter={(v) => formatDateLabel(String(v))}
                        />
                        <Line
                          type="monotone"
                          dataKey="volume"
                          name="Messages"
                          stroke="#a78bfa"
                          strokeWidth={2}
                          dot={{ fill: "#a78bfa", r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Channel Volume */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">Channel Volume</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => (
                          <text fill="white" fontSize={12}>
                            {name}
                          </text>
                        )}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        labelStyle={{ color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                        wrapperStyle={{ color: "#fff" }}
                        formatter={(value: any, name: any) => [String(value), String(name)]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Message Volume Trend */}
                {/* Removed bottom duplicate volume chart to avoid empty space */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
