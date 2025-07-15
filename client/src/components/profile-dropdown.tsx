import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, FileText, Shield, Book, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfilePage } from "@/components/profile-page";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const profileData = {
    name: "Max Mustermann",
    email: "max@example.com",
    initials: "MM"
  };

  const menuItems = [
    { icon: User, label: "Buchungshistorie", action: () => {} },
    { icon: Mail, label: "Support kontaktieren", action: () => window.open('mailto:washr.mainz@gmail.com') },
    { icon: FileText, label: "Impressum & Rechtliches", action: () => { setIsLegalModalOpen(true); setIsOpen(false); } },
  ];

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {profileData.initials}
            </AvatarFallback>
          </Avatar>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl z-50"
            >
              {/* Profile Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {profileData.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{profileData.name}</div>
                    <div className="text-sm text-muted-foreground">{profileData.email}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil</DialogTitle>
          </DialogHeader>
          <ProfilePage />
        </DialogContent>
      </Dialog>

      {/* Legal Modal */}
      <Dialog open={isLegalModalOpen} onOpenChange={setIsLegalModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Impressum & Rechtliches</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Impressum</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>WASHR GmbH</strong></p>
                <p>Musterstraße 123</p>
                <p>55116 Mainz</p>
                <p>Deutschland</p>
                <p>E-Mail: washr.mainz@gmail.com</p>
                <p>Telefon: +49 6131 123456</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Datenschutzerklärung</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung personenbezogener Daten.</p>
                <p><strong>Verantwortlicher:</strong> WASHR GmbH</p>
                <p><strong>Kontakt:</strong> washr.mainz@gmail.com</p>
                <p><strong>Erhobene Daten:</strong> Kontaktdaten, Standortdaten, Buchungshistorie</p>
                <p><strong>Zweck:</strong> Durchführung des Services, Kommunikation, Verbesserung der Dienstleistung</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Allgemeine Geschäftsbedingungen</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>1. Geltungsbereich:</strong> Diese AGB gelten für alle Verträge zwischen WASHR GmbH und dem Kunden.</p>
                <p><strong>2. Leistungen:</strong> WASHR bietet mobile Autoreinigungsdienstleistungen in Mainz und Umgebung an.</p>
                <p><strong>3. Preise:</strong> Die Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.</p>
                <p><strong>4. Zahlung:</strong> Die Bezahlung erfolgt über die angegebenen Zahlungsmethoden in der App.</p>
                <p><strong>5. Stornierung:</strong> Stornierungen sind bis 24 Stunden vor dem Termin kostenfrei möglich.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}