import { useState } from "react";
import { motion } from "framer-motion";
import { MapComponent } from "@/components/map-component";
import { BottomNavigation } from "@/components/bottom-navigation";
import { BookingModal } from "@/components/booking-modal";
import { WashPackages } from "@/components/wash-packages";
import { WalletTopup } from "@/components/wallet-topup";
import { VehicleManagement } from "@/components/vehicle-management";
import { CleanerForm } from "@/components/cleaner-form";
import { ServiceAreaWarning } from "@/components/service-area-warning";
import { useQuery } from "@tanstack/react-query";
import { Droplets, Circle } from "lucide-react";

type Tab = "home" | "booking" | "wallet" | "cars" | "cleaner";

interface WashPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  popular?: boolean;
  features: string[];
}

const washPackages: WashPackage[] = [
  {
    id: "außenwäsche",
    name: "Außenwäsche",
    price: 35,
    description: "Komplett außen gereinigt",
    icon: "🚗",
    features: ["Vorwäsche & Hauptwäsche", "Felgenreinigung", "Trocknung"]
  },
  {
    id: "innen-außen",
    name: "Innen + Außen",
    price: 39,
    description: "Komplette Fahrzeugreinigung",
    icon: "🚗",
    popular: true,
    features: ["Alles aus Außenwäsche", "Innenraumreinigung", "Staubsaugen"]
  },
  {
    id: "komplett",
    name: "Komplett",
    price: 49,
    description: "Premium-Reinigung",
    icon: "⭐",
    features: ["Alles aus Innen + Außen", "Wachs & Versiegelung", "Reifenglanz"]
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedPackage, setSelectedPackage] = useState<WashPackage | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServiceWarningOpen, setIsServiceWarningOpen] = useState(false);

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: activeTab === "booking",
  });

  const { data: walletBalance = { balance: 0 } } = useQuery({
    queryKey: ["/api/wallet/balance"],
    enabled: activeTab === "wallet",
  });

  const { data: walletTransactions = [] } = useQuery({
    queryKey: ["/api/wallet/transactions"],
    enabled: activeTab === "wallet",
  });

  const handlePackageSelect = (pkg: WashPackage) => {
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };

  const handleLocationOutsideMainz = () => {
    setIsServiceWarningOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="pb-20">
            {/* Welcome Section */}
            <div className="p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-6"
              >
                <h2 className="text-2xl font-bold mb-2">Willkommen bei WASHR</h2>
                <p className="text-blue-100 mb-4">
                  Professionelle Autowäsche direkt vor Ihrer Haustür in Mainz
                </p>
                <button
                  onClick={() => setActiveTab("booking")}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  Jetzt buchen
                </button>
              </motion.div>
            </div>

            {/* Map Section */}
            <div className="px-4 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-slate-800">
                Wählen Sie Ihren Standort
              </h3>
              <MapComponent onLocationOutsideMainz={handleLocationOutsideMainz} />
            </div>

            {/* Wash Packages */}
            <div className="px-4 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">
                Wählen Sie Ihr Paket
              </h3>
              <WashPackages
                packages={washPackages}
                onPackageSelect={handlePackageSelect}
              />
            </div>
          </div>
        );

      case "booking":
        return (
          <div className="p-4 pb-20">
            <h2 className="text-xl font-bold mb-6 text-slate-800">
              Aktuelle Buchungen
            </h2>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600">Noch keine Buchungen vorhanden</p>
                <button
                  onClick={() => setActiveTab("home")}
                  className="mt-4 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  Erste Buchung erstellen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Circle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {booking.status === "pending" ? "Cleaner wird gesucht..." : booking.packageType}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {booking.location}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-primary">
                        {booking.price / 100}€
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case "wallet":
        return (
          <div className="p-4 pb-20">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Wallet</h2>
            <WalletTopup
              balance={walletBalance.balance}
              transactions={walletTransactions}
            />
          </div>
        );

      case "cars":
        return (
          <div className="p-4 pb-20">
            <VehicleManagement />
          </div>
        );

      case "cleaner":
        return (
          <div className="p-4 pb-20">
            <CleanerForm />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Droplets className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">WASHR</h1>
              <p className="text-xs text-slate-500">Autowäsche in Mainz</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Circle className="inline h-2 w-2 text-green-500 mr-1" />
              Verfügbar
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{renderTabContent()}</main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      {isBookingModalOpen && selectedPackage && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          selectedPackage={selectedPackage}
        />
      )}

      <ServiceAreaWarning
        isOpen={isServiceWarningOpen}
        onClose={() => setIsServiceWarningOpen(false)}
      />
    </div>
  );
}
