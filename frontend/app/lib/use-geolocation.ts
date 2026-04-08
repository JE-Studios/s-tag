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

export type GeoConsent = "unknown" | "granted" | "denied";

export function getGeoConsent(): GeoConsent {
  if (typeof window === "undefined") return "unknown";
  const v = localStorage.getItem(LS_CONSENT);
  if (v === "granted") return "granted";
  if (v === "denied") return "denied";
  return "unknown";
}

export function hasGeoConsent(): boolean {
  return getGeoConsent() === "granted";
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

  const getPosition = useCallback(
    (markConsent = false) =>
      new Promise<boolean>((resolve) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          setState((s) => ({
            ...s,
            error: "Posisjonstjenester ikke tilgjengelig",
            loading: false,
          }));
          if (markConsent) setGeoConsent(false);
          resolve(false);
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
            if (markConsent) setGeoConsent(true);
            resolve(true);
          },
          (err) => {
            setState((s) => ({ ...s, loading: false, error: err.message }));
            if (markConsent) setGeoConsent(false);
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
        );
      }),
    []
  );

  const request = useCallback(async () => {
    // Markerer consent basert på faktisk browser-svar (grant/deny).
    await getPosition(true);
  }, [getPosition]);

  const refresh = useCallback(() => {
    if (hasGeoConsent()) getPosition();
  }, [getPosition]);

  useEffect(() => {
    if (autoStart && hasGeoConsent()) getPosition();
  }, [autoStart, getPosition]);

  return { ...state, request, refresh };
}
