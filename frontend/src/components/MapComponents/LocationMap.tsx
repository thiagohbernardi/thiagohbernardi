import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige o problema do ícone padrão do Leaflet com Webpack/Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
  selectedPosition?: [number, number] | null;
}

const MapEventsHandler: React.FC<{ onMapClick: (latlng: L.LatLng) => void, initialPosition?: [number,number] }> = ({ onMapClick, initialPosition }) => {
  const map = useMap();

  useEffect(() => {
    if (initialPosition && map) {
      map.setView(initialPosition, map.getZoom() || 13);
    }
  }, [initialPosition, map]);

  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const LocationMap: React.FC<LocationMapProps> = ({ onLocationSelect, initialPosition = [-23.55052, -46.633308], selectedPosition }) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(selectedPosition || null);

  const handleMapClick = (latlng: L.LatLng) => {
    setMarkerPosition([latlng.lat, latlng.lng]);
    onLocationSelect(latlng.lat, latlng.lng);
  };

  useEffect(() => {
    if (selectedPosition) {
        setMarkerPosition(selectedPosition);
    }
  }, [selectedPosition]);


  return (
    <MapContainer center={initialPosition} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEventsHandler onMapClick={handleMapClick} initialPosition={initialPosition} />
      {markerPosition && (
        <Marker position={markerPosition}>
          <Popup>Localização Selecionada: <br /> Lat: {markerPosition[0].toFixed(5)}, Lng: {markerPosition[1].toFixed(5)}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default LocationMap;
