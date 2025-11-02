/**
 * Enhanced Analytics Dashboard - Uses real API data
 */

"use client"

import { useState } from "react"
import Sidebar from "@/components/dashboard/sidebar"
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
import { Download, TrendingUp, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" })

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append("startDate", dateRange.startDate)
      if (dateRange.endDate) params.append("endDate", dateRange.endDate)

      const res = await fetch(`/api/analytics?${params}`)
      if (!res.ok) throw new Error("Failed to fetch analytics")
      return res.json()
    },
  })

  const handleExport = async () => {
    try {
      const data = analyticsData || {}
      const csv = [
        ["Metric", "Value"],
        ["Average Response Time (min)", data.avgResponseTime || 0],
        ["Total Messages", data.totalMessages || 0],
        ["Active Contacts", data.activeContacts || 0],
        ...(data.channelVolume || []).map((item: any) => [`${item.channel} Volume`, item.count]),
      ]
        .map((row) => row.join(","))
        .join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export report")
    }
  }

  const responseTimeData = analyticsData?.responseTimeData || []
  const channelData = (analyticsData?.channelVolume || []).map((item: any) => ({
    name: item.channel,
    value: item.count,
  }))

  const COLORS = ["#4ade80", "#60a5fa", "#a78bfa", "#fbbf24", "#ec4899"]

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
            <div className="flex items-center justify-between">
              <h1 className="text-white text-3xl font-bold">Analytics</h1>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <p className="text-white/70 ml-4">Loading analytics...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                    <div className="text-white/70 text-sm font-medium">Avg Response Time</div>
                    <div className="text-white text-3xl font-bold mt-2">
                      {analyticsData?.avgResponseTime || 0} min
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                      <TrendingUp className="w-3 h-3" />
                      Real-time data
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                    <div className="text-white/70 text-sm font-medium">Total Messages</div>
                    <div className="text-white text-3xl font-bold mt-2">{analyticsData?.totalMessages || 0}</div>
                    <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                      <TrendingUp className="w-3 h-3" />
                      All channels
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                    <div className="text-white/70 text-sm font-medium">Active Contacts</div>
                    <div className="text-white text-3xl font-bold mt-2">{analyticsData?.activeContacts || 0}</div>
                    <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                      <TrendingUp className="w-3 h-3" />
                      Last 30 days
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Average Response Time */}
                  {responseTimeData.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                      <h3 className="text-white font-semibold mb-4">Average Response Time</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={responseTimeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis
                            dataKey="time"
                            stroke="rgba(255,255,255,0.5)"
                            style={{ fontSize: "12px" }}
                            tickFormatter={(value) => format(new Date(value), "MMM d")}
                          />
                          <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(0,0,0,0.8)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#fff" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="avg"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            dot={{ fill: "#60a5fa", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Channel Volume */}
                  {channelData.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                      <h3 className="text-white font-semibold mb-4">Channel Volume</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={channelData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {channelData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(0,0,0,0.8)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#fff" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

