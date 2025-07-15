import { Home, Calendar, Wallet, User } from "lucide-react";
import { motion } from "framer-motion";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "Startseite", icon: Home },
  { id: "booking", label: "Buchen", icon: Calendar },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "profile", label: "Profil", icon: User },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 border-t border-border max-w-md mx-auto backdrop-blur-xl safe-area-bottom z-50">
      <div className="flex px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 py-3 px-2 text-center transition-all duration-200 rounded-xl mx-1 my-2 touch-target mobile-optimized ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon className={`mb-1 block mx-auto h-5 w-5 md:h-6 md:w-6 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`} />
              <span className={`text-xs font-medium block ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
