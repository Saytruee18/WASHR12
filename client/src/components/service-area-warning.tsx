import { MapPin } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ServiceAreaWarningProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceAreaWarning({ isOpen, onClose }: ServiceAreaWarningProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-red-500 h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Servicebereich</h2>
          <p className="text-slate-600 mb-6">
            Dieser Ort liegt außerhalb unseres Servicebereichs. Leider sind wir aktuell nur in Mainz aktiv.
          </p>
          <Button onClick={onClose} className="w-full">
            Verstanden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
