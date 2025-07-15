import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface WalletTopupProps {
  balance: number;
  transactions: any[];
}

const topupOptions = [
  { amount: 25, bonus: 1.5 },
  { amount: 50, bonus: 5 },
  { amount: 100, bonus: 15 },
];

function TopupForm({ amount, bonus, onSuccess }: { amount: number; bonus: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        toast({
          title: "Zahlung fehlgeschlagen",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Zahlung erfolgreich",
          description: `${amount}€ + ${bonus}€ Bonus wurden Ihrem Wallet hinzugefügt!`,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? "Wird verarbeitet..." : `${amount}€ + ${bonus}€ Bonus aufladen`}
      </Button>
    </form>
  );
}

export function WalletTopup({ balance, transactions }: WalletTopupProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTopupMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/wallet/topup", { amount });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Zahlung konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const handleTopupSelect = (amount: number) => {
    setSelectedAmount(amount);
    createTopupMutation.mutate(amount);
  };

  const handleTopupSuccess = () => {
    setSelectedAmount(null);
    setClientSecret(null);
    queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
    queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
  };

  if (clientSecret && selectedAmount) {
    const selectedOption = topupOptions.find(opt => opt.amount === selectedAmount)!;
    
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Guthaben aufladen</h3>
            <p className="text-slate-600">
              {selectedAmount}€ + {selectedOption.bonus}€ Bonus = {selectedAmount + selectedOption.bonus}€
            </p>
          </div>
          <TopupForm 
            amount={selectedAmount} 
            bonus={selectedOption.bonus}
            onSuccess={handleTopupSuccess}
          />
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedAmount(null);
              setClientSecret(null);
            }}
            className="w-full"
          >
            Abbrechen
          </Button>
        </div>
      </Elements>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 mb-2">Aktuelles Guthaben</p>
            <p className="text-3xl font-bold">{(balance / 100).toFixed(2)}€</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="text-primary-foreground h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Top-up Options */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Guthaben aufladen</h3>
        <div className="grid grid-cols-3 gap-4">
          {topupOptions.map((option, index) => (
            <motion.button
              key={option.amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTopupSelect(option.amount)}
              disabled={createTopupMutation.isPending}
              className={`bg-card rounded-2xl p-4 border transition-all hover:shadow-xl ${
                index === 1 ? "border-2 border-primary" : "border-border"
              }`}
            >
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  index === 1 ? "text-primary" : "text-foreground"
                }`}>
                  {option.amount}€
                </div>
                <div className="text-sm text-primary font-medium">
                  +{option.bonus}€ Bonus
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Transaktionen</h3>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Noch keine Transaktionen vorhanden
            </p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      transaction.amount > 0 ? "bg-primary/10" : "bg-destructive/10"
                    }`}>
                      {transaction.amount > 0 ? (
                        <Plus className="text-primary h-5 w-5" />
                      ) : (
                        <Minus className="text-destructive h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{transaction.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    transaction.amount > 0 ? "text-primary" : "text-destructive"
                  }`}>
                    {transaction.amount > 0 ? "+" : ""}{(transaction.amount / 100).toFixed(2)}€
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
