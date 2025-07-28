import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 39.8283,
  lng: -98.5795
};

const locations = [
  { name: 'New York', pos: { lat: 40.7128, lng: -74.0060 } },
  { name: 'Boston', pos: { lat: 42.3601, lng: -71.0589 } },
  { name: 'San Francisco', pos: { lat: 37.7749, lng: -122.4194 } }
];

const MapComponent = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  return isLoaded ? (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Reach
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Serving clients in major tech hubs across the nation.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-xl">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={4}
          >
            {locations.map((location) => (
              <Marker
                key={location.name}
                position={location.pos}
                title={location.name}
              />
            ))}
          </GoogleMap>
        </div>
      </div>
    </section>
  ) : (
    <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Loading Map...</h2>
            <p className="text-gray-500 mt-2">If the map doesn't load, please ensure the Google Maps API key is set correctly.</p>
        </div>
    </div>
  );
}

export default React.memo(MapComponent); 