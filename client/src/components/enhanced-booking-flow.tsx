import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Car, Calendar, CreditCard, ChevronRight, Check } from "lucide-react";
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

const timeSlots = [
  "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00",
  "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"
];

export function EnhancedBookingFlow({ selectedPackage, onComplete, onCancel }: EnhancedBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    location: "Mainz, Deutschland",
    manufacturer: "",
    model: "",
    color: "",
    licensePlate: "",
    date: "",
    timeSlot: "",
    paymentMethod: "wallet",
    isPrivateProperty: false,
  });
  const { toast } = useToast();

  const totalSteps = selectedPackage.id === "privatgrundstück" ? 4 : 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (selectedPackage.id === "privatgrundstück" && !formData.isPrivateProperty) {
      toast({
        title: "Bestätigung erforderlich",
        description: "Bitte bestätigen Sie, dass die Reinigung auf privatem Grundstück erfolgt.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      packageType: selectedPackage.id,
      vehicleType: `${formData.manufacturer} ${formData.model}`,
      vehicleModel: formData.model,
      color: formData.color,
      licensePlate: formData.licensePlate,
      location: formData.location,
      bookingDate: new Date(`${formData.date}T${formData.timeSlot.split(" - ")[0]}:00`),
      timeSlot: formData.timeSlot,
      price: selectedPackage.price * 100,
      paymentMethod: formData.paymentMethod,
    };

    onComplete(bookingData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.manufacturer && formData.model;
      case 2:
        return formData.date && formData.timeSlot;
      case 3:
        return formData.paymentMethod;
      case 4:
        return formData.isPrivateProperty;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Fahrzeug auswählen</h3>
                <p className="text-muted-foreground font-light">Wählen Sie Ihr Fahrzeug aus</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufacturer" className="font-medium">Hersteller</Label>
                <Select value={formData.manufacturer} onValueChange={(value) => setFormData({...formData, manufacturer: value})}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {carManufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="model" className="font-medium">Modell</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="z.B. A4"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color" className="font-medium">Farbe (optional)</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  placeholder="z.B. Schwarz"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="licensePlate" className="font-medium">Kennzeichen (optional)</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  placeholder="z.B. MZ-AB 123"
                  className="mt-2"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Termin wählen</h3>
                <p className="text-muted-foreground font-light">Wann soll gereinigt werden?</p>
              </div>
            </div>

            <div>
              <Label htmlFor="date" className="font-medium">Datum</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="font-medium">Uhrzeit</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
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
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Bezahlung</h3>
                <p className="text-muted-foreground font-light">Wählen Sie Ihre Zahlungsart</p>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setFormData({...formData, paymentMethod: "wallet"})}
                className={`w-full p-4 rounded-xl border transition-all ${
                  formData.paymentMethod === "wallet"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Wallet</div>
                      <div className="text-sm text-muted-foreground">Aus Guthaben bezahlen</div>
                    </div>
                  </div>
                  {formData.paymentMethod === "wallet" && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setFormData({...formData, paymentMethod: "stripe"})}
                className={`w-full p-4 rounded-xl border transition-all ${
                  formData.paymentMethod === "stripe"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Kreditkarte</div>
                      <div className="text-sm text-muted-foreground">Direkt mit Karte bezahlen</div>
                    </div>
                  </div>
                  {formData.paymentMethod === "stripe" && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </motion.button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Gesetzliche Bestimmungen</h3>
                <p className="text-muted-foreground font-light">Bitte bestätigen Sie die Reinigung</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center mt-1">
                      <span className="text-yellow-500 text-sm">⚠️</span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Wichtiger Hinweis</h4>
                      <p className="text-sm text-muted-foreground">
                        Die Außenreinigung mit Wasser ist nur auf privatem Grundstück erlaubt. 
                        Öffentliche Plätze sind ausgeschlossen (gemäß deutscher Gesetzgebung).
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 pt-4">
                    <Checkbox
                      id="privateProperty"
                      checked={formData.isPrivateProperty}
                      onCheckedChange={(checked) => setFormData({...formData, isPrivateProperty: checked as boolean})}
                    />
                    <Label htmlFor="privateProperty" className="text-sm font-medium">
                      Ich bestätige, dass die Reinigung auf privatem Grundstück erfolgt
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
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
        
        <Button 
          onClick={handleNext}
          disabled={!canProceed()}
          className="min-w-[120px]"
        >
          {currentStep === totalSteps ? "Buchen" : "Weiter"}
          {currentStep < totalSteps && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}