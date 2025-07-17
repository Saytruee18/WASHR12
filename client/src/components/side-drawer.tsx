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
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2dd36f] to-[#26b865] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">WASHR</h2>
                    <p className="text-sm text-gray-500">Car Cleaning Service</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full w-8 h-8 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              {user ? (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="font-medium text-gray-800">{user.email}</p>
                  <p className="text-sm text-gray-500">Verified Customer</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="font-medium text-gray-800">Guest User</p>
                  <p className="text-sm text-gray-500">Sign in to access all features</p>
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
                  className="w-full flex items-center space-x-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-800">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
              {user && (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
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