import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MapComponentProps {
  onLocationOutsideMainz: () => void;
}

export function MapComponent({ onLocationOutsideMainz }: MapComponentProps) {
  const [selectedLocation, setSelectedLocation] = useState("Mainz, Deutschland");
  const [mapLoading, setMapLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { getCurrentLocation, isLoading } = useLocation();

  // Initialize demo map
  useEffect(() => {
    const initMap = async () => {
      try {
        // Demo map with modern styling
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="w-full h-full bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center relative rounded-t-[32px] cursor-pointer hover:from-green-500/15 hover:to-green-600/25 transition-all duration-300">
              <div class="absolute inset-0 bg-[url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')] opacity-30"></div>
              <div class="text-center z-10">
                <div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-green-500/30 hover:scale-105 transition-transform duration-200">
                  <span class="text-3xl">📍</span>
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Mainz Servicebereich</h3>
                <p class="text-sm text-muted-foreground">✅ Grün = Service verfügbar</p>
              </div>
            </div>
          `;
          
          // Interactive click handler
          mapRef.current.onclick = () => {
            setSelectedLocation("Neue Adresse, Mainz");
            toast({
              title: "📍 Standort ausgewählt",
              description: "Demo-Standort wurde gesetzt",
            });
          };
          
          setMapLoading(false);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Karte:", error);
        setMapLoading(false);
        toast({
          title: "Karte nicht verfügbar",
          description: "Die interaktive Karte konnte nicht geladen werden.",
          variant: "destructive"
        });
      }
    };

    // Simulate loading time for better UX
    setTimeout(initMap, 1000);
  }, [toast]);

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
      setSelectedLocation(`${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`);
      
      toast({
        title: "📍 Standort gefunden",
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Modern Floating Card Style Map */}
      <div className="bg-card rounded-[32px] overflow-hidden border border-border shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300">
        {/* Map Container */}
        <div className="h-72 relative">
          {mapLoading ? (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center rounded-t-[32px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Karte wird geladen...</p>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-full rounded-t-[32px]" />
          )}

          {/* Available Zone Indicator */}
          <div className="absolute top-4 left-4 bg-primary/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-primary border border-primary/20">
            ✅ Verfügbare Zone
          </div>
          
          {/* GPS Icon Overlay */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGetCurrentLocation}
              disabled={isLoading}
              className="w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full border border-border hover:bg-primary/10 transition-all duration-200 touch-target mobile-optimized"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Navigation className="h-4 w-4 text-primary" />
              )}
            </Button>
          </div>

          {/* Center Marker */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="hidden"
            >
              <div className="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg"></div>
            </motion.div>
          </div>
        </div>

        {/* Location Input Section */}
        <div className="p-6 bg-card">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Abhol-/Serviceadresse</span>
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Adresse eingeben..."
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="flex-1 rounded-2xl border-border/50 bg-muted/30 focus:bg-background transition-all duration-200 touch-target mobile-optimized"
              />
              <Button
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                className="rounded-2xl px-4 bg-primary hover:bg-primary/90 text-primary-foreground touch-target mobile-optimized"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              📍 Servicebereich: Mainz und 5km Umgebung
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}