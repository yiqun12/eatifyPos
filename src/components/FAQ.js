import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: 'Does your POS system support multiple payment methods?',
    answer: 'Yes, our system supports credit cards, debit cards, mobile payments (like Apple Pay and Google Pay), and cash. You can configure payment methods according to your needs.',
  },
  {
    question: 'How do I start a free trial?',
    answer: 'Simply fill out the contact form on our website, and our team will get in touch with you within 24 hours to help you set up your free trial account. The trial period is 14 days with no credit card required.',
  },
  {
    question: 'Does the system require professional installation?',
    answer: 'No. Our system is designed to be user-friendly and can be self-installed following our provided guidelines. Of course, if you need help, our technical team is available to provide remote or on-site support.',
  },
  {
    question: 'Is training provided?',
    answer: 'Yes, we provide comprehensive training services, including online video tutorials, user manuals, and one-on-one training sessions. Our goal is to ensure you and your team can fully utilize all the features of the system.',
  },
  {
    question: 'How do I get support if I encounter technical issues?',
    answer: 'We offer multiple support channels, including phone, email, and live chat. Basic plan users can get support via email, while Professional and Enterprise plan users enjoy priority support. Enterprise users also get 24/7 dedicated support.',
  },
  {
    question: 'Does the system support multiple languages?',
    answer: 'Yes, our system supports multiple languages, including English, Spanish, French, and more. You can switch the system language as needed to accommodate different staff and customers.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We've collected some questions you might have. If you have other questions, feel free to contact us.
          </motion.p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <dl className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 rounded-lg p-6 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <dt className="text-lg">
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="flex justify-between items-center w-full text-left font-medium text-gray-900 focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <span className="ml-6 flex-shrink-0">
                      {openIndex === index ? (
                        <ChevronUpIcon className="h-6 w-6 text-orange-500" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-gray-500" />
                      )}
                    </span>
                  </button>
                </dt>
                <motion.dd 
                  className="mt-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-base text-gray-500">
                    {faq.answer}
                  </p>
                </motion.dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 