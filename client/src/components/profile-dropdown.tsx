import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  UserPlus,
  ChevronDown,
  LogIn,
  LogOut,
  Mail,
  MoreVertical,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfilePage } from "@/components/profile-page";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileMode, setProfileMode] = useState<'profile' | 'login' | 'register'>('profile');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Firebase integration with fallback
  let firebaseUser = null;
  let firebaseUserData = null;
  let logout = null;
  
  try {
    const auth = useAuth();
    firebaseUser = auth.user;
    firebaseUserData = auth.userData;
    logout = auth.logout;
  } catch (error) {
    // Firebase not configured, will use localStorage fallback
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    // Close dropdown immediately
    setIsOpen(false);
    
    try {
      if (logout) {
        await logout(); // This will immediately update the AuthContext state
      } else {
        // Fallback localStorage logout (shouldn't be needed with new context)
        localStorage.removeItem('washr_logged_in');
        localStorage.removeItem('washr_user_email');
      }
      
      toast({
        title: "Erfolgreich ausgeloggt",
        description: "Auf Wiedersehen!",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Abmelden",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  };

  const getUserData = () => {
    if (firebaseUser && firebaseUserData) {
      // Firebase user data
      return {
        name: firebaseUserData.displayName || `${firebaseUserData.firstName} ${firebaseUserData.lastName}`,
        email: firebaseUser.email || '',
        initials: (firebaseUserData.firstName?.[0] || '') + (firebaseUserData.lastName?.[0] || '')
      };
    }
    
    return {
      name: "Gastnutzer",
      email: "",
      initials: "G"
    };
  };

  const profileData = getUserData();
  const isLoggedIn = !!firebaseUser;

  const getMenuItems = () => {
    if (!isLoggedIn) {
      return [
        { 
          icon: UserPlus, 
          label: "Registrieren", 
          action: () => { 
            setProfileMode('register'); 
            setIsProfileOpen(true); 
            setIsOpen(false); 
          } 
        },
        { 
          icon: LogIn, 
          label: "Anmelden", 
          action: () => { 
            setProfileMode('login'); 
            setIsProfileOpen(true); 
            setIsOpen(false); 
          } 
        },
        {
          icon: Mail,
          label: "Support kontaktieren",
          action: () => { window.open("mailto:washr.mainz@gmail.com"); setIsOpen(false); },
        },
      ];
    }

    return [
      { 
        icon: User, 
        label: "Mein Profil", 
        action: () => { 
          setProfileMode('profile'); 
          setIsProfileOpen(true); 
          setIsOpen(false); 
        } 
      },
      {
        icon: Mail,
        label: "Support kontaktieren",
        action: () => { window.open("mailto:washr.mainz@gmail.com"); setIsOpen(false); },
      },
      { icon: LogOut, label: "Abmelden", action: handleLogout }
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 hover:bg-transparent transition-colors bg-transparent"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {profileData.initials}
            </AvatarFallback>
          </Avatar>
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="bg-transparent"
          >
            <MoreVertical className="h-4 w-4" />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 border border-border rounded-2xl shadow-xl z-50"
              style={{ backgroundColor: '#100c0c' }}
            >
              {/* Profile Header */}
              <div className="p-4 border-b border-border">
                {!isLoggedIn ? (
                  <div className="text-center">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Nicht angemeldet
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Melden Sie sich an für vollständigen Zugriff
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {profileData.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{profileData.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {profileData.email}
                      </div>
                    </div>
                  </div>
                )}
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
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left hover:bg-muted/50 transition-colors touch-target mobile-optimized ${
                      item.label === "Abmelden" ? "text-destructive hover:bg-destructive/10" : ""
                    }`}
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Page Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-auto rounded-lg shadow-xl" style={{ backgroundColor: '#100c0c' }}>
            <ProfilePage initialMode={profileMode} />
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}