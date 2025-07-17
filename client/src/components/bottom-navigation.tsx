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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-200/50 max-w-md mx-auto backdrop-blur-xl safe-area-bottom z-50 shadow-lg">
      <div className="flex px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 py-3 px-3 text-center transition-all duration-300 rounded-2xl mx-1 touch-target mobile-optimized ${
                isActive 
                  ? "text-[#2dd36f] bg-[#2dd36f]/10" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
              }`}
            >
              <Icon className={`mb-1 block mx-auto h-5 w-5 md:h-6 md:w-6 transition-colors duration-300 ${
                isActive ? "text-[#2dd36f]" : "text-gray-500"
              }`} strokeWidth={1.5} />
              <span className={`text-xs font-medium block transition-colors duration-300 ${
                isActive ? "text-[#2dd36f]" : "text-gray-500"
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
