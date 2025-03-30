import React from 'react';
import { motion } from 'framer-motion';

const images = [
  {
    id: 1,
    src: "/images/m1.png",
    alt: "American Food Mobile App",
    title: "Food Ordering Mobile Interface",
    description: "Modern mobile app interface for food ordering with intuitive design."
  },
  {
    id: 2,
    src: "/images/m2.png",
    alt: "POS System Hardware",
    title: "Complete POS System Setup",
    description: "Integrated POS system with main display, customer display, cash drawer and receipt printer."
  },
  {
    id: 3,
    src: "/images/m3.png",
    alt: "Kitchen Burgers Menu",
    title: "Digital Menu Interface",
    description: "User-friendly digital menu with high-quality food images and clear pricing."
  },
  {
    id: 4,
    src: "/images/m4.png",
    alt: "Kitchen Burgers App",
    title: "Mobile Ordering Experience",
    description: "Seamless mobile ordering experience with visual menu options."
  }
];

const Gallery = () => {
  return (
    <div id="gallery" className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            System Gallery
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Explore our POS system interfaces and hardware solutions
          </motion.p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative pt-[56.25%]">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{image.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{image.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
