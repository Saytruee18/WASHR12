import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, FileText, Shield, Book, ChevronDown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfilePage } from "@/components/profile-page";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [selectedLegalContent, setSelectedLegalContent] = useState<string | null>(null);
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

  const legalTexts = {
    impressum: {
      title: "Impressum",
      icon: "📄",
      content: `WASHR
Inhaber: Max Mustermann
Adresse: Musterstraße 123
55116 Mainz
E-Mail: washr.mainz@gmail.com
Telefon: +49 6131 123456

Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
Max Mustermann`
    },
    datenschutz: {
      title: "Datenschutzerklärung",
      icon: "🔒",
      content: `1. Erhebung und Verarbeitung personenbezogener Daten
Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies für die Begründung, inhaltliche Ausgestaltung oder Änderung des Rechtsverhältnisses erforderlich ist (Bestandsdaten). Personenbezogene Daten über die Inanspruchnahme unserer Internetseiten (Nutzungsdaten) erheben und verarbeiten wir nur, soweit dies erforderlich ist, um die Inanspruchnahme des Dienstes zu ermöglichen oder abzurechnen.

2. Datensicherheit
Wir sichern unsere Website und sonstigen Systeme durch technische und organisatorische Maßnahmen gegen Verlust, Zerstörung, Zugriff, Veränderung oder Verbreitung Ihrer Daten durch unbefugte Personen.

3. Auskunftsrecht
Sie haben jederzeit das Recht auf Auskunft über die bezüglich Ihrer Person gespeicherten Daten, deren Herkunft und Empfänger sowie den Zweck der Datenverarbeitung. Auskunft über die gespeicherten Daten erhalten Sie unter washr.mainz@gmail.com.

4. Cookies
Unsere App verwendet keine Cookies, die personenbezogene Daten speichern.

5. Änderungen dieser Datenschutzerklärung
Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen.`
    },
    agb: {
      title: "Allgemeine Geschäftsbedingungen (AGB)",
      icon: "📜",
      content: `1. Geltungsbereich
Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der WASHR-App und die Inanspruchnahme unserer Reinigungsdienstleistungen.

2. Vertragsschluss
Die Darstellung der Dienstleistungen in der App stellt kein rechtlich bindendes Angebot dar, sondern eine Aufforderung zur Bestellung. Durch das Absenden einer Buchungsanfrage über die App gibt der Kunde ein verbindliches Angebot ab. Der Vertrag kommt zustande, wenn WASHR die Buchung per E-Mail oder in der App bestätigt.

3. Dienstleistungen und Preise
Die angebotenen Dienstleistungen und die jeweiligen Preise sind in der App detailliert beschrieben. Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.

4. Zahlungsbedingungen
Die Zahlung erfolgt über die in der App angebotenen Zahlungsmethoden. Der Rechnungsbetrag ist sofort nach Abschluss der Reinigung fällig.

5. Haftung
WASHR haftet für Schäden, die durch grobe Fahrlässigkeit oder Vorsatz unserer Mitarbeiter entstehen. Eine Haftung für leichte Fahrlässigkeit ist ausgeschlossen, sofern keine wesentlichen Vertragspflichten verletzt werden.

6. Stornierung
Buchungen können bis zu 24 Stunden vor dem vereinbarten Termin kostenfrei storniert werden. Spätere Stornierungen können Stornogebühren nach sich ziehen.

7. Gerichtsstand
Es gilt deutsches Recht. Gerichtsstand ist Mainz, sofern der Kunde Kaufmann ist oder keinen allgemeinen Gerichtsstand in Deutschland hat.`
    },
    widerrufsrecht: {
      title: "Widerrufsrecht",
      icon: "↩️",
      content: `Widerrufsbelehrung

Widerrufsrecht
Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.

Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (WASHR, Musterstraße 123, 55116 Mainz, E-Mail: washr.mainz@gmail.com) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.

Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.

Folgen des Widerrufs
Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.

Muster-Widerrufsformular
Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück an: washr.mainz@gmail.com`
    }
  };

  const menuItems = [
    { icon: User, label: "Buchungshistorie", action: () => {} },
    { icon: Mail, label: "Support kontaktieren", action: () => window.open('mailto:washr.mainz@gmail.com') },
    { icon: FileText, label: "Impressum", action: () => { setSelectedLegalContent('impressum'); setIsLegalModalOpen(true); setIsOpen(false); } },
    { icon: Shield, label: "Datenschutzerklärung", action: () => { setSelectedLegalContent('datenschutz'); setIsLegalModalOpen(true); setIsOpen(false); } },
    { icon: Book, label: "AGB", action: () => { setSelectedLegalContent('agb'); setIsLegalModalOpen(true); setIsOpen(false); } },
    { icon: FileText, label: "Widerrufsrecht", action: () => { setSelectedLegalContent('widerrufsrecht'); setIsLegalModalOpen(true); setIsOpen(false); } },
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
      <Dialog open={isLegalModalOpen} onOpenChange={(open) => {
        setIsLegalModalOpen(open);
        if (!open) {
          setSelectedLegalContent(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLegalContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLegalContent(null)}
                  className="mr-2 p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {selectedLegalContent ? legalTexts[selectedLegalContent as keyof typeof legalTexts]?.title : "Rechtliche Informationen"}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 max-h-[70vh] pr-4">
            {!selectedLegalContent ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Wählen Sie einen Bereich aus, um die entsprechenden rechtlichen Informationen anzuzeigen:
                </p>
                {Object.entries(legalTexts).map(([key, content]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() => setSelectedLegalContent(key)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{content.icon}</span>
                      <div>
                        <div className="font-medium">{content.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {key === 'impressum' && 'Angaben gemäß § 5 TMG'}
                          {key === 'datenschutz' && 'Informationen zur Datenverarbeitung'}
                          {key === 'agb' && 'Vertragsbedingungen für unsere Services'}
                          {key === 'widerrufsrecht' && 'Ihre Rechte als Verbraucher'}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {legalTexts[selectedLegalContent as keyof typeof legalTexts]?.content}
                </div>
                {selectedLegalContent === 'datenschutz' && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Für weitere Fragen zum Datenschutz kontaktieren Sie uns unter: washr.mainz@gmail.com
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}