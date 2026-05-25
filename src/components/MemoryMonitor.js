import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const INTERVAL_MS = 2000;
const LOG_SPIKE_MB = 10;
const WARN_GROWTH_MB = 5;

const formatMb = (bytes) => {
  if (bytes == null) return "N/A";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const readMemory = () => {
  if (typeof performance !== "undefined" && performance.memory) {
    return {
      supported: true,
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
    };
  }
  return { supported: false };
};

const MemoryMonitor = () => {
  const [collapsed, setCollapsed] = useState(false);
  const panelRef = useRef(null);
  const statsRef = useRef(null);
  const titleRef = useRef(null);
  const sparkRef = useRef(null);
  const lastUsedRef = useRef(null);
  const baselineRef = useRef(null);
  const peakRef = useRef(null);
  const samplesRef = useRef([]);

  useEffect(() => {
    if (!readMemory().supported) return undefined;

    const renderStats = (mem, delta, trendColor) => {
      if (!statsRef.current || !titleRef.current) return;

      const baseline = baselineRef.current;
      const growth = baseline == null ? 0 : mem.used - baseline;
      const growthMb = growth / 1024 / 1024;
      const deltaMb = delta / 1024 / 1024;

      titleRef.current.style.color = trendColor;
      if (panelRef.current) {
        panelRef.current.style.borderColor = trendColor;
      }

      statsRef.current.innerHTML = `
        <div>已用：${formatMb(mem.used)}</div>
        <div>总计：${formatMb(mem.total)}</div>
        <div>限制：${formatMb(mem.limit)}</div>
        <div>峰值：${formatMb(peakRef.current)}</div>
        <div style="color:${trendColor}">最后 ${INTERVAL_MS / 1000} 秒：${deltaMb >= 0 ? "+" : ""}${deltaMb.toFixed(1)} MB</div>
        <div style="color:${trendColor}">重置后的变化量：${growthMb >= 0 ? "+" : ""}${growthMb.toFixed(1)} MB</div>
        <div style="opacity:0.75;margin-top:4px;word-break:break-all">${window.location.pathname}</div>
      `;

      const samples = samplesRef.current;
      if (sparkRef.current && samples.length > 1) {
        const sparkWidth = 200;
        const sparkHeight = 36;
        const minSample = Math.min(...samples);
        const maxSample = Math.max(...samples);
        const range = Math.max(maxSample - minSample, 1024 * 1024);
        const points = samples
          .map((value, index) => {
            const x = samples.length <= 1 ? 0 : (index / (samples.length - 1)) * sparkWidth;
            const y = sparkHeight - ((value - minSample) / range) * sparkHeight;
            return `${x},${y}`;
          })
          .join(" ");
        sparkRef.current.innerHTML = `
          <polyline fill="none" stroke="${trendColor}" stroke-width="2" points="${points}" />
        `;
      }
    };

    const tick = () => {
      const mem = readMemory();
      if (!mem.supported) return;

      const prev = lastUsedRef.current;
      const delta = prev == null ? 0 : mem.used - prev;
      lastUsedRef.current = mem.used;

      if (baselineRef.current == null) {
        baselineRef.current = mem.used;
      }
      if (peakRef.current == null || mem.used > peakRef.current) {
        peakRef.current = mem.used;
      }

      samplesRef.current = [...samplesRef.current, mem.used].slice(-30);

      const growthMb = (mem.used - baselineRef.current) / 1024 / 1024;
      const deltaMb = delta / 1024 / 1024;
      let trendColor = "#22c55e";
      if (growthMb >= WARN_GROWTH_MB || deltaMb >= 3) trendColor = "#f59e0b";
      if (growthMb >= LOG_SPIKE_MB || deltaMb >= 8) trendColor = "#ef4444";

      renderStats(mem, delta, trendColor);

      if (prev != null && delta >= LOG_SPIKE_MB * 1024 * 1024) {
        console.warn(
          `[MemoryMonitor] +${formatMb(delta)} in ${INTERVAL_MS / 1000}s | used ${formatMb(mem.used)} | route ${window.location.pathname}`
        );
      }
    };

    tick();
    const timerId = setInterval(tick, INTERVAL_MS);
    return () => clearInterval(timerId);
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const resetBaseline = () => {
    const mem = readMemory();
    if (!mem.supported) return;
    baselineRef.current = mem.used;
    lastUsedRef.current = mem.used;
    peakRef.current = mem.used;
    samplesRef.current = [mem.used];
    console.info("[MemoryMonitor] baseline reset", formatMb(mem.used));
  };

  const panel = (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 99999,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12,
        lineHeight: 1.45,
        color: "#e5e7eb",
        background: "rgba(15, 23, 42, 0.92)",
        border: "1px solid #22c55e",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        minWidth: collapsed ? "auto" : 240,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px 0",
          gap: 8,
        }}
      >
        <strong ref={titleRef} style={{ color: "#22c55e" }}>Memory</strong>
        <div>
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              color: "#93c5fd",
              cursor: "pointer",
              padding: "2px 6px",
              fontSize: 11,
            }}
            onClick={resetBaseline}
          >
            reset
          </button>
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              color: "#93c5fd",
              cursor: "pointer",
              padding: "2px 6px",
              fontSize: 11,
            }}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? "open" : "hide"}
          </button>
        </div>
      </div>

      {!collapsed && readMemory().supported && (
        <div style={{ padding: "8px 12px 10px" }}>
          <div ref={statsRef} />
          <svg
            ref={sparkRef}
            width={200}
            height={36}
            style={{ marginTop: 8, display: "block" }}
            aria-hidden="true"
          />
        </div>
      )}

      {!readMemory().supported && (
        <div style={{ padding: "10px 12px" }}>
          MemoryMonitor: use Chrome DevTools Performance/Memory tab
        </div>
      )}
    </div>
  );

  return createPortal(panel, document.body);
};

export default MemoryMonitor;
