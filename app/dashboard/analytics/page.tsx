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

export default function AnalyticsDashboard() {
  const responseTimeData = [
    { time: "Mon", avg: 2.3 },
    { time: "Tue", avg: 2.1 },
    { time: "Wed", avg: 2.5 },
    { time: "Thu", avg: 2.0 },
    { time: "Fri", avg: 1.8 },
    { time: "Sat", avg: 3.2 },
    { time: "Sun", avg: 2.9 },
  ]

  const channelData = [
    { name: "WhatsApp", value: 4500 },
    { name: "SMS", value: 3200 },
    { name: "Email", value: 2800 },
  ]

  const COLORS = ["#4ade80", "#60a5fa", "#a78bfa"]

  const volumeData = [
    { date: "Jan", volume: 1200 },
    { date: "Feb", volume: 1900 },
    { date: "Mar", volume: 1500 },
    { date: "Apr", volume: 2200 },
    { date: "May", volume: 2800 },
    { date: "Jun", volume: 3200 },
  ]

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
              <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors text-sm">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                  <div className="text-white/70 text-sm font-medium">Avg Response Time</div>
                  <div className="text-white text-3xl font-bold mt-2">2.3 min</div>
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    -12% from last week
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                  <div className="text-white/70 text-sm font-medium">Total Messages</div>
                  <div className="text-white text-3xl font-bold mt-2">12,400</div>
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    +8% from last week
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                  <div className="text-white/70 text-sm font-medium">Active Contacts</div>
                  <div className="text-white text-3xl font-bold mt-2">847</div>
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    +15% from last week
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Average Response Time */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">Average Response Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
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
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Message Volume Trend */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6 lg:col-span-2">
                  <h3 className="text-white font-semibold mb-4">Message Volume Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Bar dataKey="volume" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
