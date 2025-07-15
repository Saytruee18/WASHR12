import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { EnhancedBookingFlow } from "@/components/enhanced-booking-flow";

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

export function BookingModal({ isOpen, onClose, selectedPackage }: BookingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Buchung erfolgreich!",
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

  const handleBookingComplete = (bookingData: any) => {
    createBookingMutation.mutate(bookingData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center">
            {selectedPackage.name}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {selectedPackage.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6">
          <EnhancedBookingFlow
            selectedPackage={selectedPackage}
            onComplete={handleBookingComplete}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}