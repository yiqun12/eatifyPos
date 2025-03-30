import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  ChartBarIcon, 
  ClockIcon, 
  DevicePhoneMobileIcon, 
  CubeIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Fast Payment Processing',
    description: 'Support multiple payment methods including credit cards, mobile payments, and cash to ensure quick transactions.',
    icon: CreditCardIcon,
  },
  {
    name: 'Real-time Analytics',
    description: 'Get real-time sales data and analytical reports to help you make informed business decisions.',
    icon: ChartBarIcon,
  },
  {
    name: 'Efficient Order Management',
    description: 'Streamline the ordering process, reduce wait times, and improve customer satisfaction.',
    icon: ClockIcon,
  },
  {
    name: 'Mobile Compatibility',
    description: 'Manage your business from anywhere with mobile device compatibility for flexible operations.',
    icon: DevicePhoneMobileIcon,
  },
  {
    name: 'Inventory Management',
    description: 'Automatically track inventory levels, get timely restock alerts, and reduce waste.',
    icon: CubeIcon,
  },
  {
    name: 'Staff Management',
    description: 'Easily manage staff scheduling, permissions, and performance to improve team efficiency.',
    icon: UserGroupIcon,
  },
];

const Features = () => {
  return (
    <div id="features" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Powerful Features, Simplified Operations
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our POS system offers comprehensive features to help your restaurant improve efficiency and increase revenue.
          </motion.p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name} 
                className="pt-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-orange-500 rounded-md shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                    <p className="mt-5 text-base text-gray-500">{feature.description}</p>
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

export default Features; 