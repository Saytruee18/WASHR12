import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, Edit3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddressConfirmationModalProps {
  isOpen: boolean;
  initialAddress: string;
  onConfirm: (finalAddress: string) => void;
  onCancel: () => void;
}

export function AddressConfirmationModal({ 
  isOpen, 
  initialAddress, 
  onConfirm, 
  onCancel 
}: AddressConfirmationModalProps) {
  const [address, setAddress] = useState(initialAddress);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAddress(initialAddress);
  }, [initialAddress]);

  useEffect(() => {
    if (isOpen && isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen, isEditing]);

  const handleConfirm = () => {
    onConfirm(address);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setAddress(initialAddress);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              duration: 0.5, 
              bounce: 0.3 
            }}
            className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)'
            }}
          >
            {/* Header with Icon */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
                className="w-20 h-20 bg-gradient-to-br from-[#3cbf5c]/20 to-[#3cbf5c]/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <MapPin className="w-10 h-10 text-[#3cbf5c]" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Adresse bestätigen
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-sm"
              >
                Überprüfen Sie die Adresse und bestätigen Sie diese
              </motion.p>
            </div>

            {/* Address Input/Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              {isEditing ? (
                <div className="relative">
                  <Input
                    ref={inputRef}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="text-lg p-4 pr-12 rounded-2xl border-2 border-[#3cbf5c]/20 focus:border-[#3cbf5c] transition-all"
                    placeholder="Straße eingeben..."
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Edit3 className="w-5 h-5 text-[#3cbf5c]" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleEdit}
                  className="relative bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition-all border-2 border-transparent hover:border-[#3cbf5c]/20"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-gray-900 flex-1">
                      {address}
                    </p>
                    <Edit3 className="w-5 h-5 text-gray-400 ml-2" />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1 py-3 rounded-2xl text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Abbrechen
              </Button>
              
              <Button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-2xl bg-[#3cbf5c] hover:bg-[#3cbf5c]/90 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Bestätigen
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>

            {/* Subtle hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-4"
            >
              <p className="text-xs text-gray-500">
                Enter zum Bestätigen • Escape zum Abbrechen
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}