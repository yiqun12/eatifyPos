import { useState } from 'react';

const useGeolocation = () => {
    const [location, setLocation] = useState(null);
  
    const getLocation = () => {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setLocation(newLocation);
              console.log(newLocation)
              resolve(newLocation); // Resolve with the new location object
            },
            (error) => {
              console.error(error);
              reject('Geolocation is not supported or permission denied.');
            }
          );
        } else {
          reject('Geolocation is not supported by this browser.');
        }
      });
    };
  
    return [location, getLocation];
  };
  
  export default useGeolocation;
  