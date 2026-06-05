import React, { useRef, useEffect } from 'react';

let earthFlyLine = null;
let worldGeoJson = null;

try {
  earthFlyLine = require('earth-flyline').default;
  worldGeoJson = require('../data/world.json');
} catch (error) {
  console.log('earth-flyline or world.json not found:', error);
}

let sharedChart = null;
let sharedHost = null;
let hiddenFragment = null;
let markerTimer = null;
let mountCount = 0;

const destroyChart = (chart) => {
  if (!chart) return;
  if (typeof chart.destroy === 'function') {
    chart.destroy();
  } else if (typeof chart.destory === 'function') {
    chart.destory();
  }
};

const hideSharedHost = () => {
  if (!sharedHost) return;
  if (!hiddenFragment) {
    hiddenFragment = document.createDocumentFragment();
  }
  if (sharedHost.parentNode) {
    hiddenFragment.appendChild(sharedHost);
  }
};

const showFallbackEarth = (host) => {
  if (!host) return;
  host.innerHTML = `
    <div style="
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: linear-gradient(45deg, #E3F2FD, #BBDEFB);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #424242;
      font-size: 14px;
      text-align: center;
      margin: 0 auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      animation: rotate 20s linear infinite;
    ">
      <div>
        <div style="font-size: 24px; margin-bottom: 10px;">🌍</div>
        <div>3D Globe</div>
      </div>
    </div>
    <style>
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>
  `;
};

const ensureSharedHost = () => {
  if (sharedHost) return sharedHost;
  sharedHost = document.createElement('div');
  sharedHost.style.width = '100%';
  sharedHost.style.height = '100%';
  sharedHost.style.minHeight = '300px';
  sharedHost.style.minWidth = '300px';
  return sharedHost;
};

const addCityMarkers = () => {
  if (!markerTimer) {
    markerTimer = setTimeout(() => {
      if (!sharedChart) return;
      try {
        sharedChart.addData('point', [
          { id: 1, lon: -74.0060, lat: 40.7128, style: { color: "#00FF00", size: 10, opacity: 1.0 }, name: "New York" },
          { id: 2, lon: -71.0589, lat: 42.3601, style: { color: "#00FF00", size: 10, opacity: 1.0 }, name: "Boston" },
          { id: 3, lon: -122.4194, lat: 37.7749, style: { color: "#00FF00", size: 10, opacity: 1.0 }, name: "San Francisco" },
        ]);
      } catch (error) {
        console.error('Error adding city markers:', error);
      }
    }, 1000);
  }
};

const initSharedChart = () => {
  if (!sharedHost || sharedChart) return true;

  const rect = sharedHost.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;

  if (!earthFlyLine) {
    showFallbackEarth(sharedHost);
    return true;
  }

  try {
    if (worldGeoJson) {
      earthFlyLine.registerMap("world", worldGeoJson);
    }

    sharedChart = earthFlyLine.init({
      dom: sharedHost,
      map: worldGeoJson ? "world" : undefined,
      autoRotate: true,
      rotateSpeed: 0.01,
      mode: "3d",
      limitFps: false,
      config: {
        R: 120,
        stopRotateByHover: false,
        bgStyle: { color: "#000000", opacity: 0 },
        earth: { color: "#0F172A" },
        mapStyle: { areaColor: "#F97316", lineColor: "#EA580C" },
        spriteStyle: { color: "#FFA726", show: true, size: 1.5 },
        enableZoom: false,
        pathStyle: { color: "#FFA726" },
        flyLineStyle: { color: "#FFA726" },
        scatterStyle: {
          color: "#FFFFFF",
          size: 40,
          opacity: 1.0,
          show: true,
          animate: true,
          duration: 1500
        },
      }
    });

    addCityMarkers();
    return true;
  } catch (error) {
    console.log('earth-flyline initialization failed:', error);
    showFallbackEarth(sharedHost);
    return true;
  }
};

const NetworkSphere = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    ensureSharedHost();
    const outer = containerRef.current;
    if (!outer || !sharedHost) return undefined;

    let animationFrameId = null;

    mountCount += 1;
    outer.appendChild(sharedHost);

    const initWhenSized = () => {
      if (initSharedChart()) return;
      animationFrameId = window.requestAnimationFrame(initWhenSized);
    };

    animationFrameId = window.requestAnimationFrame(initWhenSized);

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      mountCount -= 1;
      if (mountCount <= 0) hideSharedHost();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '300px', minWidth: '300px' }}
      />
    </div>
  );
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (markerTimer) clearTimeout(markerTimer);
    destroyChart(sharedChart);
    sharedChart = null;
    sharedHost = null;
    hiddenFragment = null;
    mountCount = 0;
  });
}

export default NetworkSphere;
