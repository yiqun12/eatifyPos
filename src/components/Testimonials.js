import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    content: "Since using this POS system, our order efficiency has improved by 30%, significantly reducing customer wait times. (Google translated)",
    author: "Chen Fu Sheng",
    role:"Golden Dragon Restaurant Owner",
    image: "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/680faf4c-76ea-4426-7173-da3759cc7a00/public"
  },
  {
    content: "The analytics feature helped us identify popular menu items, adjust our pricing strategy, and increase profits by 20%. (Google translated)",
    author: "Lin Mei Xiang",
    role: "Jade Garden Café Owner",
    image: "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/8edaa939-e340-42b8-6583-a81670675200/public"
  },
  {
    content: "The inventory management feature has helped us reduce food waste, saving thousands in costs every month. (Google translated)",
    author: "Huang De Xing",
    role:"Red Phoenix Chain Owner",
    image: "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/3a41f6cc-c402-45c8-843c-c93a7b794100/public"
  },
];

const Testimonials = () => {
  return (
    <div id="testimonials" className="bg-white py-8 sm:py-12 md:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What Our Customers Say
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Hear from our customers and their success stories.
          </motion.p>
        </div>
        <div className="mt-8 sm:mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="bg-gray-50 rounded-lg shadow-sm p-6 sm:p-8 border border-gray-100 hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover" 
                    src={testimonial.image} 
                    alt={testimonial.author} 
                  />
                  <div className="ml-3 sm:ml-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm sm:text-base text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials; 