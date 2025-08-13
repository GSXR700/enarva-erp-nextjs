// app/mobile/hooks/useLocationTracker.ts
"use client";

import { useState, useEffect, useRef } from 'react';

export function useLocationTracker(isActive: boolean) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetch('/api/user/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
        },
        { enableHighAccuracy: true }
      );
    };

    if (isActive) {
      // Demande la permission et envoie la position immédiatement
      sendLocation();
      // Puis la renvoie toutes les 2 minutes
      intervalRef.current = setInterval(sendLocation, 120000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);
}