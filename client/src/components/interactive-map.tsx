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
  const [showHouseNumberPrompt, setShowHouseNumberPrompt] = useState(false);
  
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

  // Ultra-fast API suggestions with optimized caching and performance
  const getAutocompleteSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      return;
    }

    try {
      // Use only single, optimized API call for speed
      const url = `/api/geocode?q=${encodeURIComponent(input)}&limit=4`;
      
      // Set short timeout for faster response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Don't overwrite existing local suggestions on API error
        return;
      }
      
      const results = await response.json();

      if (results.length > 0) {
        // Process API results with balanced scoring
        const apiSuggestions = results.map((place: any, index: number) => {
          const address = place.address || {};
          const city = address.city || address.town || address.village || address.municipality || '';
          const houseNumber = address.house_number || '';
          const road = address.road || address.street || '';
          
          let mainText = road || place.display_name.split(',')[0];
          if (houseNumber && road) {
            mainText = `${road} ${houseNumber}`;
          }
          
          const addressParts = [city, address.postcode, address.state].filter(Boolean);
          const secondaryText = addressParts.join(', ');
          
          return {
            place_id: place.place_id || `api_${index}`,
            description: place.display_name,
            structured_formatting: {
              main_text: mainText,
              secondary_text: secondaryText
            },
            osmData: place,
            isMainz: city.toLowerCase() === 'mainz',
            hasHouseNumber: !!houseNumber,
            hasRoad: !!road,
            isComplete: city.toLowerCase() === 'mainz' && !!houseNumber && !!road,
            relevanceScore: (city.toLowerCase() === 'mainz' ? 25 : 20) + (houseNumber ? 15 : 0) // Balanced scoring
          };
        });
        
        // Replace suggestions with fresh API results for dynamic updates
        setSuggestions(apiSuggestions as any);
        setShowSuggestions(true);
      }
    } catch (error) {
      // Don't clear existing suggestions on API error
      console.log('API timeout or error, keeping local suggestions');
    }
  }, [suggestions]);

  // Enhanced local database with German-wide addresses for instant suggestions
  const useLocalMainzAddressesWithFuzzy = (input: string) => {
    const germanAddresses = [
      // Mainz (priority)
      "Bahnhofstraße 1, 55116 Mainz",
      "Bahnhofstraße 15, 55116 Mainz",
      "Rheinstraße 12, 55116 Mainz",
      "Kaiserstraße 5, 55116 Mainz",
      "Gutenbergplatz 4, 55116 Mainz",
      "Große Bleiche 22, 55116 Mainz",
      "Schillerplatz 1, 55116 Mainz",
      "Münsterstraße 8, 55116 Mainz",
      "Am Zollhafen 12, 55118 Mainz",
      "Frauenlobstraße 18, 55118 Mainz",
      
      // Frankfurt
      "Zeil 1, 60313 Frankfurt am Main",
      "Kaiserstraße 10, 60311 Frankfurt am Main",
      "Hauptwache 5, 60313 Frankfurt am Main",
      "Römerberg 2, 60311 Frankfurt am Main",
      "Bockenheimer Landstraße 25, 60325 Frankfurt am Main",
      
      // Wiesbaden  
      "Wilhelmstraße 15, 65183 Wiesbaden",
      "Rheinstraße 3, 65185 Wiesbaden",
      "Marktstraße 12, 65183 Wiesbaden",
      "Bahnhofstraße 8, 65185 Wiesbaden",
      
      // Köln
      "Hohe Straße 41, 50667 Köln",
      "Schildergasse 15, 50667 Köln",
      "Domplatz 1, 50667 Köln",
      "Neumarkt 2, 50667 Köln",
      
      // München
      "Marienplatz 8, 80331 München",
      "Maximilianstraße 15, 80539 München",
      "Leopoldstraße 25, 80802 München",
      "Sendlinger Straße 12, 80331 München",
      
      // Berlin
      "Unter den Linden 10, 10117 Berlin",
      "Friedrichstraße 25, 10117 Berlin",
      "Alexanderplatz 3, 10178 Berlin",
      "Kurfürstendamm 15, 10719 Berlin",
      
      // Hamburg
      "Mönckebergstraße 12, 20095 Hamburg",
      "Jungfernstieg 8, 20354 Hamburg",
      "Reeperbahn 25, 20359 Hamburg",
      
      // Stuttgart
      "Königstraße 28, 70173 Stuttgart",
      "Marktplatz 1, 70173 Stuttgart",
      "Schlossplatz 4, 70173 Stuttgart",
      
      // Düsseldorf
      "Königsallee 15, 40212 Düsseldorf",
      "Schadowstraße 8, 40212 Düsseldorf",
      
      // Dortmund
      "Westenhellweg 12, 44137 Dortmund",
      "Kampstraße 5, 44137 Dortmund",
      
      // Essen
      "Kettwiger Straße 15, 45127 Essen",
      "Limbecker Platz 3, 45127 Essen",
      
      // Nürnberg
      "Hauptmarkt 1, 90403 Nürnberg",
      "Karolinenstraße 8, 90402 Nürnberg",
      
      // Leipzig
      "Grimmaische Straße 15, 04109 Leipzig",
      "Augustusplatz 2, 04109 Leipzig",
      
      // Dresden
      "Prager Straße 12, 01069 Dresden",
      "Altmarkt 5, 01067 Dresden"
    ];

    // Simple fuzzy matching algorithm for typo tolerance
    const fuzzyMatch = (text: string, query: string): number => {
      const textLower = text.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Exact substring match gets highest score
      if (textLower.includes(queryLower)) return 100;
      
      // Check for similar character sequences
      let score = 0;
      for (let i = 0; i < queryLower.length - 1; i++) {
        const bigram = queryLower.substr(i, 2);
        if (textLower.includes(bigram)) score += 10;
      }
      
      // Check individual character matches
      for (const char of queryLower) {
        if (textLower.includes(char)) score += 1;
      }
      
      return score;
    };

    // Score and filter addresses from entire German database
    const scoredAddresses = germanAddresses
      .map(addr => ({
        address: addr,
        score: fuzzyMatch(addr, input),
        isMainz: addr.includes('Mainz')
      }))
      .filter(item => item.score > 5) // Even lower threshold for maximum coverage
      .sort((a, b) => {
        // Balanced sorting: slight Mainz boost but primarily by relevance score
        const scoreA = a.score + (a.isMainz ? 10 : 0); // Small boost for Mainz
        const scoreB = b.score + (b.isMainz ? 10 : 0);
        return scoreB - scoreA;
      })
      .slice(0, 4);
    
    if (scoredAddresses.length > 0) {
      const localSuggestions = scoredAddresses.map((item, index) => ({
        place_id: `local_${index}`,
        description: item.address,
        structured_formatting: {
          main_text: item.address.split(',')[0],
          secondary_text: item.address.split(',').slice(1).join(',')
        },
        isMainz: item.isMainz,
        hasHouseNumber: true,
        hasRoad: true,
        isComplete: item.isMainz,
        relevanceScore: item.score + (item.isMainz ? 15 : 10) // Balanced scoring for all German cities
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

  // Handle address input change with dynamic German-wide suggestions
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Show instant local suggestions for all German cities
    if (value.length >= 2) {
      // Always show comprehensive German suggestions immediately
      useLocalMainzAddressesWithFuzzy(value);
      
      // Enhance with API suggestions but don't override local ones
      debounceTimerRef.current = setTimeout(() => {
        getAutocompleteSuggestions(value);
      }, 100); // Slightly increased for better API stability
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
        // Show animated house number prompt instead of toast
        setShowHouseNumberPrompt(true);
        setTimeout(() => setShowHouseNumberPrompt(false), 4000); // Auto-hide after 4 seconds
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
            <div className="flex items-center gap-3">
              {/* Input Container */}
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={addressInput}
                    onChange={handleAddressInputChange}
                    placeholder="Deine Adresse hier eingeben..."
                    className="w-full bg-white/95 backdrop-blur-sm rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-[#3cbf5c] text-sm font-medium shadow-lg"
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
                
                {/* Custom Autocomplete Suggestions - positioned relative to input container */}
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
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {suggestions.map((suggestion, index) => (
                        <motion.li
                          key={suggestion.place_id || index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer border-b border-gray-700/50 last:border-b-0 transition-colors duration-200"
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white text-sm truncate">
                                {suggestion.structured_formatting?.main_text || suggestion.description}
                              </div>
                              <div className="text-xs text-gray-400 mt-1 truncate">
                                {suggestion.structured_formatting?.secondary_text || 
                                 suggestion.description?.split(',').slice(1).join(',').trim()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                              {/* Enhanced validation indicators with better logic */}
                              {suggestion.isComplete ? (
                                <span className="text-[#3cbf5c] text-xs font-medium">✓ Vollständig</span>
                              ) : suggestion.isMainz ? (
                                suggestion.hasHouseNumber ? (
                                  <span className="text-[#3cbf5c] text-xs font-medium">✓ Mainz</span>
                                ) : (
                                  <span className="text-yellow-400 text-xs font-medium">🏠 Hausnummer?</span>
                                )
                              ) : suggestion.hasRoad ? (
                                <span className="text-gray-400 text-xs font-medium">🛣️ Straße</span>
                              ) : (
                                <span className="text-red-400 text-xs font-medium">❌ Außerhalb</span>
                              )}
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              
              {/* GPS Button - Separate from input, properly spaced */}
              <button
                onClick={handleGetCurrentLocation}
                className="w-12 h-12 bg-[#100c0c] rounded-full flex items-center justify-center hover:shadow-[0_0_12px_rgba(60,191,92,0.4)] transition-all duration-300 group border border-gray-700/30 backdrop-blur-sm flex-shrink-0"
                title="Aktuellen Standort verwenden"
              >
                <div className="relative">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-[#3cbf5c] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm scale-150"></div>
                  {/* GPS Compass Icon */}
                  <svg 
                    width="20" 
                    height="20" 
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

      {/* Animated House Number Prompt */}
      <AnimatePresence>
        {showHouseNumberPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
            className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", duration: 0.4 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-2 border-[#3cbf5c]/20"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(60,191,92,0.1)'
              }}
            >
              <div className="text-center">
                {/* Animated House Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", duration: 0.5, bounce: 0.4 }}
                  className="w-16 h-16 bg-gradient-to-br from-[#3cbf5c]/10 to-[#3cbf5c]/20 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                >
                  <motion.span 
                    className="text-3xl"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    🏠
                  </motion.span>
                  
                  {/* Pulsing ring around icon */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#3cbf5c]/30"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                </motion.div>

                {/* Main Message */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-semibold text-gray-900 mb-2"
                >
                  Hausnummer fehlt
                </motion.h3>

                {/* Friendly description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 text-sm mb-4 leading-relaxed"
                >
                  Bitte gib eine vollständige Adresse mit Hausnummer ein, um fortzufahren.
                </motion.p>

                {/* Friendly call-to-action */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-[#3cbf5c]/10 rounded-xl p-3 border border-[#3cbf5c]/20"
                >
                  <p className="text-[#3cbf5c] text-sm font-medium">
                    💡 Beispiel: Bahnhofstraße 15, Mainz
                  </p>
                </motion.div>

                {/* Auto-hide indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4"
                >
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#3cbf5c]"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 4, ease: "linear" }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Schließt automatisch</p>
                </motion.div>
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