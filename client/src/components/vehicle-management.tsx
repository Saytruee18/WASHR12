import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Car, Truck, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const vehicleTypes = [
  {
    id: "kleinwagen",
    name: "Kleinwagen",
    models: ["Fiat 500", "VW Polo", "Opel Corsa", "Renault Clio"],
    icon: Car,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "mittelklasse",
    name: "Mittelklasse",
    models: ["BMW 3er", "Audi A4", "Mercedes C-Klasse", "VW Passat"],
    icon: Car,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "suv",
    name: "SUV",
    models: ["Mercedes GLC", "VW Tiguan", "BMW X3", "Audi Q5"],
    icon: Car,
    color: "bg-purple-100 text-purple-600",
  },
];

const colors = [
  "Schwarz", "Weiß", "Silber", "Grau", "Rot", "Blau", "Grün", "Gelb", "Braun", "Andere"
];

export function VehicleManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    type: "",
    model: "",
    licensePlate: "",
    color: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (vehicleData: any) => {
      const response = await apiRequest("POST", "/api/vehicles", vehicleData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Fahrzeug hinzugefügt",
        description: "Das Fahrzeug wurde erfolgreich zu Ihrer Sammlung hinzugefügt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setIsAddModalOpen(false);
      setNewVehicle({ type: "", model: "", licensePlate: "", color: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fahrzeug konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    },
  });

  const handleAddVehicle = () => {
    if (!newVehicle.type || !newVehicle.model) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie mindestens Fahrzeugtyp und Modell aus.",
        variant: "destructive",
      });
      return;
    }

    createVehicleMutation.mutate(newVehicle);
  };

  const getVehicleTypeInfo = (type: string) => {
    return vehicleTypes.find(v => v.id === type) || vehicleTypes[0];
  };

  const selectedVehicleType = vehicleTypes.find(v => v.id === newVehicle.type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Meine Autos</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Fahrzeug hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Fahrzeugtyp</Label>
                <Select value={newVehicle.type} onValueChange={(value) => setNewVehicle({...newVehicle, type: value, model: ""})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Typ wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedVehicleType && (
                <div>
                  <Label>Fahrzeugmodell</Label>
                  <Select value={newVehicle.model} onValueChange={(value) => setNewVehicle({...newVehicle, model: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Modell wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedVehicleType.models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Kennzeichen (optional)</Label>
                <Input
                  value={newVehicle.licensePlate}
                  onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                  placeholder="MZ-WS 123"
                />
              </div>

              <div>
                <Label>Farbe (optional)</Label>
                <Select value={newVehicle.color} onValueChange={(value) => setNewVehicle({...newVehicle, color: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Farbe wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAddVehicle}
                disabled={createVehicleMutation.isPending}
                className="w-full"
              >
                {createVehicleMutation.isPending ? "Wird hinzugefügt..." : "Fahrzeug hinzufügen"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Saved Vehicles */}
      <div className="space-y-4">
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Noch keine Fahrzeuge gespeichert</p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              Erstes Fahrzeug hinzufügen
            </Button>
          </div>
        ) : (
          vehicles.map((vehicle: any, index: number) => {
            const typeInfo = getVehicleTypeInfo(vehicle.type);
            const Icon = typeInfo.icon;

            return (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{vehicle.model}</h3>
                      <p className="text-sm text-slate-500">
                        {typeInfo.name}
                        {vehicle.color && ` • ${vehicle.color}`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                <div className="border-t pt-4">
                  {vehicle.licensePlate && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Kennzeichen:</span>
                      <span className="font-medium">{vehicle.licensePlate}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-600">Letzte Wäsche:</span>
                    <span className="font-medium">
                      {vehicle.lastWash 
                        ? new Date(vehicle.lastWash).toLocaleDateString("de-DE")
                        : "Noch keine Wäsche"
                      }
                    </span>
                  </div>
                  <Button className="w-full">
                    Jetzt buchen
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
