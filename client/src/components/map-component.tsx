import { useState, useCallback } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Floating Card Style Map */}
      <div className="bg-card rounded-[32px] overflow-hidden border border-border shadow-xl shadow-primary/10">
        {/* Map Container */}
        <div className="h-72 bg-gradient-to-br from-primary/5 to-primary/10 relative">
          {/* Map Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5 opacity-50"></div>
          
          {/* Available Zone Indicator */}
          <div className="absolute top-4 left-4 bg-primary/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-primary border border-primary/20">
            Verfügbare Zone
          </div>
          
          {/* Profile Icon Overlay */}
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
          </div>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto border border-primary/30">
                <MapPin className="text-primary h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg">Mainz, Deutschland</h3>
              <p className="text-sm text-muted-foreground font-light">Lat: 50.0007, Lng: 8.2711</p>
            </motion.div>
          </div>
          
          {/* Animated Location Pin */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative">
              <div className="w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg"></div>
              <div className="absolute inset-0 w-6 h-6 bg-primary/30 rounded-full animate-ping"></div>
            </div>
          </motion.div>
          
          {/* Service Area Visualization */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-3 border border-border">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">Servicegebiet Mainz</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Location Input */}
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="text-primary h-5 w-5" />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Genaue Adresse eingeben..."
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="border-0 bg-muted/50 focus:bg-muted/70 transition-all text-base"
              />
            </div>
            <Button
              onClick={handleGetCurrentLocation}
              disabled={isLoading}
              variant="outline"
              size="icon"
              className="shrink-0 hover:bg-primary/10 hover:border-primary/50"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
