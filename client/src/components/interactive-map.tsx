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
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAreaWarning, setShowAreaWarning] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
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

  // Debounced OpenStreetMap Nominatim API for address suggestions with house number validation
  const getAutocompleteSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {  // Minimum 3 characters for search
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const url = `/api/geocode?q=${encodeURIComponent(input)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const results = await response.json();

      if (results.length > 0) {
        // Convert OpenStreetMap results to our format with enhanced validation
        const osmSuggestions = results.map((place: any, index: number) => {
          const address = place.address || {};
          const city = address.city || address.town || address.village || address.municipality || '';
          const houseNumber = address.house_number || '';
          const road = address.road || '';
          
          // Better formatting: prioritize street + house number for main text
          let mainText = road;
          if (houseNumber) {
            mainText = `${road} ${houseNumber}`;
          }
          
          // Secondary text: remaining address parts
          const addressParts = [city, address.postcode, address.state].filter(Boolean);
          const secondaryText = addressParts.join(', ');
          
          return {
            place_id: place.place_id || `osm_${index}`,
            description: place.display_name,
            structured_formatting: {
              main_text: mainText || place.display_name.split(',')[0],
              secondary_text: secondaryText || place.display_name.split(',').slice(1).join(',')
            },
            osmData: place, // Store original OSM data for validation
            isMainz: city.toLowerCase() === 'mainz',
            hasHouseNumber: !!houseNumber,
            hasRoad: !!road,
            isComplete: city.toLowerCase() === 'mainz' && !!houseNumber && !!road
          };
        });
        
        // Sort suggestions: Mainz streets with house numbers first, then Mainz streets, then others
        osmSuggestions.sort((a, b) => {
          // Mainz addresses with house numbers get highest priority
          if (a.isComplete && !b.isComplete) return -1;
          if (!a.isComplete && b.isComplete) return 1;
          
          // Among same completion level, prioritize Mainz
          if (a.isMainz && !b.isMainz) return -1;
          if (!a.isMainz && b.isMainz) return 1;
          
          // Among same city, prioritize those with house numbers
          if (a.hasHouseNumber && !b.hasHouseNumber) return -1;
          if (!a.hasHouseNumber && b.hasHouseNumber) return 1;
          
          return 0;
        });
        
        // Limit to maximum 4 suggestions for clean UI
        setSuggestions(osmSuggestions.slice(0, 4) as any);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('OpenStreetMap API error:', error);
      // Fallback to local Mainz addresses when API fails
      useLocalMainzAddresses(input);
    }
  }, []);

  // Enhanced fallback local Mainz addresses with complete street and house number data
  const useLocalMainzAddresses = (input: string) => {
    const mainzAddresses = [
      "Bahnhofstraße 1, 55116 Mainz",
      "Bahnhofstraße 15, 55116 Mainz", 
      "Rheinstraße 12, 55116 Mainz",
      "Rheinstraße 45, 55116 Mainz",
      "Gutenbergplatz 4, 55116 Mainz",
      "Große Bleiche 22, 55116 Mainz",
      "Große Bleiche 60, 55116 Mainz",
      "Schillerplatz 1, 55116 Mainz",
      "Neubrunnenstraße 7, 55118 Mainz",
      "Breidenbacherstraße 3, 55122 Mainz",
      "Binger Straße 15, 55122 Mainz",
      "Binger Straße 34, 55122 Mainz",
      "Kaiserstraße 5, 55116 Mainz",
      "Kaiserstraße 23, 55116 Mainz",
      "Augustusstraße 20, 55131 Mainz",
      "Münsterstraße 8, 55116 Mainz",
      "Parcusstraße 12, 55116 Mainz",
      "Göttelmannstraße 42, 55130 Mainz",
      "Am Zollhafen 12, 55118 Mainz",
      "Am Zollhafen 25, 55118 Mainz"
    ];

    const filtered = mainzAddresses.filter(addr => 
      addr.toLowerCase().includes(input.toLowerCase())
    );
    
    if (filtered.length > 0) {
      // Convert to compatible format
      const localSuggestions = filtered.map((addr, index) => ({
        place_id: `local_${index}`,
        description: addr,
        structured_formatting: {
          main_text: addr.split(',')[0],
          secondary_text: addr.split(',').slice(1).join(',')
        }
      }));
      setSuggestions(localSuggestions as any);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Debounce timer for search optimization
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle address input change with instant suggestions
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Almost instant suggestions for 3+ characters (50ms debouncing for ultra-responsiveness)
    if (value.length >= 3) {
      debounceTimerRef.current = setTimeout(() => {
        getAutocompleteSuggestions(value);
      }, 50);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Service area check function
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

  // GPS location handler
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS nicht verfügbar",
        description: "Ihr Browser unterstützt keine Standortbestimmung.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address from coordinates
          const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lng=${longitude}`);
          if (response.ok) {
            const data = await response.json();
            if (data.address) {
              setAddressInput(data.address);
              
              // Check if location is in service area
              const inServiceArea = isPointInServiceArea(latitude, longitude);
              if (inServiceArea) {
                toast({
                  title: "Standort erkannt",
                  description: "Ihre aktuelle Adresse wurde automatisch eingefügt.",
                  variant: "default"
                });
                // Center map on user location
                if (map) {
                  map.setCenter({ lat: latitude, lng: longitude });
                  map.setZoom(16);
                }
              } else {
                toast({
                  title: "Servicebereich nicht verfügbar",
                  description: "Diesen Bereich machen wir derzeit leider nicht. Melde dich beim Support für weitere Hilfe.",
                  variant: "destructive"
                });
              }
            }
          }
        } catch (error) {
          toast({
            title: "Adressbestimmung fehlgeschlagen",
            description: "Konnte keine Adresse für Ihren Standort finden.",
            variant: "destructive"
          });
        }
      },
      () => {
        toast({
          title: "Standortzugriff verweigert",
          description: "Bitte erlauben Sie den Zugriff auf Ihren Standort.",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map, isPointInServiceArea, toast]);

  // Enhanced suggestion selection with strict validation
  const handleSuggestionSelect = (suggestion: any) => {
    setAddressInput(suggestion.description);
    setShowSuggestions(false);
    
    // For OpenStreetMap results with enhanced validation
    if (suggestion.osmData) {
      const address = suggestion.osmData.address || {};
      const city = address.city || address.town || address.village || address.municipality || '';
      const houseNumber = address.house_number || '';
      
      // Check if city is Mainz
      if (city.toLowerCase() !== 'mainz') {
        toast({
          title: "Servicebereich nicht verfügbar",
          description: "Diesen Bereich machen wir derzeit leider nicht. Melde dich beim Support für weitere Hilfe.",
          variant: "destructive"
        });
        setShowAreaWarning(true);
        return;
      }

      // Check if house number is present
      if (!houseNumber) {
        toast({
          title: "Vollständige Adresse erforderlich",
          description: "Bitte gib eine vollständige Adresse mit Hausnummer ein.",
          variant: "destructive"
        });
        return;
      }

      // Use coordinates from OpenStreetMap
      const lat = parseFloat(suggestion.osmData.lat);
      const lng = parseFloat(suggestion.osmData.lon);
      
      if (lat && lng) {
        handleLocationSelect(lat, lng, suggestion.description);
        toast({
          title: "Adresse in Mainz akzeptiert",
          description: "Du kannst fortfahren!",
          variant: "default"
        });
      } else {
        // Fallback to Mainz center
        handleLocationSelect(MAINZ_CENTER.lat, MAINZ_CENTER.lng, suggestion.description);
        toast({
          title: "Adresse in Mainz akzeptiert",
          description: "Du kannst fortfahren!",
          variant: "default"
        });
      }
      return;
    }

    // For local addresses (place_id starts with 'local_'), these are all Mainz addresses
    if (suggestion.place_id.startsWith('local_')) {
      // Use Mainz center with slight offset for different addresses
      const lat = MAINZ_CENTER.lat + (Math.random() - 0.5) * 0.01;
      const lng = MAINZ_CENTER.lng + (Math.random() - 0.5) * 0.01;
      handleLocationSelect(lat, lng, suggestion.description);
      
      toast({
        title: "Adresse in Mainz akzeptiert",
        description: "Du kannst fortfahren!",
        variant: "default"
      });
      return;
    }

    // Fallback check if no OSM data
    const isMainzAddress = suggestion.description.toLowerCase().includes('mainz');
    if (!isMainzAddress) {
      toast({
        title: "Servicebereich nicht verfügbar",
        description: "Diesen Bereich machen wir derzeit leider nicht. Melde dich beim Support für weitere Hilfe.",
        variant: "destructive"
      });
      setShowAreaWarning(true);
      return;
    }

    // Use Mainz center as fallback
    handleLocationSelect(MAINZ_CENTER.lat, MAINZ_CENTER.lng, suggestion.description);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          
          {/* Address Search with Custom Autocomplete */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                  ref={inputRef}
                  type="text"
                  value={addressInput}
                  onChange={handleAddressInputChange}
                  placeholder="Deine Adresse hier eingeben..."
                  className="w-full bg-white/95 backdrop-blur-sm rounded-xl pl-10 pr-16 py-3 text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-[#3cbf5c] text-sm font-medium shadow-lg"
                  onFocus={(e) => {
                    e.target.style.transform = 'scale(1.01)';
                    e.target.style.transition = 'transform 0.2s ease';
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && addressInput.trim()) {
                      setShowSuggestions(false);
                      handleAddressSearch();
                    }
                  }}
                />
              
              {/* GPS Button - Modern dark design with subtle glow */}
              <button
                onClick={handleGetCurrentLocation}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-[#100c0c] rounded-full flex items-center justify-center hover:shadow-[0_0_12px_rgba(60,191,92,0.4)] transition-all duration-300 group z-20 border border-gray-700/30 backdrop-blur-sm"
                title="Aktuellen Standort verwenden"
              >
                <div className="relative">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-[#3cbf5c] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm scale-150"></div>
                  {/* GPS Compass Icon */}
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    className="relative z-10 text-[#3cbf5c] group-hover:scale-110 group-hover:rotate-45 transition-all duration-300"
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  </svg>
                  {/* Subtle pulse animation */}
                  <div className="absolute inset-0 bg-[#3cbf5c] rounded-full opacity-30 animate-ping scale-75 group-hover:scale-100"></div>
                </div>
              </button>
              
              {/* Custom Autocomplete Suggestions */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.ul
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto"
                    style={{
                      backgroundColor: '#1a1a1a',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {suggestions.map((suggestion, index) => {
                      const isComplete = suggestion.isComplete;
                      const hasHouseNumber = suggestion.hasHouseNumber;
                      const isMainz = suggestion.isMainz;
                      
                      return (
                        <motion.li
                          key={suggestion.place_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-4 py-3 text-white cursor-pointer border-b border-gray-800 last:border-b-0 hover:bg-[#2a2a2a] transition-all duration-150 flex items-center space-x-3"
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {suggestion.structured_formatting?.main_text || suggestion.description}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {suggestion.structured_formatting?.secondary_text || ''}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {isComplete ? (
                              <span className="text-green-500 text-xs font-medium bg-green-500/20 px-2 py-1 rounded flex items-center gap-1">
                                ✓ Vollständig
                              </span>
                            ) : !isMainz ? (
                              <span className="text-red-500 text-xs font-medium bg-red-500/20 px-2 py-1 rounded flex items-center gap-1">
                                ❌ Außerhalb
                              </span>
                            ) : !suggestion.hasHouseNumber ? (
                              <span className="text-yellow-500 text-xs font-medium bg-yellow-500/20 px-2 py-1 rounded flex items-center gap-1">
                                🏠 Hausnummer?
                              </span>
                            ) : !suggestion.hasRoad ? (
                              <span className="text-orange-500 text-xs font-medium bg-orange-500/20 px-2 py-1 rounded flex items-center gap-1">
                                🛣️ Straße?
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">
                                📍
                              </span>
                            )}
                          </div>
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
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

      {/* Area Warning Modal */}
      <AnimatePresence>
        {showAreaWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAreaWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#100c0c] border border-gray-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">❗</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Diesen Bereich machen wir derzeit leider nicht.
                </h3>
                <p className="text-gray-300 text-sm mb-6">
                  Melde dich beim Support für weitere Hilfe.
                </p>
                <Button
                  onClick={() => setShowAreaWarning(false)}
                  className="w-full bg-[#3cbf5c] hover:bg-[#2fa04d] text-white"
                >
                  Verstanden
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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