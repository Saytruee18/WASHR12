// client/src/components/profile-page.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  UserPlus,
  Settings,
  Gift,
  MessageCircle,
  Users,
  ChevronRight,
  Edit3,
  FileText,
  Shield,
  Book,
  ArrowLeft,
  LogIn,
  LogOut,
  Star,
  Crown,
  Eye,
  EyeOff,
  Chrome,
  Facebook,
  Check,
  X,
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
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CleanerForm } from "@/components/cleaner-form";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  authStorage,
  User as AuthUser,
  UserBookingData,
} from "@/lib/auth-storage";
import { loyaltyStorage, loyaltyTiers } from "@/lib/loyalty-storage";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface ProfilePageProps {
  initialMode?: 'profile' | 'login' | 'register';
}

export function ProfilePage({ initialMode = 'profile' }: ProfilePageProps = {}) {
  // Firebase integration with fallback
  let firebaseUser = null;
  let firebaseUserData = null;
  let authLoading = false;
  let login = null;
  let register = null;
  let loginWithGoogle = null;
  let loginWithFacebook = null;
  let logout = null;
  let updateUserBookings = null;
  let validatePassword = null;

  try {
    const auth = useAuth();
    firebaseUser = auth.user;
    firebaseUserData = auth.userData;
    authLoading = auth.loading;
    login = auth.login;
    register = auth.register;
    loginWithGoogle = auth.loginWithGoogle;
    loginWithFacebook = auth.loginWithFacebook;
    logout = auth.logout;
    updateUserBookings = auth.updateUserBookings;
    validatePassword = auth.validatePassword;
  } catch (error) {
    // Firebase not configured, fall back to localStorage-based auth
    console.log("Firebase not configured, using localStorage auth");
  }
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCleanerFormOpen, setIsCleanerFormOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(initialMode === 'login');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(initialMode === 'register');
  const [selectedLegalContent, setSelectedLegalContent] = useState<
    string | null
  >(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<UserBookingData | null>(null);
  const [guestBookings, setGuestBookings] = useState<number>(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+49 123 456 789",
  });
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({
    isValid: true,
    errors: [],
  });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const { toast } = useToast();

  // Sync Firebase user with local state
  useEffect(() => {
    if (firebaseUser && firebaseUserData) {
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        firstName: firebaseUserData.firstName,
        lastName: firebaseUserData.lastName,
        displayName: firebaseUserData.displayName,
        joinDate: firebaseUserData.joinDate,
        bookings: firebaseUserData.bookings,
        lastBookingDate: firebaseUserData.lastBookingDate,
      });

      setUserData({
        bookings: firebaseUserData.bookings,
        lastBookingDate: firebaseUserData.lastBookingDate,
        earnedRewards: firebaseUserData.earnedRewards,
        availableRewards: firebaseUserData.availableRewards,
      });

      setProfileData({
        firstName: firebaseUserData.firstName,
        lastName: firebaseUserData.lastName,
        email: firebaseUser.email || "",
        phone: "+49 123 456 789",
      });
    } else if (!firebaseUser) {
      // Guest mode - load guest bookings
      const guestBookingCount = loyaltyStorage.getGuestBookings();
      setGuestBookings(guestBookingCount);
      setUser(null);
      setUserData(null);
      setProfileData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "+49 123 456 789",
      });
    }
  }, [firebaseUser, firebaseUserData]);

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
Max Mustermann`,
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
Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen.`,
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
Es gilt deutsches Recht. Gerichtsstand ist Mainz, sofern der Kunde Kaufmann ist oder keinen allgemeinen Gerichtsstand in Deutschland hat.`,
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
Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück an: washr.mainz@gmail.com`,
    },
  };

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const { data: walletBalance = { balance: 0 } } = useQuery({
    queryKey: ["/api/wallet/balance"],
  });

  // Real-time data synchronization
  useEffect(() => {
    if (firebaseUser && firebaseUserData) {
      // Update loyalty progress with Firebase user data
      const totalBookings = Math.max(
        bookings.length,
        firebaseUserData.bookings || 0,
      );
      loyaltyStorage.updateProgress(totalBookings);
    } else {
      // Guest mode - update loyalty progress with guest bookings
      loyaltyStorage.updateProgress(guestBookings);
    }
  }, [firebaseUser, firebaseUserData, bookings.length, guestBookings]);

  // Handle new bookings
  const handleBookingComplete = async () => {
    if (firebaseUser && updateUserBookings) {
      try {
        await updateUserBookings();
        toast({
          title: "Buchung hinzugefügt!",
          description: "Ihr Fortschritt wurde aktualisiert.",
        });
      } catch (error) {
        toast({
          title: "Fehler",
          description: "Buchung konnte nicht hinzugefügt werden.",
          variant: "destructive",
        });
      }
    } else if (user) {
      // Fallback to localStorage for authenticated users
      const updatedData = authStorage.incrementUserBookings();
      setUserData(updatedData);
      loyaltyStorage.updateProgress(updatedData.bookings);
    } else {
      // Guest mode
      const newCount = Math.min(guestBookings + 1, 10);
      setGuestBookings(newCount);
      loyaltyStorage.setGuestBookings(newCount);
      loyaltyStorage.updateProgress(newCount);
    }
  };

  // Password validation effect
  useEffect(() => {
    if (validatePassword && registerData.password) {
      const validation = validatePassword(
        registerData.password,
        registerData.email,
      );
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({ isValid: true, errors: [] });
    }
  }, [registerData.password, registerData.email, validatePassword]);

  // Get current booking count for display
  const currentBookings = firebaseUser
    ? firebaseUserData?.bookings || 0
    : guestBookings;
  const loyaltyProgress = loyaltyStorage.getProgress();
  const currentTier = loyaltyStorage.getCurrentTier();
  const progressPercentage = loyaltyStorage.getProgressPercentage();

  const handleLogin = async () => {
    // Check privacy checkbox
    const privacyCheckbox = document.getElementById(
      "privacy",
    ) as HTMLInputElement;
    if (!privacyCheckbox?.checked) {
      toast({
        title: "Datenschutzerklärung erforderlich",
        description: "Bitte akzeptieren Sie die Datenschutzerklärung.",
        variant: "destructive",
      });
      return;
    }

    // Close modal immediately for instant UX
    setIsLoginModalOpen(false);
    const loginDataCopy = { ...loginData };
    setLoginData({ email: "", password: "" });

    try {
      const guestBookingCount = loyaltyStorage.getGuestBookings();

      if (login) {
        // Firebase login - context will handle state updates
        await login(loginDataCopy.email, loginDataCopy.password);
      } else {
        // Fallback to localStorage login
        const loggedInUser = authStorage.login(
          loginDataCopy.email,
          loginDataCopy.password,
        );
        setUser(loggedInUser);
        setProfileData({
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          email: loggedInUser.email,
          phone: "+49 123 456 789",
        });

        // Transfer guest bookings
        if (guestBookingCount > 0) {
          const mergedData =
            authStorage.mergeGuestBookingsWithUser(guestBookingCount);
          setUserData(mergedData);
          loyaltyStorage.clearGuestBookings();
        }
      }

      if (guestBookingCount > 0) {
        toast({
          title: "Anmeldung erfolgreich!",
          description: `Willkommen zurück! ${guestBookingCount} Gastbuchungen wurden übertragen.`,
        });
      } else {
        toast({
          title: "Anmeldung erfolgreich!",
          description: "Willkommen zurück!",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error?.message || "Bitte überprüfen Sie Ihre Eingaben.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async () => {
    // Check privacy checkbox
    const privacyCheckbox = document.getElementById(
      "registerPrivacy",
    ) as HTMLInputElement;
    if (!privacyCheckbox?.checked) {
      toast({
        title: "AGB und Datenschutzerklärung erforderlich",
        description: "Bitte akzeptieren Sie die AGB und Datenschutzerklärung.",
        variant: "destructive",
      });
      return;
    }

    // Validate password
    if (validatePassword) {
      const validation = validatePassword(
        registerData.password,
        registerData.email,
      );
      if (!validation.isValid) {
        toast({
          title: "Passwort ungültig",
          description: validation.errors.join(", "),
          variant: "destructive",
        });
        return;
      }
    }

    // Close modal immediately for instant UX
    setIsRegisterModalOpen(false);
    const registerDataCopy = { ...registerData };
    setRegisterData({ email: "", password: "", firstName: "", lastName: "" });

    try {
      if (register) {
        // Firebase registration - context will handle state updates
        await register(
          registerDataCopy.email,
          registerDataCopy.password,
          registerDataCopy.firstName,
          registerDataCopy.lastName,
        );
      } else {
        // Fallback to localStorage registration
        const newUser = authStorage.login(
          registerDataCopy.email,
          registerDataCopy.password,
        );
        setUser({
          ...newUser,
          firstName: registerDataCopy.firstName,
          lastName: registerDataCopy.lastName,
          displayName: `${registerDataCopy.firstName} ${registerDataCopy.lastName}`,
        });
        setProfileData({
          firstName: registerDataCopy.firstName,
          lastName: registerDataCopy.lastName,
          email: registerDataCopy.email,
          phone: "+49 123 456 789",
        });

        // Transfer guest bookings
        const guestBookingCount = loyaltyStorage.getGuestBookings();
        if (guestBookingCount > 0) {
          const mergedData =
            authStorage.mergeGuestBookingsWithUser(guestBookingCount);
          setUserData(mergedData);
          loyaltyStorage.clearGuestBookings();
        }
      }

      toast({
        title: "Registrierung erfolgreich!",
        description: `Willkommen bei WASHR, ${registerDataCopy.firstName}!`,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error?.message || "Bitte überprüfen Sie Ihre Eingaben.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (loginWithGoogle) {
        await loginWithGoogle();
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);

        const guestBookingCount = loyaltyStorage.getGuestBookings();
        if (guestBookingCount > 0) {
          toast({
            title: "Anmeldung erfolgreich!",
            description: `Willkommen zurück! ${guestBookingCount} Gastbuchungen wurden übertragen.`,
          });
        } else {
          toast({
            title: "Anmeldung erfolgreich!",
            description: "Willkommen zurück!",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Google-Anmeldung fehlgeschlagen",
        description: error?.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      if (loginWithFacebook) {
        await loginWithFacebook();
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);

        const guestBookingCount = loyaltyStorage.getGuestBookings();
        if (guestBookingCount > 0) {
          toast({
            title: "Anmeldung erfolgreich!",
            description: `Willkommen zurück! ${guestBookingCount} Gastbuchungen wurden übertragen.`,
          });
        } else {
          toast({
            title: "Anmeldung erfolgreich!",
            description: "Willkommen zurück!",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Facebook-Anmeldung fehlgeschlagen",
        description: error?.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    const currentUserName =
      firebaseUser?.displayName || user?.displayName || "User";

    try {
      if (logout) {
        // Firebase logout
        await logout();
      } else {
        // Fallback to localStorage logout
        authStorage.logout();
        setUser(null);
        setUserData(null);
        setProfileData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "+49 123 456 789",
        });

        // Reset to guest mode
        const guestBookingCount = loyaltyStorage.getGuestBookings();
        setGuestBookings(guestBookingCount);
      }

      toast({
        title: "Auf Wiedersehen!",
        description: `Bis bald, ${currentUserName}! Sie wurden erfolgreich abgemeldet.`,
      });
    } catch (error) {
      toast({
        title: "Fehler beim Abmelden",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = () => {
    if (user) {
      const updatedUser = authStorage.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      });
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
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

  const getProgressText = () => {
    if (!currentTier) return "Alle Belohnungen erreicht! 🎉";

    const remaining = currentTier.bookingsRequired - currentBookings;
    if (remaining <= 0) return `✅ ${currentTier.reward} verdient!`;

    if (currentBookings === 0) {
      return `Starte jetzt! Noch ${currentTier.bookingsRequired} Buchungen bis zu deinem kostenlosen Duftbaum!`;
    }

    return currentTier.description
      .replace("%d", remaining.toString())
      .replace("%d/%d", `${currentBookings}/${currentTier.bookingsRequired}`);
  };

  return (
    <div className="space-y-6 pb-20 bg-background text-foreground min-h-screen">
      {/* Profile Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user ? (
                  `${user.firstName[0]}${user.lastName[0]}`
                ) : (
                  <User className="h-8 w-8" />
                )}
              </div>
              <div>
                {user ? (
                  <>
                    <h2 className="text-xl font-bold text-card-foreground">
                      👋 Hallo {user.firstName}
                    </h2>
                    <p className="text-muted-foreground">
                      📬 {user.email}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-card-foreground">
                      👤 Gastnutzer
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      🔒 Du bist aktuell nicht eingeloggt.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingProfile(true)}
                    className="hover:bg-muted"
                  >
                    <Edit3 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="hover:bg-muted"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="hover:bg-muted"
                >
                  <LogIn className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Progress Card - Uber/Flink Style */}
      <Card className="bg-gradient-to-r from-card to-primary/10 border-border shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-card-foreground">
                {currentTier ? currentTier.icon : "🏆"} Bonus Progress
              </h3>
              {loyaltyProgress.availableRewards.length > 0 && (
                <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  Belohnung verfügbar!
                </div>
              )}
            </div>

            <p className="text-muted-foreground font-medium">
              {getProgressText()}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  📦 Buchungen: {currentBookings}/
                  {currentTier?.bookingsRequired || "∞"}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 shadow-inner">
                <motion.div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Motivational Text */}
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-foreground font-medium text-center">
                {currentBookings === 0 
                  ? "Starte jetzt deine erste Buchung und erlebe unseren Premium-Autoreinigungsservice!" 
                  : "Bereit für den nächsten Glanz? Buche jetzt deine Autoreinigung!"}
              </p>
            </div>

            {/* Demo Button for Testing */}
            <Button
              onClick={handleBookingComplete}
              variant="outline"
              size="sm"
              className="w-full mt-3"
            >
              ✨ Demo: Buchung hinzufügen
            </Button>

            {!user && (
              <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  💡 Melde dich an, um deine Buchungen & Belohnungen zu
                  speichern.
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  🔓 Profil erstellen & Bonus sichern
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg shadow-md flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Jetzt registrieren</span>
                  </Button>
                  <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    variant="outline"
                    className="w-full font-medium py-3 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Bereits registriert? Anmelden</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bonus Tier Preview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Gift className="h-5 w-5 text-emerald-500" />
            <span>Belohnungsstufen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loyaltyTiers.map((tier, index) => (
              <div
                key={tier.level}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  currentBookings >= tier.bookingsRequired
                    ? "bg-primary/10 border-primary/30"
                    : currentBookings >=
                        (loyaltyTiers[index - 1]?.bookingsRequired || 0)
                      ? "bg-accent border-accent"
                      : "bg-muted border-border"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{tier.icon}</div>
                  <div>
                    <div className="font-medium text-card-foreground">
                      {tier.reward}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tier.bookingsRequired} Buchungen
                    </div>
                  </div>
                </div>
                {currentBookings >= tier.bookingsRequired ? (
                  <div className="text-emerald-500 font-bold">✓</div>
                ) : (
                  <div className="text-muted-foreground">
                    {tier.bookingsRequired - currentBookings}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Anmelden</DialogTitle>
            <DialogDescription className="text-center">
              Erstellen Sie ein Profil, um Ihre Belohnungen zu sichern
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="ihre@email.com"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Passwort eingeben"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="h-12 text-base pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                id="privacy"
                className="rounded"
                required
              />
              <label htmlFor="privacy">
                ☑️ Ich akzeptiere die Datenschutzerklärung (Pflichtfeld)
              </label>
            </div>
            <Button
              onClick={handleLogin}
              disabled={
                !loginData.email ||
                !loginData.password ||
                !document.getElementById("privacy")?.checked
              }
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium"
            >
              Jetzt anmelden
            </Button>

            {/* Social Login Options */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">
                  oder anmelden mit
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-12"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleFacebookLogin}
                className="w-full h-12"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setIsRegisterModalOpen(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Noch kein Konto? Hier registrieren
              </Button>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Demo-Modus: Jede E-Mail/Passwort Kombination funktioniert
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Registrieren</DialogTitle>
            <DialogDescription className="text-center">
              Erstellen Sie ein neues Konto bei WASHR
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Max"
                  value={registerData.firstName}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Mustermann"
                  value={registerData.lastName}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="h-12 text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registerEmail">E-Mail</Label>
              <Input
                id="registerEmail"
                type="email"
                placeholder="max@example.com"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registerPassword">Passwort</Label>
              <div className="relative">
                <Input
                  id="registerPassword"
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="Passwort eingeben"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="h-12 text-base pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                >
                  {showRegisterPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>

              {/* Password validation indicators */}
              {registerData.password && (
                <div className="space-y-1">
                  {passwordValidation.errors.map((error, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-xs"
                    >
                      <X className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">{error}</span>
                    </div>
                  ))}
                  {passwordValidation.isValid && (
                    <div className="flex items-center space-x-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">
                        Passwort ist gültig
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                id="registerPrivacy"
                className="rounded"
                required
              />
              <label htmlFor="registerPrivacy">
                ☑️ Ich akzeptiere die AGB und Datenschutzerklärung (Pflichtfeld)
              </label>
            </div>
            <Button
              onClick={handleRegister}
              disabled={
                !registerData.email ||
                !registerData.password ||
                !registerData.firstName ||
                !registerData.lastName ||
                !document.getElementById("registerPrivacy")?.checked
              }
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium"
            >
              Jetzt registrieren
            </Button>

            {/* Social Login Options */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">
                  oder registrieren mit
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-12"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleFacebookLogin}
                className="w-full h-12"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsRegisterModalOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Bereits registriert? Hier anmelden
              </Button>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Demo-Modus: Jede Eingabe funktioniert
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Menu Items (Cleaner werden, Freund einladen, Support kontaktieren) */}
      <Card className="bg-card border-border">
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
      <Card className="bg-card border-border">
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
      <Card className="bg-card border-border">
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
        <DialogContent className="mobile-modal">
          <DialogHeader>
            <DialogTitle>Profil bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie Ihre persönlichen Informationen
            </DialogDescription>
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
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto mobile-modal">
          <DialogHeader>
            <DialogTitle>Cleaner werden</DialogTitle>
            <DialogDescription>
              Bewerben Sie sich als Reinigungsprofi
            </DialogDescription>
          </DialogHeader>
          <CleanerForm />
        </DialogContent>
      </Dialog>

      {/* Legal Modal */}
      <Dialog
        open={isLegalModalOpen}
        onOpenChange={(open) => {
          setIsLegalModalOpen(open);
          if (!open) {
            setSelectedLegalContent(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden mobile-modal">
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
              {selectedLegalContent
                ? legalTexts[selectedLegalContent as keyof typeof legalTexts]
                    ?.title
                : "Rechtliche Informationen"}
            </DialogTitle>
            <DialogDescription>
              {selectedLegalContent
                ? "Lesen Sie die vollständigen rechtlichen Bestimmungen."
                : "Wählen Sie einen Bereich aus, um die entsprechenden rechtlichen Informationen anzuzeigen."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[70vh] pr-4">
            {!selectedLegalContent ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Wählen Sie einen Bereich aus, um die entsprechenden
                  rechtlichen Informationen anzuzeigen:
                </p>
                {Object.entries(legalTexts).map(([key, content]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className="w-full justify-start h-auto p-4 text-left touch-target mobile-optimized"
                    onClick={() => setSelectedLegalContent(key)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{content.icon}</span>
                      <div>
                        <div className="font-medium">{content.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {key === "impressum" && "Angaben gemäß § 5 TMG"}
                          {key === "datenschutz" &&
                            "Informationen zur Datenverarbeitung"}
                          {key === "agb" &&
                            "Vertragsbedingungen für unsere Services"}
                          {key === "widerrufsrecht" &&
                            "Ihre Rechte als Verbraucher"}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {
                    legalTexts[selectedLegalContent as keyof typeof legalTexts]
                      ?.content
                  }
                </div>
                {selectedLegalContent === "datenschutz" && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Für weitere Fragen zum Datenschutz kontaktieren Sie uns
                      unter: washr.mainz@gmail.com
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
