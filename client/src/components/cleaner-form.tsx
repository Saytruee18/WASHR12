import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function CleanerForm() {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2 text-slate-800">Cleaner werden</h2>
        <p className="text-slate-600 mb-6">
          Werden Sie Teil unseres Teams und verdienen Sie Geld mit flexiblen Arbeitszeiten.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Persönliche Daten</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Max"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Mustermann"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Telefonnummer</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+49 123 456 789"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="max@example.com"
                required
              />
            </div>
          </div>
        </motion.div>

        {/* Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Motivation</h3>
          <div>
            <Label htmlFor="motivation">Warum möchten Sie mitmachen?</Label>
            <Textarea
              id="motivation"
              value={formData.motivation}
              onChange={(e) => handleInputChange("motivation", e.target.value)}
              placeholder="Erzählen Sie uns von Ihrer Motivation..."
              className="h-32"
              required
            />
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Voraussetzungen</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="clearanceRecord"
                checked={formData.hasClearanceRecord}
                onCheckedChange={(checked) => handleInputChange("hasClearanceRecord", checked as boolean)}
              />
              <Label htmlFor="clearanceRecord">Ich habe ein Führungszeugnis</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="isOver18"
                checked={formData.isOver18}
                onCheckedChange={(checked) => handleInputChange("isOver18", checked as boolean)}
              />
              <Label htmlFor="isOver18">Ich bin mindestens 18 Jahre alt</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="driversLicense"
                checked={formData.hasDriversLicense}
                onCheckedChange={(checked) => handleInputChange("hasDriversLicense", checked as boolean)}
              />
              <Label htmlFor="driversLicense">Ich habe einen Führerschein</Label>
            </div>
          </div>
        </motion.div>

        <Button 
          type="submit"
          disabled={submitApplicationMutation.isPending}
          className="w-full"
        >
          {submitApplicationMutation.isPending ? "Wird eingereicht..." : "Bewerbung absenden"}
        </Button>
      </form>
    </div>
  );
}
