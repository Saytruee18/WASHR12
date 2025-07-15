import { Home, Calendar, Wallet, Car, Wrench } from "lucide-react";
import { motion } from "framer-motion";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", label: "Startseite", icon: Home },
  { id: "booking", label: "Buchen", icon: Calendar },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "cars", label: "Mein Auto", icon: Car },
  { id: "cleaner", label: "Cleaner", icon: Wrench },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 max-w-md mx-auto">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className={`text-xl mb-1 block mx-auto h-5 w-5 ${
                isActive ? "text-primary" : "text-slate-400"
              }`} />
              <span className={`text-xs font-medium ${
                isActive ? "text-primary" : "text-slate-400"
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
