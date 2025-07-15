import { useState } from "react";
import { motion } from "framer-motion";
import { X, Car, Truck, Calendar, Clock, Wallet, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface WashPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  popular?: boolean;
  features: string[];
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: WashPackage;
}

const vehicleTypes = [
  {
    id: "kleinwagen",
    name: "Kleinwagen",
    models: ["Fiat 500", "VW Polo", "Opel Corsa", "Renault Clio"],
    icon: Car,
  },
  {
    id: "mittelklasse",
    name: "Mittelklasse",
    models: ["BMW 3er", "Audi A4", "Mercedes C-Klasse", "VW Passat"],
    icon: Car,
  },
  {
    id: "suv",
    name: "SUV",
    models: ["Mercedes GLC", "VW Tiguan", "BMW X3", "Audi Q5"],
    icon: Car,
  },
  {
    id: "transporter",
    name: "Transporter",
    models: ["Ford Transit", "VW Crafter", "Mercedes Sprinter", "Iveco Daily"],
    icon: Truck,
  },
];

const timeSlots = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

export function BookingModal({ isOpen, onClose, selectedPackage }: BookingModalProps) {
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [location, setLocation] = useState("Mainz, Deutschland");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [discountCode, setDiscountCode] = useState("");
  const [finalPrice, setFinalPrice] = useState(selectedPackage.price);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Buchung erfolgreich!",
        description: `Cleaner wird gesucht... Geschätzte Ankunftszeit: ${data.estimatedArrival}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Buchung konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const validateDiscountMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/discount-codes/validate", { code });
      return response.json();
    },
    onSuccess: (data) => {
      let discount = 0;
      if (data.discountPercent) {
        discount = (selectedPackage.price * data.discountPercent) / 100;
      } else if (data.discountAmount) {
        discount = data.discountAmount / 100; // Convert from cents
      }
      
      setFinalPrice(Math.max(0, selectedPackage.price - discount));
      toast({
        title: "Rabattcode angewendet",
        description: `Sie sparen ${discount.toFixed(2)}€!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Rabattcode ungültig",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!vehicleType || !vehicleModel || !date || !timeSlot) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      packageType: selectedPackage.id,
      vehicleType,
      vehicleModel,
      location,
      bookingDate: new Date(`${date}T${timeSlot.split(" - ")[0]}:00`),
      timeSlot,
      price: Math.round(finalPrice * 100), // Convert to cents
      paymentMethod,
      discountCode: discountCode || null,
      discountAmount: Math.round((selectedPackage.price - finalPrice) * 100),
    };

    createBookingMutation.mutate(bookingData);
  };

  const handleApplyDiscount = () => {
    if (discountCode.trim()) {
      validateDiscountMutation.mutate(discountCode.trim());
    }
  };

  const selectedVehicleType = vehicleTypes.find(v => v.id === vehicleType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Buchung - {selectedPackage.name}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Vehicle Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">1. Fahrzeugtyp wählen</h3>
            <RadioGroup value={vehicleType} onValueChange={setVehicleType}>
              <div className="space-y-3">
                {vehicleTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.id} className="flex items-center space-x-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id} className="flex-1 flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="font-medium">{type.name}</span>
                          <p className="text-sm text-slate-500">{type.models.slice(0, 2).join(", ")}</p>
                        </div>
                        <Icon className="text-slate-400 h-5 w-5" />
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Vehicle Model Selection */}
          {selectedVehicleType && (
            <div>
              <Label>Fahrzeugmodell</Label>
              <Select value={vehicleModel} onValueChange={setVehicleModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Modell wählen" />
                </SelectTrigger>
                <SelectContent>
                  {selectedVehicleType.models.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 2: Location */}
          <div>
            <h3 className="text-lg font-semibold mb-4">2. Standort bestätigen</h3>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Adresse eingeben..."
            />
            <p className="text-sm text-slate-600 mt-2">
              ℹ️ Service ist nur in Mainz verfügbar
            </p>
          </div>

          {/* Step 3: Date & Time */}
          <div>
            <h3 className="text-lg font-semibold mb-4">3. Datum & Zeit wählen</h3>
            <div className="space-y-3">
              <div>
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label>Zeit</Label>
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zeit wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Step 4: Payment Method */}
          <div>
            <h3 className="text-lg font-semibold mb-4">4. Zahlungsmethode</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet" className="flex-1 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium">Wallet-Guthaben</span>
                      <p className="text-sm text-slate-500">Verfügbar: 25,50€</p>
                    </div>
                    <Wallet className="text-slate-400 h-5 w-5" />
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="flex-1 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium">Stripe Checkout</span>
                      <p className="text-sm text-slate-500">Kreditkarte oder PayPal</p>
                    </div>
                    <CreditCard className="text-slate-400 h-5 w-5" />
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Step 5: Discount Code */}
          <div>
            <h3 className="text-lg font-semibold mb-4">5. Rabattcode (optional)</h3>
            <div className="flex space-x-3">
              <Input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Rabattcode eingeben..."
                className="flex-1"
              />
              <Button 
                onClick={handleApplyDiscount}
                disabled={validateDiscountMutation.isPending}
                variant="outline"
              >
                Anwenden
              </Button>
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Gesamtpreis:</span>
              <span className="text-2xl font-bold text-primary">{finalPrice}€</span>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={createBookingMutation.isPending}
              className="w-full"
            >
              {createBookingMutation.isPending ? "Wird gebucht..." : "Jetzt buchen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
