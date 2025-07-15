import { useState, useCallback } from "react";
import { MapPin, Navigation } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MapComponentProps {
  onLocationOutsideMainz: () => void;
}

export function MapComponent({ onLocationOutsideMainz }: MapComponentProps) {
  const [selectedLocation, setSelectedLocation] = useState("Mainz, Deutschland");
  const { toast } = useToast();
  const { getCurrentLocation, isLoading } = useLocation();

  const handleLocationChange = useCallback((address: string) => {
    setSelectedLocation(address);
    
    // Check if location is outside Mainz
    if (!address.toLowerCase().includes('mainz')) {
      onLocationOutsideMainz();
    }
  }, [onLocationOutsideMainz]);

  const handleGetCurrentLocation = useCallback(async () => {
    try {
      const position = await getCurrentLocation();
      // For demo purposes, we'll assume the location is valid
      // In a real app, you'd use reverse geocoding here
      setSelectedLocation(`${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`);
      
      toast({
        title: "Standort gefunden",
        description: "Ihr aktueller Standort wurde erfolgreich ermittelt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Standort konnte nicht ermittelt werden.",
        variant: "destructive",
      });
    }
  }, [getCurrentLocation, toast]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Map placeholder */}
      <div className="h-64 bg-gray-100 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="text-primary text-4xl mb-2 mx-auto" />
            <p className="text-slate-600 font-medium">Mainz, Deutschland</p>
            <p className="text-sm text-slate-500">Lat: 50.0007, Lng: 8.2711</p>
          </div>
        </div>
        
        {/* Location pin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse-location"></div>
        </div>
      </div>
      
      {/* Location input */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <MapPin className="text-primary h-5 w-5" />
          <Input
            type="text"
            placeholder="Adresse eingeben..."
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
            variant="outline"
            size="icon"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
