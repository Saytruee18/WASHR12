import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChevronLeft, User, Phone, Mail, FileText, CheckCircle, Play, MapPin, MessageSquare, Upload } from "lucide-react";

export function CleanerForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    motivation: "",
    hasDriversLicense: false,
    hasClearanceRecord: false,
    isOver18: false,
  });

  const { toast } = useToast();

  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const response = await apiRequest("POST", "/api/cleaner-applications", applicationData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bewerbung eingereicht",
        description: "Vielen Dank für Ihre Bewerbung! Wir melden uns bald bei Ihnen.",
      });
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        motivation: "",
        hasDriversLicense: false,
        hasClearanceRecord: false,
        isOver18: false,
      });
      setCurrentStep(1);
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Bewerbung konnte nicht eingereicht werden.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.motivation || !formData.address || !formData.postalCode || !formData.city) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.hasDriversLicense || !formData.hasClearanceRecord || !formData.isOver18) {
      toast({
        title: "Fehler",
        description: "Bitte bestätigen Sie alle Voraussetzungen.",
        variant: "destructive",
      });
      return;
    }

    submitApplicationMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return true; // Marketing page, no validation needed
      case 2:
        return formData.firstName && formData.lastName;
      case 3:
        return formData.address && formData.postalCode && formData.city;
      case 4:
        return formData.phone && formData.email;
      case 5:
        return formData.motivation.trim().length > 0;
      case 6:
        return formData.hasDriversLicense && formData.hasClearanceRecord && formData.isOver18;
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
              <Play className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Willkommen bei WASHR!</h3>
              <p className="text-muted-foreground">Starte hier mit einem kurzen Einführungsvideo</p>
            </div>

            <div className="space-y-6">
              <div className="bg-card/50 rounded-2xl p-6 border text-center">
                <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Play className="mx-auto h-12 w-12 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Video kommt bald!</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Starte hier mit einem kurzen Einführungsvideo — kommt bald!
                </p>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                <h4 className="font-bold text-lg mb-3">💰 Verdienst-System</h4>
                <p className="text-sm text-foreground">
                  Bei uns wirst du nicht nach Stunden bezahlt, sondern für jede erfolgreich abgeschlossene Mission.
                </p>
              </div>
            </div>
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
              <User className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Persönliche Daten</h3>
              <p className="text-muted-foreground">Wie heißen Sie?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-lg font-medium">Vorname</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Max"
                  className="mt-3 text-lg py-4 touch-target mobile-optimized"
                  autoFocus
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-lg font-medium">Nachname</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Mustermann"
                  className="mt-3 text-lg py-4 touch-target mobile-optimized"
                  required
                />
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
              <MapPin className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Adresse</h3>
              <p className="text-muted-foreground">Wo wohnen Sie?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="address" className="text-lg font-medium">Straße & Hausnummer</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Musterstraße 123"
                  className="mt-3 text-lg py-4 touch-target mobile-optimized"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode" className="text-lg font-medium">PLZ</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    placeholder="55116"
                    className="mt-3 text-lg py-4 touch-target mobile-optimized"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-lg font-medium">Stadt</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Mainz"
                    className="mt-3 text-lg py-4 touch-target mobile-optimized"
                    required
                  />
                </div>
              </div>
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
              <Phone className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Kontaktdaten</h3>
              <p className="text-muted-foreground">Wie können wir Sie erreichen?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-lg font-medium">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+49 123 456 789"
                  className="mt-3 text-lg py-4 touch-target mobile-optimized"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-lg font-medium">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="max@beispiel.de"
                  className="mt-3 text-lg py-4 touch-target mobile-optimized"
                  required
                />
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
              <MessageSquare className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Motivation</h3>
              <p className="text-muted-foreground">Warum möchten Sie bei uns arbeiten?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="motivation" className="text-lg font-medium">Ihre Motivation</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange("motivation", e.target.value)}
                  placeholder="Erzählen Sie uns, warum Sie gerne bei WASHR arbeiten möchten..."
                  className="mt-3 text-lg py-4 touch-target mobile-optimized min-h-[120px]"
                  required
                />
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Upload className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Bewerbungsunterlagen</h3>
              <p className="text-muted-foreground">Bestätigen Sie die Voraussetzungen</p>
            </div>

            <div className="space-y-6">
              <div className="bg-card/50 rounded-2xl p-6 border space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="driversLicense"
                    checked={formData.hasDriversLicense}
                    onCheckedChange={(checked) => handleInputChange("hasDriversLicense", checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="driversLicense" className="text-sm font-medium leading-relaxed">
                    Ich besitze einen gültigen Führerschein
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="clearanceRecord"
                    checked={formData.hasClearanceRecord}
                    onCheckedChange={(checked) => handleInputChange("hasClearanceRecord", checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="clearanceRecord" className="text-sm font-medium leading-relaxed">
                    Ich kann ein einwandfreies Führungszeugnis vorlegen
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="over18"
                    checked={formData.isOver18}
                    onCheckedChange={(checked) => handleInputChange("isOver18", checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="over18" className="text-sm font-medium leading-relaxed">
                    Ich bin mindestens 18 Jahre alt
                  </Label>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                <h4 className="font-bold text-lg mb-3">📄 Bewerbungsschreiben & Zertifikate</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Laden Sie optional Ihr Bewerbungsschreiben und relevante Zertifikate hoch.
                </p>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 text-center">
                    <Upload className="mx-auto h-8 w-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Bewerbungsschreiben hochladen</p>
                  </div>
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 text-center">
                    <Upload className="mx-auto h-8 w-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Zertifikate hochladen</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 bg-background min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Cleaner werden</h2>
          <p className="text-muted-foreground">
            Werden Sie Teil unseres Teams und verdienen Sie Geld mit flexiblen Arbeitszeiten.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Schritt {currentStep} von 6</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / 6) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: "16.66%" }}
              animate={{ width: `${(currentStep / 6) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-2xl p-6 border shadow-sm">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Zurück</span>
              </Button>
            ) : (
              <div /> // Empty div to maintain layout
            )}

            {currentStep < 6 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed(currentStep)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium"
              >
                Weiter
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canProceed(currentStep) || submitApplicationMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium"
              >
                {submitApplicationMutation.isPending ? "Wird gesendet..." : "Bewerbung senden"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}