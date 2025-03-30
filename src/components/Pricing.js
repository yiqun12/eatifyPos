import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

const plans = [
  {
    name: 'Basic',
    price: '99',
    description: 'For small restaurants and cafés',
    features: [
      'Basic ordering functionality',
      'Payment processing',
      'Simple reporting',
      '1 user account',
      'Email support',
    ],
    cta: 'Start Free Trial',
    mostPopular: false,
  },
  {
    name: 'Professional',
    price: '199',
    description: 'For medium-sized restaurants',
    features: [
      'All Basic features',
      'Advanced reporting and analytics',
      'Inventory management',
      '5 user accounts',
      'Priority email and phone support',
      'Staff management',
    ],
    cta: 'Start Free Trial',
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    price: '299',
    description: 'For restaurant chains',
    features: [
      'All Professional features',
      'Multi-location management',
      'Custom reporting',
      'Unlimited user accounts',
      '24/7 dedicated support',
      'API integration',
      'Advanced data analytics',
    ],
    cta: 'Contact Sales',
    mostPopular: false,
  },
];

const Pricing = () => {
  return (
    <div id="pricing" className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Choose the plan that best fits your business. All plans include a 14-day free trial.
          </motion.p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name} 
              className={`bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 ${plan.mostPopular ? 'ring-2 ring-primary' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h2>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/mo</span>
                </p>
                <a
                  href="#contact"
                  className={`mt-8 block w-full bg-${plan.mostPopular ? 'primary' : 'white'} border border-${plan.mostPopular ? 'primary' : 'gray-300'} rounded-md py-2 text-sm font-semibold text-${plan.mostPopular ? 'white' : 'primary'} text-center hover:bg-${plan.mostPopular ? 'primary-dark' : 'gray-50'}`}
                >
                  {plan.cta}
                </a>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">Included features</h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <CheckIcon className="flex-shrink-0 h-6 w-6 text-green-500" aria-hidden="true" />
                      <span className="ml-3 text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing; 