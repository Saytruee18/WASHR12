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
    description: "Handwäsche ohne Hochdruckreiniger",
    icon: "🚗",
    features: ["Handwäsche", "Felgenreinigung", "Scheibenreinigung außen", "Kein Hochdruckreiniger (öffentlicher Raum)"]
  },
  {
    id: "innen",
    name: "Innenreinigung",
    price: 35,
    description: "Komplette Innenraumpflege",
    icon: "🧽",
    features: ["Staubsaugen", "Oberflächenreinigung", "Cockpit-Pflege", "Spiegel innen über Add-on"]
  },
  {
    id: "beide",
    name: "Innen & Außen",
    price: 59,
    description: "Rundum-Pflege für Ihr Fahrzeug",
    icon: "✨",
    popular: true,
    features: ["Kombination beider Leistungen", "Umfassend & Effizient", "Add-ons zubuchbar", "Beste Preis-Leistung"]
  },
  {
    id: "premium",
    name: "Premium",
    price: 80,
    description: "Exklusivität für Privatgrundstücke",
    icon: "👑",
    features: ["Hochdruckreiniger", "Dampfgerät", "Polierwerkzeuge", "Nur auf Privatgrundstücken"]
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
    setIsBookingModalOpen(true); // Direkt zur Buchung weiterleiten - kein extra "Weiter"-Button nötig
  };

  const handleLocationOutsideMainz = () => {
    setIsServiceWarningOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="pb-20 safe-area-bottom">
            {/* Welcome Section - Mobile Optimized */}
            <div className="p-3 md:p-4 mobile-compact">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-[24px] p-6 md:p-8 text-primary-foreground mb-4 md:mb-6 shadow-2xl shadow-primary/20 mobile-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">WASHR</h2>
                    <p className="text-primary-foreground/80 font-light text-lg">
                      Die Waschanlage, die zu dir kommt.
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
                  className="bg-background text-foreground px-6 md:px-8 py-3 md:py-4 rounded-2xl font-medium hover:bg-muted transition-all shadow-lg text-base md:text-lg touch-target mobile-optimized w-full md:w-auto"
                >
                  Jetzt buchen
                </motion.button>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <div className="px-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20"
              >
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-lg">📍</span>
                    <span className="font-medium">Lokal aktiv</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-lg">🛡️</span>
                    <span className="font-medium">Geprüfte Cleaner</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-lg">⭐️</span>
                    <span className="font-medium">4.9/5 Bewertungen</span>
                  </motion.div>
                </div>
              </motion.div>
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
                  <h4 className="font-bold mb-3 text-lg">WASHR – Deine Autopflege.</h4>
                  <p className="text-muted-foreground font-light">
                    Wo du bist. Wann du willst.<br/>
                    💧 Mobil. Flexibel. Stressfrei.
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
                    🧼 Wählen → 📅 Buchen → 🚗 Reinigen lassen → ✅ Fertig
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Map Section */}
            <div className="px-3 md:px-4 mb-4 md:mb-6 mobile-compact">
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 tracking-tight">
                Wählen Sie Ihren Standort
              </h3>
              <div className="rounded-2xl overflow-hidden mobile-card">
                <MapComponent onLocationOutsideMainz={handleLocationOutsideMainz} />
              </div>
            </div>

            {/* Wash Packages */}
            <div className="px-3 md:px-4 mb-4 md:mb-6 mobile-compact">
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 tracking-tight">
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
          <div className="p-3 md:p-4 pb-20 safe-area-bottom">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">
              Aktuelle Buchungen
            </h2>

            {bookings.length === 0 ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplets className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">Du hast noch keine aktive Buchung</p>
                  <p className="text-sm text-muted-foreground/80">Wähle hier einen unserer beliebtesten Services 👇</p>
                </div>
                
                <WashPackages
                  packages={washPackages}
                  onPackageSelect={handlePackageSelect}
                />
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
                            Buchung aktiv seit: Jetzt
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
          <div className="p-3 md:p-4 pb-20 safe-area-bottom">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Wallet</h2>
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
          <div className="p-3 md:p-4 pb-20 safe-area-bottom">
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
      <header className="bg-card/80 backdrop-blur-xl shadow-sm p-3 md:p-4 border-b border-border/50 sticky top-0 z-40 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg mobile-optimized"
            >
              <Droplets className="text-primary-foreground text-base md:text-lg" />
            </motion.div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight">WASHR</h1>
              <p className="text-xs text-muted-foreground font-light hidden md:block">Autowäsche in Mainz</p>
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
