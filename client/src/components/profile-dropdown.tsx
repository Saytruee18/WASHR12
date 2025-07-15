import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, CreditCard, History, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfilePage } from "@/components/profile-page";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const profileData = {
    name: "Max Mustermann",
    email: "max@example.com",
    initials: "MM"
  };

  const menuItems = [
    { icon: User, label: "Profil bearbeiten", action: () => setIsProfileOpen(true) },
    { icon: History, label: "Meine Buchungen", action: () => {} },
    { icon: CreditCard, label: "Zahlungsmethoden", action: () => {} },
    { icon: Settings, label: "Einstellungen", action: () => {} },
    { icon: LogOut, label: "Abmelden", action: () => {} },
  ];

  return (
    <>
      <div className="relative">
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
    </>
  );
}