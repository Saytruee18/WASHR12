import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Receipt, Brush, MessageSquare, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

export function SideDrawer({ isOpen, onClose, onNavigate }: SideDrawerProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: FileText,
      label: "My Bookings",
      action: () => onNavigate("booking")
    },
    {
      icon: Receipt,
      label: "Invoices",
      action: () => onNavigate("wallet")
    },
    {
      icon: Brush,
      label: "Become a Cleaner",
      action: () => onNavigate("cleaner")
    },
    {
      icon: MessageSquare,
      label: "Give Feedback",
      action: () => window.open("mailto:washr.mainz@gmail.com?subject=Feedback", "_blank")
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      action: () => window.open("mailto:washr.mainz@gmail.com?subject=Support", "_blank")
    }
  ];

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 shadow-2xl z-50 flex flex-col"
            style={{ backgroundColor: '#100c0c' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3cbf5c] to-[#2fa04d] rounded-xl flex items-center justify-center">
                    <span className="text-black font-bold text-lg">W</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">WASHK</h2>
                    <p className="text-sm text-gray-400">Car Cleaning Service</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full w-8 h-8 p-0 hover:bg-gray-800 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              {user ? (
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="font-medium text-white">{user.email}</p>
                  <p className="text-sm text-gray-400">Verified Customer</p>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="font-medium text-white">Guest User</p>
                  <p className="text-sm text-gray-400">Sign in to access all features</p>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 py-4">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="w-full flex items-center space-x-4 px-6 py-4 text-left hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-white">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              {user && (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start text-red-400 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}