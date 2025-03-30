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
      <Footer />
      <AIChat />
    </div>

  )
}

export default Food