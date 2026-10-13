/**
 * Royal Rides — Interactive Sri Lanka Tourism Map Component
 * Built using React Leaflet + OpenStreetMap tiles.
 * Custom navy & gold markers for Destinations, Hotels, Police Stations,
 * Sanitary Restrooms, and Hospitals with interactive popup side drawers.
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Hotel,
  Shield,
  HeartPulse,
  Coffee,
  X,
  ExternalLink,
  PhoneCall,
  Compass,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useCurrencyStore } from '../../store/useCurrencyStore';

// Preset sample destinations in case backend DB is connecting or loading
const SAMPLE_DESTINATIONS = [
  {
    _id: 'd1',
    name: 'Sigiriya Rock Fortress',
    slug: 'sigiriya',
    category: ['Cultural', 'Ruins'],
    location: { coordinates: [80.7603, 7.957] },
    shortDescription: 'Ancient 5th-century royal citadel atop a sheer 200m granite monolith.',
    coverImage: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&q=80',
    youtubeVideoId: 'dQw4w9WgXcQ',
    province: 'Central',
  },
  {
    _id: 'd2',
    name: 'Galle Dutch Fort',
    slug: 'galle-fort',
    category: ['Cultural', 'Beach'],
    location: { coordinates: [80.217, 6.027] },
    shortDescription: '17th-century UNESCO World Heritage fortified maritime city.',
    coverImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
    province: 'Southern',
  },
  {
    _id: 'd3',
    name: 'Ella Nine Arches Bridge',
    slug: 'ella',
    category: ['Hill Country', 'Adventure'],
    location: { coordinates: [81.0465, 6.872] },
    shortDescription: 'Misty cloud forests, rolling emerald tea valleys, and colonial viaducts.',
    coverImage: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&q=80',
    province: 'Uva',
  },
  {
    _id: 'd4',
    name: 'Yala National Park',
    slug: 'yala',
    category: ['Wildlife', 'Adventure'],
    location: { coordinates: [81.472, 6.368] },
    shortDescription: 'Highest leopard density on earth, wild elephants, and coastal lagoons.',
    coverImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    province: 'Southern',
  },
  {
    _id: 'd5',
    name: 'Kandy Sacred Temple',
    slug: 'kandy',
    category: ['Cultural', 'Pilgrimage'],
    location: { coordinates: [80.6413, 7.2936] },
    shortDescription: 'Sacred Temple of the Tooth Relic nestled beside a serene mountain lake.',
    coverImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80',
    province: 'Central',
  },
];

// Emergency and Sanitary Facilities
const SAMPLE_FACILITIES = [
  {
    _id: 'f1',
    name: 'Colombo Central Tourist Police',
    type: 'police',
    location: { coordinates: [79.843, 6.934] },
    phone: '1912 / 011-2421052',
    address: 'Chatham Street, Colombo 01',
  },
  {
    _id: 'f2',
    name: 'Galle Fort Tourist Police Unit',
    type: 'police',
    location: { coordinates: [80.218, 6.029] },
    phone: '1912 / 091-2222222',
    address: 'Lighthouse Street, Galle Fort',
  },
  {
    _id: 'f3',
    name: 'National Hospital of Sri Lanka (Colombo)',
    type: 'hospital',
    location: { coordinates: [79.869, 6.918] },
    phone: '1990 (Ambulance) / 011-2691111',
    address: 'Regent Street, Colombo 10',
  },
  {
    _id: 'f4',
    name: 'Kandy General Teaching Hospital',
    type: 'hospital',
    location: { coordinates: [80.632, 7.288] },
    phone: '1990 / 081-2222261',
    address: 'Hospital Road, Kandy',
  },
  {
    _id: 'f5',
    name: 'Southern Highway Rest Area & Sanitary Lounge',
    type: 'sanitary',
    location: { coordinates: [80.12, 6.42] },
    phone: '24/7 Clean Restrooms & Cafeteria',
    address: 'E01 Expressway Welipenna Interchange',
  },
];

// Helper to create custom SVG Leaflet pin icons
const createLeafletIcon = (bgHex, borderHex, iconLetter) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${bgHex};
        border: 2px solid ${borderHex};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(11,31,75,0.35);
      ">
        <span style="
          transform: rotate(45deg);
          color: #ffffff;
          font-weight: bold;
          font-size: 11px;
          font-family: sans-serif;
        ">${iconLetter}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const destinationIcon = createLeafletIcon('#0B1F4B', '#C9A24B', '★');
const policeIcon = createLeafletIcon('#1B3A7A', '#FFFFFF', 'P');
const hospitalIcon = createLeafletIcon('#E63946', '#FFFFFF', '+');
const sanitaryIcon = createLeafletIcon('#2A9D8F', '#FFFFFF', 'R');

function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 11, { duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

export default function InteractiveSriLankaMap() {
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'destinations', 'police', 'hospital', 'sanitary'
  const [destinations, setDestinations] = useState(SAMPLE_DESTINATIONS);
  const [facilities, setFacilities] = useState(SAMPLE_FACILITIES);
  const [selectedItem, setSelectedItem] = useState(null);
  const [focusCoords, setFocusCoords] = useState(null);

  useEffect(() => {
    // Attempt fetching live records from API
    api.get('/destinations')
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setDestinations(res.data);
        }
      })
      .catch(() => {});

    api.get('/facilities')
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setFacilities(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelect = (item, lat, lng) => {
    setSelectedItem(item);
    setFocusCoords([lat, lng]);
  };

  return (
    <div className="relative w-full h-[650px] rounded-3xl overflow-hidden shadow-elevated border border-navy/15 bg-pearl">
      {/* ── Filter Bar Overlay ──────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-2 max-w-[90%] sm:max-w-none">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm transition-all ${
            activeCategory === 'all'
              ? 'bg-navy text-gold shadow-md'
              : 'bg-white/90 text-navy hover:bg-white'
          }`}
        >
          All Island Highlights
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('destinations')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm transition-all flex items-center gap-1 ${
            activeCategory === 'destinations'
              ? 'bg-navy text-gold shadow-md'
              : 'bg-white/90 text-navy hover:bg-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-gold" />
          <span>Destinations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('police')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm transition-all flex items-center gap-1 ${
            activeCategory === 'police'
              ? 'bg-navy text-gold shadow-md'
              : 'bg-white/90 text-navy hover:bg-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-blue-500" />
          <span>Police (119 / 1912)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('hospital')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm transition-all flex items-center gap-1 ${
            activeCategory === 'hospital'
              ? 'bg-navy text-gold shadow-md'
              : 'bg-white/90 text-navy hover:bg-white'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5 text-red-500" />
          <span>Medical (1990)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('sanitary')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm transition-all flex items-center gap-1 ${
            activeCategory === 'sanitary'
              ? 'bg-navy text-gold shadow-md'
              : 'bg-white/90 text-navy hover:bg-white'
          }`}
        >
          <Coffee className="w-3.5 h-3.5 text-teal-accent" />
          <span>Restrooms & Lounges</span>
        </button>
      </div>

      {/* ── Leaflet Map Container ────────────────────────────────────────────── */}
      <MapContainer
        center={[7.8731, 80.7718]}
        zoom={8}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        <MapRecenter coords={focusCoords} />

        {/* Destination Markers */}
        {(activeCategory === 'all' || activeCategory === 'destinations') &&
          destinations.map((d) => {
            const coords = d.location?.coordinates;
            if (!coords || coords.length < 2) return null;
            const [lng, lat] = coords;
            return (
              <Marker
                key={d._id}
                position={[lat, lng]}
                icon={destinationIcon}
                eventHandlers={{
                  click: () => handleSelect(d, lat, lng),
                }}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-navy text-xs">{d.name}</p>
                    <p className="text-[11px] text-content-body mt-0.5">{d.shortDescription}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Facility Markers */}
        {facilities.map((f) => {
          if (activeCategory !== 'all' && activeCategory !== f.type) return null;
          const coords = f.location?.coordinates;
          if (!coords || coords.length < 2) return null;
          const [lng, lat] = coords;

          let icon = policeIcon;
          if (f.type === 'hospital') icon = hospitalIcon;
          if (f.type === 'sanitary') icon = sanitaryIcon;

          return (
            <Marker
              key={f._id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => handleSelect(f, lat, lng),
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-navy text-xs">{f.name}</p>
                  <p className="text-[11px] text-red-600 font-semibold">{f.phone}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ── Interactive Detail Side Drawer ───────────────────────────────────── */}
      {selectedItem && (
        <div className="absolute right-4 bottom-4 top-16 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-navy/15 p-5 z-[500] overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-navy/10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gold">
                {selectedItem.category ? selectedItem.category.join(' • ') : selectedItem.type}
              </span>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 rounded-full bg-navy/5 hover:bg-navy/10 flex items-center justify-center text-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedItem.coverImage && (
              <div className="relative h-44 rounded-xl overflow-hidden mt-3 shadow-sm">
                <img
                  src={selectedItem.coverImage}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h4 className="font-serif text-xl font-bold text-navy mt-3">
              {selectedItem.name}
            </h4>

            {selectedItem.address && (
              <p className="text-xs text-content-muted mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>{selectedItem.address}</span>
              </p>
            )}

            {selectedItem.phone && (
              <div className="mt-3 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
                <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
                <span>Contact Hotline: {selectedItem.phone}</span>
              </div>
            )}

            <p className="text-xs text-content-body mt-3 leading-relaxed">
              {selectedItem.shortDescription || selectedItem.description || 'Verified facility.'}
            </p>
          </div>

          <div className="pt-4 border-t border-navy/10 mt-4">
            <a
              href={`/vehicles?dropoff=${encodeURIComponent(selectedItem.name)}`}
              className="btn-navy w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Book Chauffeur Ride Here</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
