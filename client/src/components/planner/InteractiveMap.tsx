import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored icons for days
const createNumberedIcon = (num: number) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #4f46e5; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${num}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  return null;
}

interface Location {
  name: string;
  lat: number;
  lng: number;
  day: number;
}

export default function InteractiveMap({ locations }: { locations: Location[] }) {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    if (locations && locations.length > 0) {
      const validLocations = locations.filter(l => l.lat && l.lng);
      setPositions(validLocations.map(l => [l.lat, l.lng]));
    }
  }, [locations]);

  if (!locations || locations.length === 0) {
    return <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">Map data unavailable</div>;
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 relative z-0">
      <MapContainer
        center={positions.length > 0 ? positions[0] : [20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {locations.map((loc, idx) => (
          loc.lat && loc.lng && (
            <Marker 
              key={idx} 
              position={[loc.lat, loc.lng]}
              icon={createNumberedIcon(loc.day)}
            >
              <Popup>
                <div className="font-semibold text-slate-900">{loc.name}</div>
                <div className="text-xs text-indigo-600 font-medium">Day {loc.day}</div>
              </Popup>
            </Marker>
          )
        ))}
        
        {positions.length > 1 && (
          <Polyline 
            positions={positions} 
            color="#4f46e5" 
            weight={3} 
            opacity={0.7} 
            dashArray="10, 10" 
          />
        )}
        
        <MapBounds positions={positions} />
      </MapContainer>
    </div>
  );
}
