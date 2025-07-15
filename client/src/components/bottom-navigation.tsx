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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border max-w-md mx-auto backdrop-blur-xl">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 py-4 px-4 text-center transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`text-xl mb-1 block mx-auto h-6 w-6 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`} />
              <span className={`text-xs font-medium ${
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
