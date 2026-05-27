"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MetricsChartProps {
  dataPoints: number[];
  labels: string[];
  title: string;
}

export function MetricsChart({ dataPoints, labels, title }: MetricsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-40 w-full bg-muted animate-pulse" />;
  }

  const maxVal = Math.max(...dataPoints, 10);
  const minVal = 0;
  const range = maxVal - minVal;

  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 20;

  // Calculate coordinates
  const points = dataPoints.map((val, idx) => {
    const x = padding + (idx / (dataPoints.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((val - minVal) / range) * (chartHeight - padding * 2);
    return { x, y, val };
  });

  // Construct SVG path strings
  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : "";

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</h4>
        <span className="text-xs font-mono font-bold text-gold">Latest: {dataPoints[dataPoints.length - 1]}</span>
      </div>

      <div className="relative border border-border bg-card/50 p-2">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Area under curve */}
          {points.length > 0 && (
            <motion.path
              d={areaD}
              fill="url(#goldGradient)"
              opacity="0.15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Line path */}
          {points.length > 0 && (
            <motion.path
              d={pathD}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          )}

          {/* Interactive dots */}
          {points.map((p, idx) => (
            <g key={idx} className="group/dot cursor-pointer">
              <motion.circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="var(--background)"
                stroke="var(--gold)"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="8"
                fill="transparent"
                className="hover:fill-gold/10 transition-colors"
              />
            </g>
          ))}

          {/* Gradients definitions */}
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels bar */}
        <div className="flex justify-between px-4 mt-2 text-[8px] font-mono text-muted-foreground uppercase tracking-wider">
          {labels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
