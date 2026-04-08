"use client";
import { useCallback, useEffect, useState } from "react";

export type GeoState = {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
};

const LS_CONSENT = "stag_geo_consent";

export function hasGeoConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LS_CONSENT) === "granted";
}

export function setGeoConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_CONSENT, granted ? "granted" : "denied");
}

/**
 * useGeolocation — henter posisjon KUN hvis brukeren har gitt samtykke.
 * Bruk `request()` for å be om samtykke + hente første posisjon.
 */
export function useGeolocation(autoStart = false): GeoState & {
  request: () => Promise<void>;
  refresh: () => void;
} {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    accuracy: null,
    loading: false,
    error: null,
  });

  const getPosition = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((s) => ({ ...s, error: "Posisjonstjenester ikke tilgjengelig", loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          loading: false,
          error: null,
        });
      },
      (err) => {
        setState((s) => ({ ...s, loading: false, error: err.message }));
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  }, []);

  const request = useCallback(async () => {
    setGeoConsent(true);
    getPosition();
  }, [getPosition]);

  const refresh = useCallback(() => {
    if (hasGeoConsent()) getPosition();
  }, [getPosition]);

  useEffect(() => {
    if (autoStart && hasGeoConsent()) getPosition();
  }, [autoStart, getPosition]);

  return { ...state, request, refresh };
}
