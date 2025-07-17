import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Circle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@googlemaps/js-api-loader";

interface InteractiveMapProps {
  onLocationSelect: (address: string, isInServiceArea: boolean) => void;
  userName?: string;
}

const MAINZ_CENTER = { lat: 50.0012, lng: 8.2711 };

export function InteractiveMap({ onLocationSelect, userName }: InteractiveMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isInServiceArea, setIsInServiceArea] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Simple location check function
  const isPointInServiceArea = useCallback((lat: number, lng: number): boolean => {
    // Simple circular area check around Mainz center
    const centerLat = 50.0012;
    const centerLng = 8.2711;
    const radius = 0.08; // Approximate radius in degrees
    
    const distance = Math.sqrt(
      Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2)
    );
    
    return distance <= radius;
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyC5P2v27x6bQrLvJUeA9T1lyrc3bvRtx9A",
          version: "weekly",
          libraries: ["places", "geometry"]
        });

        const { Map } = await loader.importLibrary("maps");

        if (!mapRef.current) return;

        // Dark mode map style - professional and clean
        const darkMapStyle = [
          {
            "featureType": "all",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "visibility": "on"
              },
              {
                "color": "#ffffff"
              }
            ]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "visibility": "on"
              },
              {
                "color": "#1a1a1a"
              },
              {
                "weight": 2
              }
            ]
          },
          {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#2c2c2c"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#3c3c3c"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#1e1e1e"
              }
            ]
          },
          {
            "featureType": "landscape.natural",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#2a2a2a"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.neighborhood",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }
        ];

        const googleMap = new Map(mapRef.current, {
          center: MAINZ_CENTER,
          zoom: 13, // Closer zoom to focus on service area
          minZoom: 8, // Prevent zooming out too far (stay within Germany)
          maxZoom: 18, // Allow detailed zoom
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
          backgroundColor: "#1a1a1a",
          clickableIcons: false,
        });

        const serviceCenter = MAINZ_CENTER;
        
        // Create main service area circle - smaller for focused view
        const serviceCircle = new google.maps.Circle({
          center: serviceCenter,
          map: googleMap,
          radius: 6000, // 6km radius for closer zoom
          strokeColor: "#00ff88",
          strokeOpacity: 0.8,
          strokeWeight: 0,
          fillColor: "#00ff88",
          fillOpacity: 0.25,
        });

        // Create outer glow effect - adjusted for closer zoom
        const glowCircle = new google.maps.Circle({
          center: serviceCenter,
          map: googleMap,
          radius: 8000,
          strokeColor: "#00ff88",
          strokeOpacity: 0.4,
          strokeWeight: 2,
          fillColor: "#00ff88",
          fillOpacity: 0.1,
        });

        // Create red overlay for non-service areas - adjusted for closer zoom
        const restrictionPolygon = new google.maps.Polygon({
          paths: [
            // Outer boundary (covers visible area)
            [
              { lat: 50.15, lng: 8.1 },
              { lat: 50.15, lng: 8.45 },
              { lat: 49.85, lng: 8.45 },
              { lat: 49.85, lng: 8.1 }
            ],
            // Inner boundary (service area - creates hole)
            [
              { lat: 50.06, lng: 8.21 },
              { lat: 50.06, lng: 8.33 },
              { lat: 49.94, lng: 8.33 },
              { lat: 49.94, lng: 8.21 }
            ]
          ],
          map: googleMap,
          strokeColor: "#ff4444",
          strokeOpacity: 0.3,
          strokeWeight: 0,
          fillColor: "#ff2222",
          fillOpacity: 0.15,
        });

        // Create single central marker with pulsing effect
        const centralMarker = new google.maps.Marker({
          position: serviceCenter,
          map: googleMap,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#00ff88",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          title: "Service available – Mainz Center",
          animation: google.maps.Animation.DROP,
        });

        // Add info window for central marker
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #333; font-weight: 500; padding: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 8px; height: 8px; background: #00ff88; border-radius: 50%; animation: pulse 2s infinite;"></div>
                Service available – Mainz Center
              </div>
            </div>
            <style>
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            </style>
          `
        });

        centralMarker.addListener('click', () => {
          infoWindow.open(googleMap, centralMarker);
        });

        // Add pulsing animation to marker
        setInterval(() => {
          if (centralMarker.getAnimation() !== null) {
            centralMarker.setAnimation(null);
          } else {
            centralMarker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => centralMarker.setAnimation(null), 1000);
          }
        }, 3000);

        // Add click listener to map
        googleMap.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            const inServiceArea = isPointInServiceArea(lat, lng);
            
            // Create a simple address string from coordinates
            const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            
            setSelectedAddress(address);
            setIsInServiceArea(inServiceArea);
            onLocationSelect(address, inServiceArea);
          }
        });

        setMap(googleMap);
        setIsMapLoaded(true);

        // Initialize Places services for address search
        const autocomplete = new google.maps.places.AutocompleteService();
        const places = new google.maps.places.PlacesService(googleMap);
        setAutocompleteService(autocomplete);
        setPlacesService(places);

      } catch (error) {
        console.error("Error loading Google Maps:", error);
        toast({
          title: "Fehler beim Laden der Karte",
          description: "Die interaktive Karte konnte nicht geladen werden.",
          variant: "destructive"
        });
      }
    };

    initMap();
  }, [isPointInServiceArea, onLocationSelect, toast]);

  // Handle address search
  const handleAddressSearch = useCallback(async () => {
    if (!addressInput.trim() || !placesService) {
      toast({
        title: "Bitte geben Sie eine Adresse ein",
        description: "Um die Verfügbarkeit zu prüfen, benötigen wir eine gültige Adresse.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use Places API to find the location
      const request = {
        query: addressInput,
        fields: ['name', 'geometry', 'formatted_address']
      };

      placesService.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          const place = results[0];
          const location = place.geometry?.location;
          
          if (location) {
            const lat = location.lat();
            const lng = location.lng();
            
            // Check if location is in service area
            const inServiceArea = isPointInServiceArea(lat, lng);
            
            // Update map view
            if (map) {
              map.setCenter({ lat, lng });
              map.setZoom(15);
              
              // Add marker for searched location
              new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: place.formatted_address || addressInput
              });
            }
            
            setSelectedAddress(place.formatted_address || addressInput);
            setIsInServiceArea(inServiceArea);
            
            if (inServiceArea) {
              toast({
                title: "✅ Service verfügbar!",
                description: "Wir können zu dieser Adresse kommen. Buchung ist möglich.",
              });
              onLocationSelect(place.formatted_address || addressInput, true);
            } else {
              toast({
                title: "❌ Außerhalb des Servicebereichs",
                description: "Diese Adresse liegt außerhalb unseres aktuellen Servicebereichs in Mainz.",
                variant: "destructive"
              });
            }
          }
        } else {
          toast({
            title: "Adresse nicht gefunden",
            description: "Bitte überprüfen Sie die Eingabe und versuchen Sie es erneut.",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error('Address search error:', error);
      toast({
        title: "Suchfehler",
        description: "Es gab ein Problem bei der Adresssuche. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  }, [addressInput, placesService, map, isPointInServiceArea, onLocationSelect, toast]);

  // Handle location selection
  const handleLocationSelect = useCallback((lat: number, lng: number, address: string) => {
    const inServiceArea = isPointInServiceArea(lat, lng);
    setSelectedAddress(address);
    setIsInServiceArea(inServiceArea);
    onLocationSelect(address, inServiceArea);
  }, [isPointInServiceArea, onLocationSelect]);

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 w-full h-full"
        style={{ minHeight: '100vh' }}
      />

      {/* Top Dark Gradient Mask - Soft overlay for contrast */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-black/80 via-black/50 to-transparent pointer-events-none z-10" />

      {/* Landing Page Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-16 left-0 right-0 z-20 px-4"
      >
        <div className="max-w-sm mx-auto text-center">
          {/* Main Heading - personalized with username */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
            {userName ? `${userName}, dein Auto gewaschen – egal wo du bist.` : 'Dein Auto, gewaschen – egal wo du bist.'}
          </h1>
          
          {/* Subtitle - smaller and more compact */}
          <p className="text-sm md:text-base text-gray-300 mb-6 leading-relaxed">
            Gib deine Adresse ein und wir kommen direkt zu dir – bequem, flexibel und professionell.
          </p>
          
          {/* Address Search - more compact design */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Adresse eingeben..."
                className="w-full bg-white/95 backdrop-blur-sm rounded-xl px-10 py-3 text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-[#00ff88] text-sm font-medium shadow-lg"
                onFocus={(e) => {
                  e.target.style.transform = 'scale(1.01)';
                  e.target.style.transition = 'transform 0.2s ease';
                }}
                onBlur={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddressSearch();
                  }
                }}
              />
            </div>
            
            <Button
              onClick={handleAddressSearch}
              disabled={!addressInput.trim()}
              className="w-full bg-[#00ff88] hover:bg-[#00dd77] disabled:bg-gray-400 disabled:text-gray-600 text-black font-semibold py-3 px-6 rounded-xl text-sm shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              size="sm"
            >
              Verfügbarkeit prüfen
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Bottom Dark Gradient Mask */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none z-10" />

      {/* Side Gradient Masks */}
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-10" />
      
      {/* Zone Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-24 left-6 z-20"
      >
        <div className="bg-gray-900/90 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Circle className="h-4 w-4 text-[#00ff88] fill-[#00ff88]/25" />
              <span className="text-sm font-medium text-white">Service Zone</span>
            </div>
            <div className="flex items-center space-x-3">
              <Circle className="h-4 w-4 text-red-500 fill-red-500/25" />
              <span className="text-sm font-medium text-gray-300">Not Available</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold">Loading Map...</p>
          </div>
        </div>
      )}

      {/* Service Area Status */}
      <AnimatePresence>
        {selectedAddress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-6 right-6 z-20"
          >
            <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-3">
                {isInServiceArea ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-[#00ff88]" />
                    <div>
                      <p className="text-sm font-semibold text-[#00ff88]">Service Available</p>
                      <p className="text-xs text-gray-400">Tap to book cleaning</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Circle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">Out of Service Area</p>
                      <p className="text-xs text-gray-400">Not available here</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <AnimatePresence>
        {selectedAddress && isInServiceArea && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-32 right-6 z-30"
          >
            <Button
              onClick={() => onLocationSelect(selectedAddress, isInServiceArea)}
              className="bg-[#00ff88] hover:bg-[#00dd77] text-black rounded-full p-4 shadow-2xl"
              size="lg"
            >
              <MapPin className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}