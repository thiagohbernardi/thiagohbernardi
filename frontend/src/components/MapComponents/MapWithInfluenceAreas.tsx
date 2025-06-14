import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define the props for the component
interface MapWithInfluenceAreasProps {
  // Define any props you expect here, e.g., initial center, zoom
}

const MapWithInfluenceAreas: React.FC<MapWithInfluenceAreasProps> = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<L.LatLng | null>(null);
  const radii = [500, 1000, 1500, 2000, 2500, 3000]; // meters

  useEffect(() => {
    // Initialize the map
    const mapInstance = L.map('map-container').setView([-15.7801, -47.9292], 4); // Default to Brazil

    // Add a tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    setMap(mapInstance);

    // Map click event to select location
    mapInstance.on('click', (e: L.LeafletMouseEvent) => {
      setSelectedLocation(e.latlng);
    });

    // Cleanup map instance on component unmount
    return () => {
      mapInstance.remove();
    };
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    if (map && selectedLocation) {
      // Clear existing circles before drawing new ones
      map.eachLayer(layer => {
        if (layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });

      // Draw new circles
      radii.forEach(radius => {
        L.circle(selectedLocation, {
          radius: radius,
          color: 'blue', // You can customize colors
          fillColor: '#30f',
          fillOpacity: 0.2
        }).addTo(map);
      });

      // Optionally, pan map to the selected location
      map.panTo(selectedLocation);
    }
  }, [map, selectedLocation, radii]); // Rerun when map, selectedLocation, or radii change

  return (
    <div>
      <div id="map-container" style={{ height: '600px', width: '100%' }}></div>
      {selectedLocation && (
        <div>
          <p>Selected Location: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}</p>
        </div>
      )}
    </div>
  );
};

export default MapWithInfluenceAreas;
