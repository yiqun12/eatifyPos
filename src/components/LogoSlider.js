import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import '../css/LogoSlider.css';

const partnerLogos = [
  { id: 1, name: 'Restaurant 1', image: '/images/1.jpg' },
  { id: 2, name: 'Restaurant 2', image: '/images/2.jpg' },
  { id: 3, name: 'Restaurant 3', image: '/images/3.jpg' },
  { id: 4, name: 'Restaurant 4', image: '/images/4.jpg' },
  { id: 5, name: 'Restaurant 5', image: '/images/5.jpg' },
  { id: 6, name: 'Restaurant 6', image: '/images/6.jpg' },
  { id: 7, name: 'Restaurant 7', image: '/images/7.jpg' },
  { id: 8, name: 'Restaurant 8', image: '/images/8.jpg' },
  { id: 9, name: 'Restaurant 9', image: '/images/9.jpg' },
  { id: 10, name: 'Restaurant 10', image: '/images/10.jpg' },
];

const LogoSlider = () => {
  const [logos, setLogos] = useState([...partnerLogos, ...partnerLogos]);
  const [position, setPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const speed = 1;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateGroupWidth = () => {
      const logoItems = container.querySelectorAll('.logo-item');
      if (logoItems.length === 0) return 0;

      let width = 0;
      for (let i = 0; i < partnerLogos.length; i++) {
        if (logoItems[i]) {
          const style = window.getComputedStyle(logoItems[i]);
          const marginLeft = parseInt(style.marginLeft || '0');
          const marginRight = parseInt(style.marginRight || '0');
          width += logoItems[i].offsetWidth + marginLeft + marginRight;
        }
      }
      return width;
    };

    const animate = () => {
      if (isPaused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      setPosition(prev => {
        const newPosition = prev - speed;

        const groupWidth = calculateGroupWidth();

        if (newPosition < -groupWidth * 0.5 && logos.length === partnerLogos.length * 2) {
          setLogos(prev => [...prev, ...partnerLogos]);
        }

        if (newPosition < -groupWidth) {
          setLogos(prev => prev.slice(partnerLogos.length));
          return newPosition + groupWidth;
        }

        return newPosition;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, logos]);

  return (
    <div className="bg-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-center text-2xl font-bold text-gray-900 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trusted by Leading Restaurants
        </motion.h2>

        <div
          className="relative overflow-hidden py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          ref={containerRef}
        >
          <div
            className="flex items-center"
            style={{ transform: `translateX(${position}px)` }}
          >
            {logos.map((logo, index) => (
              <div key={`${logo.id}-${index}`} className="flex-shrink-0 logo-item mx-10">
                <div className="logo-container">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="logo-image"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10"></div>
        </div>
      </div>
    </div>
  );
};

export default LogoSlider;
