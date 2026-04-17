"use client"

import { cn } from "@/lib/utils"

interface Gauge360Props {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
}

export function Gauge360({ value, size = 120, strokeWidth = 12, className, label }: Gauge360Props) {
  const pct = Math.max(0, Math.min(100, value || 0))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  const strokeColor = pct >= 100 ? "#16a34a" : pct >= 50 ? "#F5C800" : "#ef4444"

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-extrabold text-[#1E1E1E]">{Math.round(pct)}%</span>
        {label && (
          <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">{label}</span>
        )}
      </div>
    </div>
  )
}
