import React, { useRef, useEffect } from 'react';

let earthFlyLine = null;
let worldGeoJson = null;

try {
  earthFlyLine = require('earth-flyline').default;
  worldGeoJson = require('../data/world.json');
} catch (error) {
  console.log('earth-flyline or world.json not found:', error);
}

const NetworkSphere = () => {
  const containerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    const initEarthFlyline = () => {
      if (!earthFlyLine) {
        console.log('earth-flyline not loaded, using fallback');
        showFallbackEarth();
        return;
      }

      if (containerRef.current && !chartRef.current) {
        try {
          if (worldGeoJson) {
            earthFlyLine.registerMap("world", worldGeoJson);
          }

          chartRef.current = earthFlyLine.init({
            dom: containerRef.current,
            map: worldGeoJson ? "world" : undefined,
            autoRotate: true,
            rotateSpeed: 0.01,
            mode: "3d",
            limitFps: false,
            config: {
              R: 120,
              stopRotateByHover: false,
              
              bgStyle: {
                color: "#000000",
                opacity: 0
              },
              
              earth: {
                color: "#0F172A",
                material: "MeshPhongMaterial",
                dragConfig: {
                  rotationSpeed: 0,
                  inertiaFactor: 0,
                  disableX: true,
                  disableY: true,
                }
              },
              
              mapStyle: {
                areaColor: "#F97316",
                lineColor: "#EA580C"
              },
              
              spriteStyle: {
                color: "#FFA726",
                show: true,
                size: 1.5
              },
              
              enableZoom: false,
              
              pathStyle: {
                color: "#FFA726"
              },
              
              flyLineStyle: {
                color: "#FFA726"
              },
              
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

          // Add city markers with red colors
          setTimeout(() => {
            if (chartRef.current) {
              console.log('Adding city markers...');
              
              try {
                const pointData = [
                  {
                    id: 1,
                    lon: -74.0060, // New York
                    lat: 40.7128,
                    style: {
                      color: "#00FF00",
                      size: 10,
                      opacity: 1.0
                    },
                    name: "New York",
                    population: "8.4M"
                  },
                  {
                    id: 2,
                    lon: -71.0589, // Boston
                    lat: 42.3601,
                    style: {
                      color: "#00FF00",
                      size: 10,
                      opacity: 1.0
                    },
                    name: "Boston",
                    population: "685K"
                  },
                  {
                    id: 3,
                    lon: -122.4194, // San Francisco
                    lat: 37.7749,
                    style: {
                      color: "#00FF00",
                      size: 10,
                      opacity: 1.0
                    },
                    name: "San Francisco",
                    population: "874K"
                  }
                ];

                chartRef.current.addData('point', pointData);
                console.log('City markers added successfully!');
              } catch (error) {
                console.error('Error adding city markers:', error);
              }
            }
          }, 1000);

          console.log('🌍 3D Earth initialized successfully!');
        } catch (error) {
          console.log('earth-flyline initialization failed:', error);
          showFallbackEarth();
        }
      }
    };

    initEarthFlyline();

    return () => {
      if (chartRef.current && chartRef.current.destory) {
        chartRef.current.destory();
      }
    };
  }, []);

  const showFallbackEarth = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = `
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
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">
              Loading earth-flyline...
            </div>
          </div>
        </div>
        <style>
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        </style>
      `;
    }
  };

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

export default NetworkSphere;
