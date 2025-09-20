"use client";

import { useEffect } from 'react';

export default function FontAwesomeLocal() {
  useEffect(() => {
    // Charger Font Awesome local
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/fontawesome/all.min.css';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    
    // Supprimer les anciens liens Font Awesome CDN
    const existingLinks = document.querySelectorAll('link[href*="font-awesome"]');
    existingLinks.forEach(link => link.remove());
  }, []);

  return null;
}
