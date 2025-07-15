// Local storage utilities for vehicle management (no authentication)
export interface SavedVehicle {
  id: string;
  type: string;
  model: string;
  licensePlate?: string;
  color?: string;
  lastWash?: Date;
  createdAt: Date;
}

const STORAGE_KEY = 'washr_vehicles';

export const vehicleStorage = {
  getVehicles(): SavedVehicle[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const vehicles = JSON.parse(stored);
      return vehicles.map((v: any) => ({
        ...v,
        lastWash: v.lastWash ? new Date(v.lastWash) : undefined,
        createdAt: new Date(v.createdAt),
      }));
    } catch (error) {
      console.error('Error loading vehicles:', error);
      return [];
    }
  },

  saveVehicle(vehicle: Omit<SavedVehicle, 'id' | 'createdAt'>): SavedVehicle {
    const vehicles = this.getVehicles();
    const newVehicle: SavedVehicle = {
      ...vehicle,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    vehicles.push(newVehicle);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    
    return newVehicle;
  },

  updateVehicle(id: string, updates: Partial<SavedVehicle>): SavedVehicle | null {
    const vehicles = this.getVehicles();
    const index = vehicles.findIndex(v => v.id === id);
    
    if (index === -1) return null;
    
    vehicles[index] = { ...vehicles[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    
    return vehicles[index];
  },

  deleteVehicle(id: string): boolean {
    const vehicles = this.getVehicles();
    const filtered = vehicles.filter(v => v.id !== id);
    
    if (filtered.length === vehicles.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },
};
