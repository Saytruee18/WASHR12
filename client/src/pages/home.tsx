import { useState } from "react";
import { motion } from "framer-motion";
import { MapComponent } from "@/components/map-component";
import { BottomNavigation } from "@/components/bottom-navigation";
import { BookingModal } from "@/components/booking-modal";
import { WashPackages } from "@/components/wash-packages";
import { WalletTopup } from "@/components/wallet-topup";
import { VoucherManagement } from "@/components/voucher-management";
import { ProfilePage } from "@/components/profile-page";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ServiceAreaWarning } from "@/components/service-area-warning";
import { useQuery } from "@tanstack/react-query";
import { Droplets, Circle, Shield, Users, Star } from "lucide-react";

type Tab = "home" | "booking" | "wallet" | "profile";

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
    id: "aussen",
    name: "Außenreinigung",
    price: 39,
    description: "Blitzsauber von Außen",
    icon: "🚗",
    features: ["Gründliches manuelles Schrubben", "Felgen & Fenster reinigen", "Ohne Hochdruckreiniger", "Maximale Rücksichtnahme"]
  },
  {
    id: "innen",
    name: "Innenreinigung",
    price: 35,
    description: "Komfort im Innenraum",
    icon: "🧽",
    features: ["Intensives Staubsaugen", "Umfassende Oberflächenreinigung", "Cockpit-Pflege", "Optionale Extras verfügbar"]
  },
  {
    id: "beide",
    name: "Beide (Außen- & Innenreinigung)",
    price: 59,
    description: "Rundum-Pflege",
    icon: "✨",
    popular: true,
    features: ["Das Beste aus beiden Welten", "Komplette Außenreinigung", "Komplette Innenreinigung", "Umfassend & Effizient"]
  },
  {
    id: "premium",
    name: "Premium-Reinigung",
    price: 80,
    description: "Exklusivität für Privatgrundstücke",
    icon: "👑",
    features: ["Ultimative Tiefenreinigung", "Hochdruckreiniger", "Spezielle Polsterreiniger", "Professionelle Lackversiegelung", "Nur auf Privatgrundstücken"]
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
                className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-[32px] p-8 text-primary-foreground mb-6 shadow-2xl shadow-primary/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">Willkommen bei WASHR</h2>
                    <p className="text-primary-foreground/80 font-light text-lg">
                      Mainz' Nr. 1 für mobile Autopflege
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <Droplets className="h-8 w-8 text-white" />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("booking")}
                  className="bg-background text-foreground px-8 py-4 rounded-2xl font-medium hover:bg-muted transition-all shadow-lg text-lg"
                >
                  Jetzt buchen
                </motion.button>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <div className="px-4 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-card rounded-2xl p-4 text-center border border-border/50 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">100% lokal</div>
                  <div className="text-xs text-muted-foreground font-light">aus Mainz</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-card rounded-2xl p-4 text-center border border-border/50 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">Geprüfte</div>
                  <div className="text-xs text-muted-foreground font-light">Cleaner</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-card rounded-2xl p-4 text-center border border-border/50 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">4.9/5</div>
                  <div className="text-xs text-muted-foreground font-light">Bewertung</div>
                </motion.div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="px-4 mb-6">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl"
                >
                  <h4 className="font-bold mb-3 text-lg">Was ist WASHR?</h4>
                  <p className="text-muted-foreground font-light">
                    Mobile Autopflege direkt zu Ihnen - professionell, schnell und umweltfreundlich.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl"
                >
                  <h4 className="font-bold mb-3 text-lg">Wie funktioniert's?</h4>
                  <p className="text-muted-foreground font-light">
                    Paket wählen → Termin buchen → Cleaner kommt zu Ihnen → Bezahlen per App.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Map Section */}
            <div className="px-4 mb-6">
              <h3 className="text-xl font-bold mb-4 tracking-tight">
                Wählen Sie Ihren Standort
              </h3>
              <MapComponent onLocationOutsideMainz={handleLocationOutsideMainz} />
            </div>

            {/* Wash Packages */}
            <div className="px-4 mb-6">
              <h3 className="text-xl font-bold mb-4 tracking-tight">
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
            <h2 className="text-xl font-bold mb-6">
              Aktuelle Buchungen
            </h2>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Noch keine Buchungen vorhanden</p>
                <button
                  onClick={() => setActiveTab("home")}
                  className="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
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
                    className="bg-card rounded-2xl p-6 border border-border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Circle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {booking.status === "pending" ? "Cleaner wird gesucht..." : booking.packageType}
                          </h3>
                          <p className="text-sm text-muted-foreground">
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
            <h2 className="text-xl font-bold mb-6">Wallet</h2>
            <div className="space-y-6">
              <WalletTopup
                balance={walletBalance.balance}
                transactions={walletTransactions}
              />
              <VoucherManagement />
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="p-4 pb-20">
            <ProfilePage />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl shadow-sm p-4 border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Droplets className="text-primary-foreground text-lg" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">WASHR</h1>
              <p className="text-xs text-muted-foreground font-light">Autowäsche in Mainz</p>
            </div>
          </div>
          <ProfileDropdown />
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
