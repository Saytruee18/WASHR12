import { useState } from "react";
import { motion } from "framer-motion";
import { MapComponent } from "@/components/map-component";
import { BottomNavigation } from "@/components/bottom-navigation";
import { BookingModal } from "@/components/booking-modal";
import { WashPackages } from "@/components/wash-packages";
import { WalletTopup } from "@/components/wallet-topup";
import { VoucherManagement } from "@/components/voucher-management";
import { ProfilePage } from "@/components/profile-page";
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
    id: "basic-trocken",
    name: "Basic Reinigung (trocken)",
    price: 25,
    description: "Innenreinigung ohne Wasser",
    icon: "🧽",
    features: ["Innenraumreinigung", "Staubsaugen", "Oberflächenreinigung", "Überall buchbar"]
  },
  {
    id: "privatgrundstück",
    name: "Privatgrundstück Reinigung",
    price: 45,
    description: "Vollreinigung mit Wasser",
    icon: "🏠",
    popular: true,
    features: ["Außen- & Innenreinigung", "Hochdruckreinigung", "Wachs & Versiegelung", "Nur auf Privatgrundstück"]
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
                className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground mb-6"
              >
                <h2 className="text-2xl font-bold mb-2">Willkommen bei WASHR</h2>
                <p className="text-primary-foreground/80 mb-4">
                  Mainz' Nr. 1 für mobile Autopflege
                </p>
                <button
                  onClick={() => setActiveTab("booking")}
                  className="bg-background text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-muted transition-colors"
                >
                  Jetzt buchen
                </button>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <div className="px-4 mb-6">
              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-xl p-3 text-center"
                >
                  <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-xs font-medium">100% lokal</div>
                  <div className="text-xs text-muted-foreground">aus Mainz</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-xl p-3 text-center"
                >
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-xs font-medium">Geprüfte</div>
                  <div className="text-xs text-muted-foreground">Cleaner</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-xl p-3 text-center"
                >
                  <Star className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-xs font-medium">4.9/5</div>
                  <div className="text-xs text-muted-foreground">Bewertung</div>
                </motion.div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="px-4 mb-6">
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card rounded-xl p-4"
                >
                  <h4 className="font-semibold mb-2">Was ist WASHR?</h4>
                  <p className="text-sm text-muted-foreground">
                    Mobile Autopflege direkt zu Ihnen - professionell, schnell und umweltfreundlich.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-card rounded-xl p-4"
                >
                  <h4 className="font-semibold mb-2">Wie funktioniert's?</h4>
                  <p className="text-sm text-muted-foreground">
                    Paket wählen → Termin buchen → Cleaner kommt zu Ihnen → Bezahlen per App.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Map Section */}
            <div className="px-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Wählen Sie Ihren Standort
              </h3>
              <MapComponent onLocationOutsideMainz={handleLocationOutsideMainz} />
            </div>

            {/* Wash Packages */}
            <div className="px-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">
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
      <header className="bg-card shadow-sm p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Droplets className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold">WASHR</h1>
              <p className="text-xs text-muted-foreground">Autowäsche in Mainz</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              <Circle className="inline h-2 w-2 text-primary mr-1" />
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
