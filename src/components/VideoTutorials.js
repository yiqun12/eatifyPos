import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon } from '@heroicons/react/24/solid';

const videos = [
  {
    id: 1,
    title: "QR Code Scanning Demo",
    thumbnail: "/images/v1.png",
    duration: "1:10",
    description: "Learn how to scan QR codes using our POS system",
    videoUrl: "https://www.youtube.com/watch?v=wcJlI1JxGvA"
  },
  {
    id: 2,
    title: "POS System Operation Demo",
    thumbnail: "/images/v2.png",
    duration: "0:57",
    description: "Step-by-step guide to operating the POS terminal",
    videoUrl: "https://www.youtube.com/watch?v=XsPJ5qgqnCo"
  },
  {
    id: 3,
    title: "Self-Service Ordering Demo",
    thumbnail: "/images/v3.png",
    duration: "1:16",
    description: "See how customers can place orders using the self-service kiosk",
    videoUrl: "https://www.youtube.com/watch?v=cLPom6gjmYg"
  }
];

const VideoTutorials = () => {
  const openVideoLink = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div id="tutorials" className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Video Tutorials
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Watch our demonstration videos to see the system in action
          </motion.p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className="relative h-48 cursor-pointer group"
                onClick={() => openVideoLink(video.videoUrl)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-300">
                  <div className="bg-orange-500 bg-opacity-90 rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
                    <PlayIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{video.description}</p>
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-orange-500 font-medium text-sm hover:text-orange-500-dark transition-colors duration-300"
                >
                  Watch Video
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoTutorials;
