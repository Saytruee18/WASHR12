import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface Position {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = useCallback((): Promise<Position> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation wird von diesem Browser nicht unterstützt"));
        return;
      }

      setIsLoading(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setIsLoading(false);
          let message = "Standort konnte nicht ermittelt werden";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Standortzugriff wurde verweigert";
              break;
            case error.POSITION_UNAVAILABLE:
              message = "Standort ist nicht verfügbar";
              break;
            case error.TIMEOUT:
              message = "Zeitüberschreitung bei der Standortermittlung";
              break;
          }
          
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  const validateLocation = useCallback(async (address: string, lat?: number, lng?: number) => {
    try {
      const response = await fetch("/api/validate-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          latitude: lat,
          longitude: lng,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Location validation error:", error);
      return { valid: false, message: "Fehler bei der Standortvalidierung" };
    }
  }, []);

  return {
    getCurrentLocation,
    validateLocation,
    isLoading,
  };
}
