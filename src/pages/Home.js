import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar_new';
import Hero from '../components/Hero_new';
import Features from '../components/Features';
import Gallery from '../components/Gallery';
import VideoTutorials from '../components/VideoTutorials';
import LogoSlider from '../components/LogoSlider';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer_new';
import AIChat from '../components/AIChat';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RoadTimeline from '../components/RoadTimeline.tsx';
import Map from '../components/Map.js';

gsap.registerPlugin(ScrollTrigger);

const Food = () => {
  const sectionsRef = useRef([]);

  useEffect(() => {
    // Animate sections on scroll
    sectionsRef.current.forEach((section) => {
      gsap.fromTo(
        section,
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div>
      <Navbar />
      <Hero />

      <div ref={addToRefs}>
        <Features />
      </div>
      <div ref={addToRefs}>
        <Gallery />
      </div>
      <div ref={addToRefs}>
        <VideoTutorials />
      </div>

      {/* Side Features Section */}
      <section ref={addToRefs} className="py-16 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Tools Built for Developers</h2>
            <p className="section-subtitle">
              Easy-to-use APIs for integrating customized features into your systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Menu Scanner Tool */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Menu Scanner</h3>
                <p className="text-gray-600 mb-4">
                  Easily convert physical menus into structured JSON with image recognition. Perfect for developers needing quick menu digitization via API.
                </p>
                <Link
                  to="/scan"
                  className="inline-block px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Try Scanner
                </Link>
              </div>
            </div>

            {/* SMS API Tool */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">SMS Notification API</h3>
                <p className="text-gray-600 mb-4">
                  Integrate instant SMS updates into your app—order status, promotions, and more. Designed for fast, frictionless communication with minimal delays.
                </p>
                <Link
                  to="/sendmessage"
                  className="inline-block px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Explore SMS API
                </Link>
              </div>
            </div>

            {/* Orders Management Tool */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">On-Demand Delivery API</h3>
                <p className="text-gray-600 mb-4">
                  Programmatically request delivery with simple pricing—$8 base + $1 per mile, up to 15 miles. No contract or subscription required.
                  Reach us at <a href="mailto:admin@eatifydash.com">admin@eatifydash.com</a> to get started.

                </p>
                <a
                  href="mailto:admin@eatifydash.com?subject=Delivery%20API%20Request&body=Hello,%0A%0AI'm%20interested%20in%20your%20on-demand%20delivery%20service.%20Please%20provide%20me%20with%20more%20information.%0A%0ABusiness%20Name:%20%0ALocation:%20%0AAverage%20Delivery%20Distance:%20%0A%0AThank%20you!"
                  className="inline-block px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div ref={addToRefs}>
        <Testimonials />
      </div>
      <div ref={addToRefs}>
        <LogoSlider />
      </div>
      <div ref={addToRefs}>
        <Pricing />
      </div>
      <div ref={addToRefs}>
        <FAQ />
      </div>
      
      <RoadTimeline />
      
      <div ref={addToRefs}>
        <Map />
      </div>

      <section ref={addToRefs} className="flex-item" id="intro" style={{ "backgroundColor": "#f2f2f2", "padding": "4rem 0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ "fontSize": "24px", "textAlign": "center", "marginBottom": "2rem", "fontWeight": "600" }}>Meet Our Team</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="speaker-photo">
                <img style={{ "height": "150px", "width": "150px", "margin": "auto", "borderRadius": "50%" }}
                  src="https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/c7a06ee1-4ba9-4ffd-fca9-d60b1bb99100/public" />
              </div>

              <div className="speaker-info notranslate text-center mt-4">
                <h3 className="text-xl font-semibold">Yiqun Xu</h3>
                <div className="text-gray-600">Co-founder @ New York</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="speaker-photo">
                <img style={{ "height": "150px", "width": "150px", "margin": "auto", "borderRadius": "50%" }}
                  src={"https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/5881e432-dcec-434b-bba3-5a6e7b971a00/public"} />
              </div>

              <div className="speaker-info notranslate text-center mt-4">
                <h3 className="text-xl font-semibold">Yutao Li</h3>
                <div className="text-gray-600">Co-founder @ San Francisco</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="speaker-photo">
                <img style={{ "height": "150px", "width": "150px", "margin": "auto", "borderRadius": "50%" }}
                  src={"https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/aa3ee33c-e717-41a8-daaa-dcb18268ea00/public"} />
              </div>

              <div className="speaker-info notranslate text-center mt-4">
                <h3 className="text-xl font-semibold">Yimei Wen</h3>
                <div className="text-gray-600">Codebase Team Member @ Boston</div>
                <div className="text-gray-600">Clemson University Ph.D.</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="speaker-photo">
                <img style={{ "height": "150px", "width": "150px", "margin": "auto", "borderRadius": "50%" }}
                  src={"https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/03a895d4-0b79-47fe-9319-fa4b7a089500/public"} />
              </div>

              <div className="speaker-info notranslate text-center mt-4">
                <h3 className="text-xl font-semibold">Jessica Jiang</h3>
                <div className="text-gray-600">Active Product Designer @ New York</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="speaker-photo">
                <img style={{ "height": "150px", "width": "150px", "margin": "auto", "borderRadius": "50%" }}
                  src={"https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/be0bbc41-1ee1-4a29-50a4-f9fb085bc800/public"} />
              </div>

              <div className="speaker-info notranslate text-center mt-4">
                <h3 className="text-xl font-semibold">Winnie Mei</h3>
                <div className="text-gray-600">Active Product Designer @ Boston</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <AIChat />
    </div>
  )
}

export default Food