import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CareerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div 
              className="max-w-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
              <p className="text-lg text-white/90 leading-relaxed">
                EatifyDash stands as the quintessential platform designed solely for the restaurant industry.
                Our goal is to enhance the dining experience for everyone involved.
                By linking staff, processes, and patrons through a dependable and user-friendly platform.
              </p>
              <p className="text-lg text-white/90 leading-relaxed mt-4">
                At EatifyDash, collaboration is key. Our success hinges on collective problem-solving and the exchange of insights. 
                We take personal responsibility for our actions, offer support and respect to our colleagues, and celebrate our diverse perspectives.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                className="w-72 h-72 md:w-96 md:h-96 object-cover rounded-lg shadow-xl"
                src="https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/76331d4b-ab1f-4979-acd1-3ed0db091300/public"
                alt="Team collaboration"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Positions Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Open Positions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Software Engineer Intern (0022)",
                description: "Join our dynamic team as a Software Engineer Intern and work on the forefront of technology and innovation. You'll collaborate with senior engineers to design, develop, and implement software solutions that drive our business forward.",
                qualifications: [
                  "Basic understanding of programming languages and cloud infrastructure (e.g., JavaScript and GCP).",
                  "Strong problem-solving skills and a willingness to learn."
                ],
                jobId: "0022"
              },

              {
                title: "Product Specialist (0024)",
                description: "As a Product Specialist, you'll be the cornerstone of our product development process, transforming ideas into market-leading products. This role involves market research, strategy formulation, and cross-functional collaboration.",
                qualifications: [
                  "Experience in product development or management.",
                  "Excellent communication and teamwork skills."
                ],
                jobId: "0024"
              },
              {
                title: "Sales Specialist (0026)",
                description: "As a Sales Specialist, you'll play a key role in driving our company's revenue growth by identifying and converting potential leads into loyal customers.",
                qualifications: [
                  "Proven sales experience, preferably in the POS industry.",
                  "Strong communication, negotiation, and interpersonal skills.",
                  "Ability to work independently and as part of a team."
                ],
                jobId: "0026"
              }
            ].map((position, index) => (
              <motion.div
                key={position.jobId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">{position.title}</h3>
                <p className="text-gray-600 mb-4">{position.description}</p>
                <h4 className="font-semibold text-gray-900 mb-2">Qualifications:</h4>
                <ul className="list-disc list-inside text-gray-600 mb-6">
                  {position.qualifications.map((qual, i) => (
                    <li key={i} className="mb-1">{qual}</li>
                  ))}
                </ul>
                <a 
                  href={`mailto:admin@eatifydash.com?subject=Application for ${position.title}`}
                  className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Apply Now
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <Link to="/" className="hover:text-orange-400 transition-colors duration-300">Home</Link>
              <Link to="/careers" className="hover:text-orange-400 transition-colors duration-300">Career</Link>
            </div>
            <p className="text-sm text-gray-400">© 2024 Eatifydash LLC || All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CareerPage;