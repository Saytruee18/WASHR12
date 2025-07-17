import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Search, AlertCircle, Check } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@googlemaps/js-api-loader";

interface InteractiveMapProps {
  onLocationSelect: (address: string, isInServiceArea: boolean) => void;
}

// Define Mainz service area polygon (approximate coordinates)
const MAINZ_SERVICE_AREA = [
  { lat: 49.9929, lng: 8.2473 },
  { lat: 50.0181, lng: 8.2473 },
  { lat: 50.0181, lng: 8.3247 },
  { lat: 49.9929, lng: 8.3247 },
  { lat: 49.9929, lng: 8.2473 }
];

const MAINZ_CENTER = { lat: 50.0012, lng: 8.2711 };

export function InteractiveMap({ onLocationSelect }: InteractiveMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isInServiceArea, setIsInServiceArea] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const serviceAreaPolygon = useRef<google.maps.Polygon | null>(null);
  
  const { toast } = useToast();
  const { getCurrentLocation, isLoading } = useLocation();

  // Check if point is inside Mainz service area
  const isPointInServiceArea = useCallback((lat: number, lng: number): boolean => {
    const point = new google.maps.LatLng(lat, lng);
    
    if (serviceAreaPolygon.current) {
      return google.maps.geometry.poly.containsLocation(point, serviceAreaPolygon.current);
    }
    
    // Fallback check without geometry library
    const x = lng, y = lat;
    let inside = false;
    
    for (let i = 0, j = MAINZ_SERVICE_AREA.length - 1; i < MAINZ_SERVICE_AREA.length; j = i++) {
      const xi = MAINZ_SERVICE_AREA[i].lng, yi = MAINZ_SERVICE_AREA[i].lat;
      const xj = MAINZ_SERVICE_AREA[j].lng, yj = MAINZ_SERVICE_AREA[j].lat;
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
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
        const { Marker } = await loader.importLibrary("marker");

        if (!mapRef.current) return;

        // Custom modern light map style - clean and minimal
        const lightMapStyle = [
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#7c7c7c"
              }
            ]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#ffffff"
              },
              {
                "weight": 2
              }
            ]
          },
          {
            "featureType": "landscape",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#f8f8f8"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#eeeeee"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#999999"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#ffffff"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#e6e6e6"
              },
              {
                "weight": 1
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#ffffff"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#d6d6d6"
              },
              {
                "weight": 1.5
              }
            ]
          },
          {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#e3f2fd"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          }
        ];

        const googleMap = new Map(mapRef.current, {
          center: MAINZ_CENTER,
          zoom: 13,
          minZoom: 11,
          maxZoom: 16,
          styles: lightMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          gestureHandling: "greedy",
          restriction: {
            latLngBounds: {
              north: 50.1,
              south: 49.9,
              east: 8.4,
              west: 8.1
            }
          }
        });

        // Create service area polygon with modern styling
        const polygon = new google.maps.Polygon({
          paths: MAINZ_SERVICE_AREA,
          strokeColor: "#2dd36f",
          strokeOpacity: 0.9,
          strokeWeight: 3,
          fillColor: "#2dd36f",
          fillOpacity: 0.15,
        });

        polygon.setMap(googleMap);
        serviceAreaPolygon.current = polygon;

        // Add click listener to map
        googleMap.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            const inServiceArea = isPointInServiceArea(lat, lng);
            
            // Update marker
            if (userMarker) {
              userMarker.setPosition(event.latLng);
            } else {
              const marker = new google.maps.Marker({
                position: event.latLng,
                map: googleMap,
                title: "Ausgewählter Standort"
              });
              setUserMarker(marker);
            }
            
            // Reverse geocoding to get address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: event.latLng }, (results, status) => {
              if (status === "OK" && results?.[0]) {
                const address = results[0].formatted_address;
                setSelectedAddress(address);
                setSearchInput(address);
                setIsInServiceArea(inServiceArea);
                onLocationSelect(address, inServiceArea);
              }
            });
          }
        });

        setMap(googleMap);
        setIsMapLoaded(true);
        
        // Initialize autocomplete
        if (searchInputRef.current) {
          const autocompleteService = new google.maps.places.Autocomplete(
            searchInputRef.current,
            {
              bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(49.9, 8.1),
                new google.maps.LatLng(50.1, 8.4)
              ),
              componentRestrictions: { country: "de" },
              fields: ["place_id", "geometry", "name", "formatted_address"]
            }
          );

          autocompleteService.addListener("place_changed", () => {
            const place = autocompleteService.getPlace();
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              
              const inServiceArea = isPointInServiceArea(lat, lng);
              
              googleMap.setCenter(place.geometry.location);
              googleMap.setZoom(15);
              
              if (userMarker) {
                userMarker.setPosition(place.geometry.location);
              } else {
                const marker = new google.maps.Marker({
                  position: place.geometry.location,
                  map: googleMap,
                  title: place.formatted_address
                });
                setUserMarker(marker);
              }
              
              setSelectedAddress(place.formatted_address || place.name || "");
              setIsInServiceArea(inServiceArea);
              onLocationSelect(place.formatted_address || place.name || "", inServiceArea);
            }
          });

          setAutocomplete(autocompleteService);
        }

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

  // Get current location
  const handleGetCurrentLocation = useCallback(async () => {
    if (!map) return;
    
    try {
      const position = await getCurrentLocation();
      const userLatLng = new google.maps.LatLng(position.latitude, position.longitude);
      
      map.setCenter(userLatLng);
      map.setZoom(15);
      
      const inServiceArea = isPointInServiceArea(position.latitude, position.longitude);
      
      if (userMarker) {
        userMarker.setPosition(userLatLng);
      } else {
        const marker = new google.maps.Marker({
          position: userLatLng,
          map: map,
          title: "Ihr aktueller Standort"
        });
        setUserMarker(marker);
      }
      
      // Reverse geocoding
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: userLatLng }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const address = results[0].formatted_address;
          setSelectedAddress(address);
          setSearchInput(address);
          setIsInServiceArea(inServiceArea);
          onLocationSelect(address, inServiceArea);
        }
      });
      
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
  }, [map, userMarker, getCurrentLocation, isPointInServiceArea, onLocationSelect, toast]);

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 w-full h-full"
        style={{ minHeight: '100vh' }}
      />
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {!isMapLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-10"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Karte wird geladen...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Top Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/40 to-transparent pointer-events-none z-10" />

      {/* Search Bar Overlay - Centered */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 w-80 max-w-[calc(100vw-2rem)]"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Search className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <Input
              ref={searchInputRef}
              placeholder="Enter the address we should come to..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder:text-gray-500 font-medium"
            />
            <Button
              onClick={handleGetCurrentLocation}
              disabled={isLoading}
              size="sm"
              className="bg-[#2dd36f] hover:bg-[#26b865] text-white rounded-xl px-3 py-2 flex-shrink-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Service Area Status */}
          <AnimatePresence>
            {selectedAddress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-2 text-sm"
              >
                {isInServiceArea ? (
                  <>
                    <div className="w-2 h-2 bg-[#2dd36f] rounded-full animate-pulse"></div>
                    <span className="text-[#2dd36f] font-semibold">Service Available</span>
                    <Check className="h-4 w-4 text-[#2dd36f]" />
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-semibold">Outside Service Zone</span>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent pointer-events-none z-10" />
      
      {/* Zone Legend */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-24 right-4 z-20"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4 space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 font-medium">Service verfügbar</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-gray-700 font-medium">Außerhalb der Zone</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}