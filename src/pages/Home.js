import React from 'react';
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

const Food = () => {


  return (
    <div>
      <Navbar />
      <Hero />
      <LogoSlider />
      <Features />
      <Gallery />
      <VideoTutorials />
      <Testimonials />
      <Pricing />
      <FAQ />
      
      <section className="flex-item" id="intro" style={{ "background-color": "#f2f2f2", "padding": "4rem 0" }}>
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