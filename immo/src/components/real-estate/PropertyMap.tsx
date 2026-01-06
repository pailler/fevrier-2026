'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet avec Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Property {
  id: string;
  title: string;
  price: number;
  surface?: number;
  rooms?: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  url: string;
  images?: string[];
  source: string;
  is_new: boolean;
  is_favorite: boolean;
  is_viewed: boolean;
  first_seen_at: string;
}

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property) => void;
  center: [number, number];
  zoom: number;
}

export default function PropertyMap({
  properties,
  selectedProperty,
  onPropertySelect,
  center,
  zoom
}: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialiser la carte
    const map = L.map(mapContainerRef.current).setView(center, zoom);

    // Ajouter la couche OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Créer les nouveaux marqueurs
    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      // Créer une icône personnalisée selon le type de bien
      const iconColor = property.is_new 
        ? 'green' 
        : property.is_favorite 
        ? 'red' 
        : 'blue';

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${iconColor};
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 14px;
              line-height: 24px;
              text-align: center;
            ">€</div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      });

      const marker = L.marker([property.latitude, property.longitude], {
        icon: customIcon
      }).addTo(mapRef.current!);

      // Popup avec les informations du bien
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
            ${property.title.substring(0, 50)}${property.title.length > 50 ? '...' : ''}
          </h3>
          <div style="margin-bottom: 4px;">
            <strong>${property.price.toLocaleString('fr-FR')} €</strong>
          </div>
          ${property.surface ? `<div style="margin-bottom: 4px;">${property.surface} m²</div>` : ''}
          ${property.source ? `<div style="font-size: 11px; color: #666;">Source: ${property.source}</div>` : ''}
          ${property.is_new ? '<div style="color: green; font-size: 11px; margin-top: 4px;">🆕 Nouveau</div>' : ''}
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onPropertySelect(property);
      });

      markersRef.current.push(marker);
    });

    // Centrer la carte sur les marqueurs si nécessaire
    if (properties.length > 0 && properties.some(p => p.latitude && p.longitude)) {
      const bounds = L.latLngBounds(
        properties
          .filter(p => p.latitude && p.longitude)
          .map(p => [p.latitude!, p.longitude!] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [properties, onPropertySelect]);

  useEffect(() => {
    if (!mapRef.current || !selectedProperty) return;

    // Trouver le marqueur correspondant et ouvrir sa popup
    const marker = markersRef.current.find((m, index) => {
      const prop = properties[index];
      return prop?.id === selectedProperty.id;
    });

    if (marker) {
      marker.openPopup();
      mapRef.current.setView([selectedProperty.latitude!, selectedProperty.longitude!], 15);
    }
  }, [selectedProperty]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
    />
  );
}
