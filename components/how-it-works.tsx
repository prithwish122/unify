"use client"

import { motion } from "framer-motion"
import { Inbox, Users, BarChart, ArrowRight } from "lucide-react"

export default function HowItWorks() {
  const phases = [
    {
      id: "01",
      title: "Unified Inbox Setup",
      subtitle: "Multi-Channel Message Aggregation",
      description:
        "Connect Twilio, WhatsApp, Email, and Social APIs to bring all your customer conversations into one central inbox. Simplify communication and reduce context-switching for your entire team.",
      details: [
        "Connect Twilio, WhatsApp, Email, and Social APIs",
        "Aggregate messages into a unified contact thread",
        "Enable search, filters, and channel badges",
      ],
      icon: Inbox,
    },
    {
      id: "02",
      title: "Team Collaboration & Automation",
      subtitle: "Shared Notes, Mentions, and Scheduling",
      description:
        "Collaborate with teammates in real time using shared notes and @mentions. Schedule outreach messages and automate follow-ups directly from the unified dashboard.",
      details: [
        "Real-time collaboration with @mentions and shared notes",
        "Schedule automated follow-ups and campaigns",
        "Manage contacts and view complete message history",
      ],
      icon: Users,
    },
    {
      id: "03",
      title: "Analytics & Insights",
      subtitle: "Performance Tracking & Optimization",
      description:
        "Gain full visibility into communication performance with analytics dashboards. Track response times, channel volume, and engagement metrics to improve efficiency and conversions.",
      details: [
        "Monitor response time and engagement metrics",
        "Compare performance across channels",
        "Export reports for performance reviews",
      ],
      icon: BarChart,
    },
  ]

  return (
    <section className="w-full py-40 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl text-white mb-6 tracking-tight">How It Works?</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Streamline every customer conversation with a unified, intelligent inbox
          </p>
        </motion.div>

        {/* Process Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 z-0">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="h-full bg-gradient-to-r from-transparent via-white/10 to-transparent origin-center"
            />
          </div>

          {phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative z-10"
            >
              {/* Glass Container */}
              <div className="relative h-full min-h-[500px] rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden p-8">
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-white/50 text-sm font-mono tracking-wider">PHASE {phase.id}</span>
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <phase.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3 tracking-tight">
                    {phase.title}
                  </h3>

                  <p className="text-base font-medium text-white/70 mb-6">
                    {phase.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
                    {phase.description}
                  </p>

                  {/* Details List */}
                  <div className="flex-1">
                    <ul className="space-y-3">
                      {phase.details.map((detail, detailIndex) => (
                        <motion.li
                          key={detailIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 + detailIndex * 0.1 + 0.8 }}
                          className="flex items-start gap-3 text-sm text-gray-400"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50 mt-2 flex-shrink-0" />
                          <span className="leading-relaxed">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Flow Arrow */}
              {index < phases.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-20">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 + 1.5 }}
                  >
                    <ArrowRight className="w-5 h-5 text-white/30" />
                  </motion.div>
                </div>
              )}

              {/* Mobile Flow Indicator */}
              {index < phases.length - 1 && (
                <div className="lg:hidden flex justify-center my-6">
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: index * 0.2 + 1 }}
                    className="w-px h-8 bg-white/20"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-medium text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30"
          >
            Launch Unified Inbox
          </motion.button>
          <p className="text-white/50 text-xs mt-3">
            Centralize, collaborate, and communicate smarter
          </p>
        </motion.div>
      </div>
    </section>
  )
}
