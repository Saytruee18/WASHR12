import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Circle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@googlemaps/js-api-loader";

interface InteractiveMapProps {
  onLocationSelect: (address: string, isInServiceArea: boolean) => void;
  userName?: string;
}

const MAINZ_CENTER = { lat: 49.9929, lng: 8.2473 }; // Updated Mainz coordinates for better centering

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
  const { user } = useAuth();
  
  // Generate dynamic greeting based on auth status
  const getGreeting = () => {
    if (user) {
      // Get user's name from display name or email
      const name = user.displayName || user.email?.split('@')[0] || 'User';
      return `${name} 👋`;
    }
    return '👋';
  };

  // Simple location check function
  const isPointInServiceArea = useCallback((lat: number, lng: number): boolean => {
    // Simple circular area check around updated Mainz center
    const centerLat = 49.9929;
    const centerLng = 8.2473;
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

        // Define Germany bounds to restrict map view
        const germanyBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(47.2701, 5.8663), // Southwest corner of Germany
          new google.maps.LatLng(55.0584, 15.0419)  // Northeast corner of Germany
        );

        const googleMap = new Map(mapRef.current, {
          center: MAINZ_CENTER, // Mainz as central position
          zoom: 16, // Close zoom level for street-level detail
          minZoom: 7, // Prevent zooming out beyond Germany view
          maxZoom: 18, // Allow detailed zoom
          restriction: {
            latLngBounds: germanyBounds, // Restrict panning to Germany
            strictBounds: false, // Allow some flexibility at edges
          },
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
        
        // Create single transparent service area circle with minimal design
        const serviceCircle = new google.maps.Circle({
          center: serviceCenter,
          map: googleMap,
          radius: 15000, // 15km radius for broader coverage
          strokeColor: "#3cbf5c", // Main green color
          strokeOpacity: 0.6,
          strokeWeight: 2,
          fillColor: "transparent", // No fill to keep map clean
          fillOpacity: 0,
        });

        // Create modern animated marker with custom div overlay
        const customMarkerDiv = document.createElement('div');
        customMarkerDiv.innerHTML = `
          <div style="
            width: 20px; 
            height: 20px; 
            background: #00ff88; 
            border-radius: 50%; 
            border: 3px solid #ffffff;
            box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7);
            animation: pulse 2s infinite;
            position: relative;
            cursor: pointer;
          "></div>
          <style>
            @keyframes pulse {
              0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7);
              }
              70% {
                transform: scale(1);
                box-shadow: 0 0 0 10px rgba(0, 255, 136, 0);
              }
              100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(0, 255, 136, 0);
              }
            }
          </style>
        `;

        // Create custom marker using Advanced Marker (modern approach)
        const centralMarker = new google.maps.Marker({
          position: serviceCenter,
          map: googleMap,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: "#3cbf5c",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          title: "Service verfügbar – Mainz Zentrum",
          animation: google.maps.Animation.DROP,
        });

        // Add info window for central marker with German text
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #333; font-weight: 500; padding: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 10px; height: 10px; background: #3cbf5c; border-radius: 50%; animation: pulse 2s infinite;"></div>
                Service verfügbar – Mainz Zentrum
              </div>
            </div>
            <style>
              @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.1); }
                100% { opacity: 1; transform: scale(1); }
              }
            </style>
          `
        });

        centralMarker.addListener('click', () => {
          infoWindow.open(googleMap, centralMarker);
        });

        // Add subtle pulsing animation to marker
        setInterval(() => {
          if (centralMarker.getAnimation() !== null) {
            centralMarker.setAnimation(null);
          } else {
            centralMarker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => centralMarker.setAnimation(null), 800);
          }
        }, 4000);

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

        // Try to get user's current location and center map on it
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              // Check if user is within Germany bounds before centering
              if (germanyBounds.contains(userLocation)) {
                googleMap.setCenter(userLocation);
                googleMap.setZoom(17); // Street-level zoom for precise location
                
                // Create custom car wash icon for user location
                const carWashIcon = {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#3cbf5c" stroke="#ffffff" stroke-width="3"/>
                      <g transform="translate(20,20)">
                        <!-- Car icon -->
                        <path d="M-8,-4 L-6,-8 L6,-8 L8,-4 L8,4 L6,4 L6,2 L-6,2 L-6,4 L-8,4 Z" fill="white"/>
                        <circle cx="-5" cy="1" r="1.5" fill="#3cbf5c"/>
                        <circle cx="5" cy="1" r="1.5" fill="#3cbf5c"/>
                        <!-- Water drops -->
                        <circle cx="-2" cy="-12" r="1" fill="#4285f4" opacity="0.8"/>
                        <circle cx="2" cy="-14" r="1" fill="#4285f4" opacity="0.6"/>
                        <circle cx="0" cy="-16" r="1" fill="#4285f4" opacity="0.9"/>
                      </g>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(40, 40),
                  anchor: new google.maps.Point(20, 40)
                };

                // Add user location marker with custom car wash icon
                new google.maps.Marker({
                  position: userLocation,
                  map: googleMap,
                  icon: carWashIcon,
                  title: "Ihr Standort - Autowaschservice verfügbar",
                  animation: google.maps.Animation.DROP,
                });
                
                toast({
                  title: "📍 Standort gefunden",
                  description: "Karte wurde auf Ihren aktuellen Standort zentriert.",
                });
              }
            },
            (error) => {
              console.log("Location access denied or unavailable:", error.message);
              // Keep default Mainz center - no error message needed
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        }

        // Initialize modern Places services - avoiding legacy APIs
        try {
          const { PlacesService } = await loader.importLibrary("places");
          const places = new PlacesService(googleMap);
          setPlacesService(places);
        } catch (error) {
          console.log("Places API not available, using fallback geocoding");
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

  // Handle address search using Geocoding API (more reliable)
  const handleAddressSearch = useCallback(async () => {
    if (!addressInput.trim()) {
      toast({
        title: "Bitte geben Sie eine Adresse ein",
        description: "Um die Verfügbarkeit zu prüfen, benötigen wir eine gültige Adresse.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use Geocoding API instead of legacy Places API
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode(
        { 
          address: addressInput,
          region: "DE" // Restrict to Germany
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const result = results[0];
            const location = result.geometry.location;
            
            const lat = location.lat();
            const lng = location.lng();
            
            // Check if location is in service area
            const inServiceArea = isPointInServiceArea(lat, lng);
            
            // Update map view
            if (map) {
              map.setCenter({ lat, lng });
              map.setZoom(17); // Street-level zoom
              
              // Add marker for searched location
              new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: result.formatted_address,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: inServiceArea ? "#3cbf5c" : "#ff4444",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }
              });
            }
            
            setSelectedAddress(result.formatted_address);
            setIsInServiceArea(inServiceArea);
            
            if (inServiceArea) {
              toast({
                title: "✅ Service verfügbar!",
                description: "Wir können zu dieser Adresse kommen. Buchung ist möglich.",
              });
              onLocationSelect(result.formatted_address, true);
            } else {
              toast({
                title: "❌ Außerhalb des Servicebereichs",
                description: "Sorry, du bist leider außerhalb unseres Servicegebiets.",
                variant: "destructive"
              });
            }
          } else {
            toast({
              title: "Adresse nicht gefunden",
              description: "Bitte überprüfen Sie die Eingabe und versuchen Sie es erneut.",
              variant: "destructive"
            });
          }
        }
      );
    } catch (error) {
      console.error('Address search error:', error);
      toast({
        title: "Suchfehler",
        description: "Es gab ein Problem bei der Adresssuche. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  }, [addressInput, map, isPointInServiceArea, onLocationSelect, toast]);

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

      {/* Top Dark Gradient Mask - Compact overlay with custom color */}
      <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-[#100c0c]/95 via-[#100c0c]/60 to-transparent pointer-events-none z-10" />

      {/* Landing Page Content - More compact layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-[5vh] left-0 right-0 z-20 px-4"
      >
        <div className="max-w-[600px] mx-auto text-center">
          {/* Main Heading - dynamic greeting based on auth status */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
            {user ? getGreeting() : '👋'}
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-6 leading-tight">
            Wo dürfen wir dein Auto sauber machen?
          </h2>
          
          {/* Subtitle - very short and direct */}
          <p className="text-sm md:text-base text-gray-300 mb-6 leading-relaxed">
            Adresse eingeben – wir kommen vorbei.
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
                placeholder="Deine Adresse hier eingeben..."
                className="w-full bg-white/95 backdrop-blur-sm rounded-xl px-10 py-3 text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-[#3cbf5c] text-sm font-medium shadow-lg"
                onFocus={(e) => {
                  e.target.style.transform = 'scale(1.01)';
                  e.target.style.transition = 'transform 0.2s ease';
                }}
                onBlur={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && addressInput.trim()) {
                    handleAddressSearch();
                  }
                }}
              />
            </div>
            

          </div>
        </div>
      </motion.div>

      {/* Bottom Dark Gradient Mask with new color */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#100c0c]/60 via-[#100c0c]/30 to-transparent pointer-events-none z-10" />

      {/* Side Gradient Masks with new color */}
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-[#100c0c]/40 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#100c0c]/40 to-transparent pointer-events-none z-10" />
      
      {/* Zone Legend - German translations with new color */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-24 left-6 z-20"
      >
        <div 
          className="backdrop-blur-md rounded-lg p-3 border border-gray-700/50 shadow-xl text-sm"
          style={{ backgroundColor: '#100c0c', color: '#fff' }}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-[#3cbf5c]" />
              <span className="text-sm font-medium">✅ Im Servicegebiet</span>
            </div>
            <div className="flex items-center space-x-2">
              <Circle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-gray-300">❌ Außerhalb des Gebiets</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ backgroundColor: '#100c0c' }}>
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-[#3cbf5c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
            <div 
              className="backdrop-blur-md rounded-2xl p-4 border border-gray-700/50 shadow-2xl"
              style={{ backgroundColor: '#100c0c' }}
            >
              <div className="flex items-center space-x-3">
                {isInServiceArea ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-[#3cbf5c]" />
                    <div>
                      <p className="text-sm font-semibold text-[#3cbf5c]">✅ Im Servicegebiet</p>
                      <p className="text-xs text-gray-400">Buchung möglich</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Circle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">❌ Außerhalb des Gebiets</p>
                      <p className="text-xs text-gray-400">Hier nicht verfügbar</p>
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
              className="bg-[#3cbf5c] hover:bg-[#2fa04d] text-white rounded-full p-4 shadow-2xl"
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