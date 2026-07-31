'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Preferences } from '@/types';
import { DEFAULT_PREFERENCES, isDefaultCoords } from '@/types';
import { formatPlaceLabel, geocodeCity, sanitizeCityQuery, distanceKm, isCustomCityName } from '@/services/geocodingService';
import { normalizeCustomSounds } from '@/lib/customSoundsService';
import { loadPreferences, savePreferences } from '@/lib/storage';
import { fetchUserData, pushUserData } from '@/lib/syncService';

const LOCATION_SETUP_PREFIX = 'reveil-location-setup';
const GEOCODE_DEBOUNCE_MS = 900;
const MAX_CITY_COORD_DISTANCE_KM = 20;

async function alignCoordsWithCity(prefs: Preferences): Promise<Preferences> {
  if (!isCustomCityName(prefs.cityName)) return prefs;

  const place = await geocodeCity(sanitizeCityQuery(prefs.cityName));
  if (!place) return prefs;

  const dist = distanceKm(prefs.latitude, prefs.longitude, place.latitude, place.longitude);
  if (!isDefaultCoords(prefs.latitude, prefs.longitude) && dist <= MAX_CITY_COORD_DISTANCE_KM) {
    return prefs;
  }

  return {
    ...prefs,
    cityName: formatPlaceLabel(place),
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

function locationSetupKey(userId: string): string {
  return `${LOCATION_SETUP_PREFIX}-${userId}`;
}

function markLocationSetup(userId: string): void {
  localStorage.setItem(locationSetupKey(userId), '1');
}

function hasLocationSetup(userId: string): boolean {
  return localStorage.getItem(locationSetupKey(userId)) === '1';
}

function isCityOnlyPatch(patch: Partial<Preferences>): boolean {
  return (
    patch.cityName !== undefined &&
    patch.latitude === undefined &&
    patch.longitude === undefined &&
    Object.keys(patch).length === 1
  );
}

export function usePreferences(userId: string | null, token: string | null) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const initDone = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGeocodedCity = useRef<string | null>(null);

  const scheduleSync = useCallback(
    (next: Preferences, alarmsJson?: string) => {
      if (!userId || !token) return;
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        let alarms: never[] = [];
        try {
          const raw = alarmsJson ?? localStorage.getItem(`reveil-alarms-${userId}`);
          alarms = raw ? JSON.parse(raw) : [];
        } catch {
          alarms = [];
        }
        void pushUserData(token, { alarms, preferences: next });
      }, 800);
    },
    [userId, token]
  );

  const applyGeocodedCity = useCallback(
    async (cityName: string): Promise<boolean> => {
      const query = sanitizeCityQuery(cityName);
      if (query.length < 2 || !userId) return false;

      const normalized = query.toLowerCase();
      lastGeocodedCity.current = normalized;

      setGeocoding(true);
      try {
        const place = await geocodeCity(query);
        if (!place) return false;

        lastGeocodedCity.current = normalized;
        const next = {
          cityName: formatPlaceLabel(place),
          latitude: place.latitude,
          longitude: place.longitude,
        };

        setPrefs((prev) => {
          const merged = { ...prev, ...next };
          savePreferences(userId, merged);
          scheduleSync(merged);
          return merged;
        });
        markLocationSetup(userId);
        return true;
      } finally {
        setGeocoding(false);
      }
    },
    [userId, scheduleSync]
  );

  const scheduleGeocode = useCallback(
    (cityName: string) => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      lastGeocodedCity.current = null;
      geocodeTimer.current = setTimeout(() => {
        void applyGeocodedCity(cityName);
      }, GEOCODE_DEBOUNCE_MS);
    },
    [applyGeocodedCity]
  );

  const updatePrefs = useCallback(
    (patch: Partial<Preferences>) => {
      if (!userId) return;
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        savePreferences(userId, next);

        if (isCityOnlyPatch(patch)) {
          scheduleGeocode(patch.cityName!);
        } else {
          scheduleSync(next);
        }

        return next;
      });
    },
    [userId, scheduleGeocode, scheduleSync]
  );

  const useGeolocation = useCallback(() => {
    if (!navigator.geolocation || !userId) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updatePrefs({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          cityName: 'Ma position',
        });
        markLocationSetup(userId);
      },
      () => {
        /* silencieux */
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300_000 }
    );
  }, [updatePrefs, userId]);

  useEffect(() => {
    if (!userId || !token) return;
    let cancelled = false;

    const load = async () => {
      setGeocoding(true);
      const local = loadPreferences(userId);
      const remote = await fetchUserData(token);

      if (cancelled) return;

      let merged: Preferences =
        remote.ok && remote.data
          ? { ...DEFAULT_PREFERENCES, ...remote.data.preferences }
          : local;

      merged = await alignCoordsWithCity(merged);
      merged = { ...merged, customSounds: normalizeCustomSounds(merged.customSounds) };

      if (cancelled) return;

      setPrefs(merged);
      savePreferences(userId, merged);
      if (isCustomCityName(merged.cityName)) {
        lastGeocodedCity.current = sanitizeCityQuery(merged.cityName).toLowerCase();
      }
      setReady(true);
      setGeocoding(false);

      if (!initDone.current) {
        initDone.current = true;
        scheduleSync(merged);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, token, scheduleSync]);

  const resolveCityCoords = useCallback(async () => {
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    lastGeocodedCity.current = null;
    return applyGeocodedCity(prefs.cityName);
  }, [applyGeocodedCity, prefs.cityName]);

  return {
    prefs,
    ready,
    geocoding,
    updatePrefs,
    resolveCityCoords,
    useGeolocation,
  };
}
