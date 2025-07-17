import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveMap } from "@/components/interactive-map";
import { SideDrawer } from "@/components/side-drawer";
import { BottomNavigation } from "@/components/bottom-navigation";
import { BookingModal } from "@/components/booking-modal";
import { WashPackages } from "@/components/wash-packages";
import { WalletTopup } from "@/components/wallet-topup";
import { VoucherManagement } from "@/components/voucher-management";
import { ProfilePage } from "@/components/profile-page";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ServiceAreaWarning } from "@/components/service-area-warning";
import { CleanerForm } from "@/components/cleaner-form";
import { useQuery } from "@tanstack/react-query";
import { Droplets, Circle, Shield, Users, Star, MapPin, Clock, CheckCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedPackage, setSelectedPackage] = useState<WashPackage | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServiceWarningOpen, setIsServiceWarningOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isAddressInServiceArea, setIsAddressInServiceArea] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const handleLocationSelect = (address: string, isInServiceArea: boolean) => {
    setSelectedAddress(address);
    setIsAddressInServiceArea(isInServiceArea);
    if (!isInServiceArea) {
      setIsServiceWarningOpen(true);
    }
  };

  const handleCreateBooking = () => {
    if (isAddressInServiceArea && selectedAddress) {
      setActiveTab("booking");
    }
  };

  const handleDrawerNavigate = (section: string) => {
    if (section === "cleaner") {
      // Handle cleaner form - could open a modal or navigate to a page
      setActiveTab("profile"); // For now, navigate to profile where cleaner form exists
    } else {
      setActiveTab(section as Tab);
    }
    setIsDrawerOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="relative h-screen">
            {/* Full-screen Interactive Map */}
            <InteractiveMap onLocationSelect={handleLocationSelect} userName={user?.displayName || user?.email?.split('@')[0]} />
            
            {/* Floating Action Button */}
            <AnimatePresence>
              {selectedAddress && isAddressInServiceArea && (
                <motion.div
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 100, scale: 0.8 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute bottom-28 left-4 right-4 z-30"
                >
                  <Button
                    onClick={handleCreateBooking}
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#00ff88] to-[#00dd77] hover:from-[#00dd77] hover:to-[#00ff88] text-black font-bold py-6 px-8 rounded-2xl shadow-xl shadow-[#00ff88]/25 hover:shadow-2xl hover:shadow-[#00ff88]/40 transition-all duration-300 text-lg border-2 border-black/10"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <MapPin className="h-6 w-6" />
                      <span>Create Booking</span>
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Service Not Available Message */}
            <AnimatePresence>
              {selectedAddress && !isAddressInServiceArea && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute bottom-28 left-4 right-4 z-30"
                >
                  <div className="bg-gray-900/95 backdrop-blur-md border-2 border-red-500/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center space-x-3 text-red-400">
                      <Circle className="h-6 w-6 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-lg text-white">Unfortunately, we do not serve this area yet.</p>
                        <p className="text-sm text-red-400 mt-1">Please select an address within the green service zone in Mainz.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
      {/* Conditional Header - Hidden for home tab */}
      {activeTab !== "home" && (
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
      )}

      {/* Floating Header for home tab */}
      {activeTab === "home" && (
        <div className="absolute top-6 left-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/30 p-4 hover:bg-gray-800/80 transition-all text-gray-300 hover:text-white"
              size="sm"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <main className={activeTab === "home" ? "h-screen" : ""}>
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Side Drawer */}
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleDrawerNavigate}
      />

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
