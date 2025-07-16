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
import { ChevronLeft, User, Phone, Mail, FileText, CheckCircle } from "lucide-react";

export function CleanerForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
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
    
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.motivation) {
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
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName;
      case 2:
        return formData.phone && formData.email;
      case 3:
        return formData.motivation.trim().length > 0;
      case 4:
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
              <Phone className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Kontaktdaten</h3>
              <p className="text-muted-foreground">Wie können wir Sie erreichen?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-lg font-medium">Telefonnummer</Label>
                <Input
                  id="phone"
                  type="tel"
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
                  placeholder="max@example.com"
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
              <FileText className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Motivation</h3>
              <p className="text-muted-foreground">Warum möchten Sie bei uns arbeiten?</p>
            </div>

            <div>
              <Label htmlFor="motivation" className="text-lg font-medium">Ihre Motivation</Label>
              <Textarea
                id="motivation"
                value={formData.motivation}
                onChange={(e) => handleInputChange("motivation", e.target.value)}
                placeholder="Erzählen Sie uns von Ihrer Motivation..."
                className="mt-3 text-base py-4 h-32 touch-target mobile-optimized"
                required
              />
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
              <CheckCircle className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Voraussetzungen</h3>
              <p className="text-muted-foreground">Bestätigen Sie die Anforderungen</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                <Checkbox
                  id="hasDriversLicense"
                  checked={formData.hasDriversLicense}
                  onCheckedChange={(checked) => handleInputChange("hasDriversLicense", checked)}
                />
                <label htmlFor="hasDriversLicense" className="text-sm leading-5 cursor-pointer">
                  Ich besitze einen gültigen Führerschein
                </label>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                <Checkbox
                  id="hasClearanceRecord"
                  checked={formData.hasClearanceRecord}
                  onCheckedChange={(checked) => handleInputChange("hasClearanceRecord", checked)}
                />
                <label htmlFor="hasClearanceRecord" className="text-sm leading-5 cursor-pointer">
                  Ich habe ein einwandfreies Führungszeugnis
                </label>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                <Checkbox
                  id="isOver18"
                  checked={formData.isOver18}
                  onCheckedChange={(checked) => handleInputChange("isOver18", checked)}
                />
                <label htmlFor="isOver18" className="text-sm leading-5 cursor-pointer">
                  Ich bin mindestens 18 Jahre alt
                </label>
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
            <span className="text-sm text-muted-foreground">Schritt {currentStep} von 4</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: "25%" }}
              animate={{ width: `${(currentStep / 4) * 100}%` }}
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
              <div></div>
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed(currentStep)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-2xl font-semibold touch-target mobile-optimized"
              >
                Weiter
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canProceed(currentStep) || submitApplicationMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-2xl font-semibold touch-target mobile-optimized"
              >
                {submitApplicationMutation.isPending ? "Wird eingereicht..." : "Bewerbung einreichen"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}