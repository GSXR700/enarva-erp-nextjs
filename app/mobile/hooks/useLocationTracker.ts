// app/mobile/hooks/useLocationTracker.ts
"use client";

import { useEffect, useRef, useCallback } from 'react';

interface LocationTrackerOptions {
  updateInterval?: number; // Intervalle en millisecondes
  accuracyThreshold?: number; // Seuil de précision en mètres
  distanceThreshold?: number; // Distance minimale pour déclencher une mise à jour
}

export function useLocationTracker(
  isActive: boolean, 
  options: LocationTrackerOptions = {}
) {
  const {
    updateInterval = 30000, // 30 secondes par défaut
    accuracyThreshold = 50, // 50 mètres de précision
    distanceThreshold = 10 // 10 mètres de distance minimale
  } = options;

  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{lat: number, lng: number} | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isTrackingRef = useRef<boolean>(false);

  // Fonction pour calculer la distance entre deux points
  const calculateDistance = useCallback((
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance en mètres
  }, []);

  // Fonction pour envoyer la position au serveur
  const updateLocationOnServer = useCallback(async (
    latitude: number, 
    longitude: number,
    accuracy: number
  ) => {
    try {
      console.log(`📍 Updating location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
      
      const response = await fetch('/api/tracking/update-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        console.error('❌ Failed to update location on server');
        return false;
      }

      console.log('✅ Location updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating location:', error);
      return false;
    }
  }, []);

  // Gestionnaire de succès de géolocalisation
  const handleLocationSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    const currentTime = Date.now();

    // Vérifier la précision
    if (accuracy > accuracyThreshold) {
      console.log(`⚠️ Location accuracy too low: ${accuracy}m > ${accuracyThreshold}m`);
      return;
    }

    // Vérifier l'intervalle minimum
    if (currentTime - lastUpdateRef.current < updateInterval) {
      console.log(`⏱️ Update interval not reached (${currentTime - lastUpdateRef.current}ms < ${updateInterval}ms)`);
      return;
    }

    // Vérifier la distance minimale si on a une position précédente
    if (lastPositionRef.current) {
      const distance = calculateDistance(
        lastPositionRef.current.lat, lastPositionRef.current.lng,
        latitude, longitude
      );

      if (distance < distanceThreshold) {
        console.log(`📏 Distance too small: ${distance}m < ${distanceThreshold}m`);
        return;
      }
    }

    // Mettre à jour la position
    lastPositionRef.current = { lat: latitude, lng: longitude };
    lastUpdateRef.current = currentTime;

    // Envoyer au serveur
    updateLocationOnServer(latitude, longitude, accuracy);
  }, [accuracyThreshold, updateInterval, distanceThreshold, calculateDistance, updateLocationOnServer]);

  // Gestionnaire d'erreur de géolocalisation
  const handleLocationError = useCallback((error: GeolocationPositionError) => {
    console.error('❌ Geolocation error:', error.message);
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error("❌ User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.error("❌ Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.error("❌ The request to get user location timed out.");
        break;
      default:
        console.error("❌ An unknown error occurred.");
        break;
    }
  }, []);

  // Démarrer le suivi
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation is not supported by this browser.');
      return;
    }

    if (isTrackingRef.current) {
      console.log('📍 Location tracking already active');
      return;
    }

    console.log('🚀 Starting location tracking...');
    isTrackingRef.current = true;

    // Options de géolocalisation optimisées
    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 secondes
      maximumAge: 60000 // Cache de 1 minute
    };

    // Obtenir la position immédiatement
    navigator.geolocation.getCurrentPosition(
      handleLocationSuccess,
      handleLocationError,
      geoOptions
    );

    // Puis surveiller les changements
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      geoOptions
    );

    console.log(`✅ Location tracking started with watch ID: ${watchIdRef.current}`);
  }, [handleLocationSuccess, handleLocationError]);

  // Arrêter le suivi
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      console.log(`🛑 Stopping location tracking (watch ID: ${watchIdRef.current})`);
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    isTrackingRef.current = false;
    lastPositionRef.current = null;
    lastUpdateRef.current = 0;
  }, []);

  // Effet principal pour gérer l'activation/désactivation
  useEffect(() => {
    if (isActive) {
      startTracking();
    } else {
      stopTracking();
    }

    // Nettoyage lors du démontage
    return () => {
      stopTracking();
    };
  }, [isActive, startTracking, stopTracking]);

  // Gestion de la visibilité de la page pour optimiser la batterie
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        console.log('📱 Page hidden, pausing location tracking');
        stopTracking();
      } else if (!document.hidden && isActive) {
        console.log('📱 Page visible, resuming location tracking');
        startTracking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, startTracking, stopTracking]);

  // Retourner l'état du tracking
  return {
    isTracking: isTrackingRef.current,
    lastPosition: lastPositionRef.current,
    lastUpdate: lastUpdateRef.current
  };
}