import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Car, Calendar, CreditCard, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface WashPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  features: string[];
}

interface EnhancedBookingFlowProps {
  selectedPackage: WashPackage;
  onComplete: (bookingData: any) => void;
  onCancel: () => void;
}

const carManufacturers = [
  "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Opel", "Ford", "Renault", "Peugeot", "Skoda", "Seat"
];

const vehicleTypes = [
  { id: "kleinwagen", name: "Kleinwagen", icon: "🚗", surcharge: 0 },
  { id: "limousine", name: "Limousine", icon: "🚘", surcharge: 0 },
  { id: "suv", name: "SUV", icon: "🚙", surcharge: 5 },
];

const timeSlots = [
  "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00",
  "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"
];

interface AddOn {
  id: string;
  name: string;
  price: number;
  icon: string;
  availableFor: string[]; // package IDs where this add-on is available
  description?: string;
}

const addOns: AddOn[] = [
  {
    id: "felgenreinigung",
    name: "Felgenreinigung & Detailpflege",
    price: 3.99,
    icon: "🛞",
    availableFor: ["aussen", "beide", "premium"],
    description: "Gründliche Handreinigung der Felgen-Innenseiten, Rillen & Speichen mit speziellen Bürsten. Keine Maschinen – 100% manuell & umweltschonend."
  },
  {
    id: "duftbaum",
    name: "Duftbaum",
    price: 3,
    icon: "🌿",
    availableFor: ["innen", "beide", "premium"]
  },
  {
    id: "kofferraum-intensiv",
    name: "Kofferraum intensiv",
    price: 5,
    icon: "📦",
    availableFor: ["innen", "beide", "premium"]
  },
  {
    id: "desinfektion",
    name: "Innenraum-Desinfektion",
    price: 8,
    icon: "🧽",
    availableFor: ["innen", "beide", "premium"]
  },
  {
    id: "tierhaare",
    name: "Tierhaare entfernen",
    price: 10,
    icon: "🐕",
    availableFor: ["innen", "beide", "premium"]
  }
];

export function EnhancedBookingFlow({ selectedPackage, onComplete, onCancel }: EnhancedBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [skipLicensePlate, setSkipLicensePlate] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    vehicleType: "",
    licensePlate: "",
    date: "",
    timeSlot: "",
    paymentMethod: "wallet",
    useCurrentLocation: false,
    isPrivateProperty: false,
  });
  const { toast } = useToast();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Smart filtering: Remove redundant add-ons based on selected package
  const availableAddOns = addOns.filter(addOn => {
    if (!addOn.availableFor.includes(selectedPackage.id)) return false;
    
    // Remove redundant add-ons based on package type
    if (selectedPackage.id === "innen" && addOn.id.includes("aussen")) return false;
    if (selectedPackage.id === "aussen" && addOn.id.includes("innen") && addOn.id !== "spiegel-innen") return false;
    
    return true;
  });

  const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
    const addOn = addOns.find(a => a.id === addOnId);
    return total + (addOn?.price || 0);
  }, 0);

  const vehicleSurcharge = vehicleTypes.find(v => v.id === formData.vehicleType)?.surcharge || 0;
  const totalPrice = selectedPackage.price + addOnTotal + vehicleSurcharge;

  // Auto-advance on vehicle selection (Uber-style)
  const handleVehicleSelect = (vehicleId: string) => {
    setFormData(prev => ({ ...prev, vehicleType: vehicleId }));
    // Auto-advance to next step after brief delay
    setTimeout(() => setCurrentStep(2), 500);
  };

  // Auto-advance on license plate input (4-5 characters)
  useEffect(() => {
    if (formData.licensePlate.length >= 4 && currentStep === 2 && !skipLicensePlate) {
      const timer = setTimeout(() => setCurrentStep(3), 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.licensePlate, currentStep, skipLicensePlate]);

  // Handle "skip license plate" option
  const handleSkipLicensePlate = () => {
    setSkipLicensePlate(true);
    setFormData(prev => ({ ...prev, licensePlate: "" }));
    setCurrentStep(3);
  };

  // Initialize date to 2025 if not set
  useEffect(() => {
    if (!formData.date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateString }));
    }
  }, [formData.date]);

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    // For now, we'll skip the private property check to simplify the flow
    // if (selectedPackage.id === "premium" && !formData.isPrivateProperty) {
    //   toast({
    //     title: "Bestätigung erforderlich",
    //     description: "Bitte bestätigen Sie, dass die Reinigung auf privatem Grundstück erfolgt.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    const bookingData = {
      packageType: selectedPackage.id,
      vehicleType: formData.vehicleType,
      licensePlate: formData.licensePlate,
      location: formData.location || "Standort automatisch erkannt",
      bookingDate: new Date(`${formData.date}T${formData.timeSlot.split(" - ")[0]}:00`),
      timeSlot: formData.timeSlot,
      price: totalPrice * 100, // Include add-ons and vehicle surcharge in total price
      addOns: selectedAddOns,
      vehicleSurcharge: vehicleSurcharge,
      paymentMethod: "wallet", // Default payment method
    };

    // Success animation and message
    toast({
      title: "🎉 Buchung erfolgreich!",
      description: `Deine ${selectedPackage.name} Buchung wurde erstellt. Wir sehen uns ${formData.date}!`,
    });

    onComplete(bookingData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.vehicleType; // Must select vehicle type
      case 2:
        return true; // License plate is optional, can always proceed
      case 3:
        return true; // Add-ons are optional
      case 4:
        return formData.date && formData.timeSlot && (formData.location || formData.useCurrentLocation);
      case 5:
        return true; // Ready to book
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Fahrzeugklasse wählen</h3>
              <p className="text-muted-foreground">Wähle dein Fahrzeug aus</p>
            </div>

            <div className="space-y-4">
              {vehicleTypes.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVehicleSelect(vehicle.id)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    formData.vehicleType === vehicle.id
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{vehicle.icon}</div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold">{vehicle.name}</div>
                      {vehicle.surcharge > 0 && (
                        <div className="text-sm text-primary">Aufpreis +{vehicle.surcharge}€</div>
                      )}
                    </div>
                    {formData.vehicleType === vehicle.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {formData.vehicleType === "suv" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-primary/10 rounded-xl border border-primary/20"
              >
                <div className="text-sm text-primary font-medium text-center">
                  🚙 SUV erkannt – Aufpreis +5€
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Kennzeichen</h3>
              <p className="text-muted-foreground">Auto-Weiterleitung nach 4-5 Zeichen</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="licensePlate" className="text-lg font-medium">Kennzeichen eingeben</Label>
                <Input
                  id="licensePlate"
                  placeholder="z.B. MZ-AB 123"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                  className="mt-3 text-lg py-4 text-center font-mono tracking-wider touch-target mobile-optimized"
                  maxLength={12}
                  autoFocus
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {formData.licensePlate.length >= 4 
                    ? "✅ Automatische Weiterleitung..." 
                    : `${4 - formData.licensePlate.length} Zeichen bis zur Weiterleitung`
                  }
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Zurück
                  </Button>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    onClick={handleSkipLicensePlate}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-semibold rounded-2xl touch-target mobile-optimized"
                  >
                    🆔 Ohne Kennzeichen fortfahren
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Add-ons auswählen</h3>
              <p className="text-muted-foreground">Erweitere deine Wäsche</p>
            </div>

            <div className="space-y-4">
              {availableAddOns.map((addOn, index) => (
                <motion.div
                  key={addOn.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleAddOn(addOn.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedAddOns.includes(addOn.id)
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{addOn.icon}</span>
                      <div>
                        <div className="font-semibold">{addOn.name}</div>
                        <div className="text-sm text-primary">+{addOn.price}€</div>
                        {addOn.description && (
                          <div className="text-xs text-muted-foreground mt-1">{addOn.description}</div>
                        )}
                      </div>
                    </div>
                    <motion.div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAddOns.includes(addOn.id)
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {selectedAddOns.includes(addOn.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Price Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card/50 rounded-2xl p-4 border"
            >
              <div className="flex justify-between items-center text-lg font-bold text-primary">
                <span>Gesamtpreis:</span>
                <span>{totalPrice}€</span>
              </div>
            </motion.div>

            {/* Next Button */}
            <div className="pt-4">
              <Button
                onClick={() => setCurrentStep(4)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-semibold rounded-2xl touch-target mobile-optimized"
              >
                Weiter zur Terminauswahl
              </Button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Ort & Zeit angeben</h3>
              <p className="text-muted-foreground">Wann und wo sollen wir kommen?</p>
            </div>

            <div className="space-y-6">
              {/* Location Section */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">📍 Ort</Label>
                <div className="space-y-3">
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Adresse eingeben..."
                    className="text-base p-4 rounded-2xl border-2"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({...formData, useCurrentLocation: !formData.useCurrentLocation})}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    📍 Standort automatisch erkennen
                  </motion.button>
                </div>
              </div>

              {/* Time Section */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">🕒 Zeit</Label>
                <div className="space-y-4">
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(2025, 11, 31).toISOString().split('T')[0]}
                    className="text-base p-4 rounded-2xl border-2 touch-target mobile-optimized"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((slot) => (
                      <motion.button
                        key={slot}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({...formData, timeSlot: slot})}
                        className={`p-3 rounded-xl border transition-all ${
                          formData.timeSlot === slot
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-sm font-medium">{slot}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-xl">
                Wir kommen zum gewählten Zeitpunkt direkt zu deinem Standort.
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Zusammenfassung & Buchen</h3>
              <p className="text-muted-foreground">Überprüfe deine Buchung</p>
            </div>

            {/* Summary Card */}
            <div className="bg-card rounded-2xl border p-6 space-y-4">
              {/* Vehicle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{vehicleTypes.find(v => v.id === formData.vehicleType)?.icon}</span>
                  <div>
                    <div className="font-medium">Fahrzeugklasse</div>
                    <div className="text-sm text-muted-foreground">
                      {vehicleTypes.find(v => v.id === formData.vehicleType)?.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Package */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedPackage.icon}</span>
                  <div>
                    <div className="font-medium">Service-Paket</div>
                    <div className="text-sm text-muted-foreground">{selectedPackage.name}</div>
                  </div>
                </div>
                <span className="font-bold">{selectedPackage.price}€</span>
              </div>

              {/* Add-ons */}
              {selectedAddOns.length > 0 && (
                <div className="border-t pt-4">
                  <div className="font-medium mb-2">🧩 Add-ons</div>
                  {selectedAddOns.map(addOnId => {
                    const addOn = addOns.find(a => a.id === addOnId);
                    return addOn ? (
                      <div key={addOnId} className="flex justify-between text-sm">
                        <span>{addOn.name}</span>
                        <span>+{addOn.price}€</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {/* SUV Surcharge */}
              {vehicleSurcharge > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>SUV-Aufpreis</span>
                    <span>+{vehicleSurcharge}€</span>
                  </div>
                </div>
              )}

              {/* Location & Time */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <span>📍</span>
                  <span className="text-sm">{formData.location || "Standort automatisch erkannt"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🕒</span>
                  <span className="text-sm">{formData.date} um {formData.timeSlot}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 flex justify-between items-center text-xl font-bold text-primary">
                <span>💸 Gesamtpreis</span>
                <span>{totalPrice}€</span>
              </div>
            </div>

            {/* Success Animation Placeholder */}
            <motion.div
              className="text-center p-8 bg-primary/5 rounded-2xl border-2 border-primary/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-4xl mb-4">🚀</div>
              <div className="font-semibold text-lg mb-2">Bereit zum Buchen!</div>
              <div className="text-sm text-muted-foreground">
                Klicke auf "Jetzt buchen" um deine Buchung abzuschließen
              </div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Schritt {currentStep} von {totalSteps}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={currentStep === 1 ? onCancel : () => setCurrentStep(currentStep - 1)}
        >
          {currentStep === 1 ? "Abbrechen" : "Zurück"}
        </Button>
      </div>
    </div>
  );
}