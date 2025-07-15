// client/src/components/profile-page.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Settings,
  Gift,
  MessageCircle,
  Users,
  ChevronRight,
  Edit3,
  FileText,
  Shield,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CleanerForm } from "@/components/cleaner-form";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ProfilePageProps {
  setIsLegalModalOpen: (isOpen: boolean) => void;
  setSelectedLegalContent: (content: string | null) => void;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function ProfilePage({
  setIsLegalModalOpen,
  setSelectedLegalContent,
}: ProfilePageProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCleanerFormOpen, setIsCleanerFormOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "Max",
    lastName: "Mustermann",
    email: "max@example.com",
    phone: "+49 123 456 789",
  });
  const { toast } = useToast();

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const { data: walletBalance = { balance: 0 } } = useQuery({
    queryKey: ["/api/wallet/balance"],
  });

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    toast({
      title: "Profil aktualisiert",
      description: "Ihre Daten wurden erfolgreich gespeichert.",
    });
  };

  const handleReferFriend = () => {
    const referralLink = `${window.location.origin}?ref=${btoa(profileData.email)}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link kopiert",
      description:
        "Teilen Sie den Link mit Freunden und erhalten Sie beide 5€ Guthaben!",
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-primary-foreground/80">
                  {profileData.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingProfile(true)}
              className="text-white hover:bg-white/20"
            >
              <Edit3 className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {bookings.length}
              </div>
              <div className="text-sm text-muted-foreground">Buchungen</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {(walletBalance.balance / 100).toFixed(0)}€
              </div>
              <div className="text-sm text-muted-foreground">Guthaben</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Menu Items (Cleaner werden, Freund einladen, Support kontaktieren) */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCleanerFormOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Cleaner werden</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleReferFriend}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-t border-border"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Freund einladen</div>
                  <div className="text-sm text-muted-foreground">
                    Beide erhalten 5€ Guthaben
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open("mailto:washr.mainz@gmail.com")}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-t border-border"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Support kontaktieren</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          </div>
        </CardContent>
      </Card>

      {/* CARD FÜR RECHTLICHE HINWEISE */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rechtliche Hinweise</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              onClick={() => {
                setSelectedLegalContent("impressum");
                setIsLegalModalOpen(true);
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Impressum</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-t border-border"
              onClick={() => {
                setSelectedLegalContent("datenschutz");
                setIsLegalModalOpen(true);
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Datenschutzerklärung</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-t border-border"
              onClick={() => {
                setSelectedLegalContent("agb");
                setIsLegalModalOpen(true);
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Book className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">AGB</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-t border-border"
              onClick={() => {
                setSelectedLegalContent("widerrufsrecht");
                setIsLegalModalOpen(true);
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Widerrufsrecht</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Letzte Buchungen</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Buchungen vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 3).map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{booking.packageType}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{booking.price / 100}€</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full">
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cleaner Form Dialog */}
      <Dialog open={isCleanerFormOpen} onOpenChange={setIsCleanerFormOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cleaner werden</DialogTitle>
          </DialogHeader>
          <CleanerForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
