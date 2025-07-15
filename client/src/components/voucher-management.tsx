import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Plus, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const voucherAmounts = [
  { amount: 25, popular: false },
  { amount: 50, popular: true },
  { amount: 100, popular: false },
];

export function VoucherManagement() {
  const [redeemCode, setRedeemCode] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(50);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const redeemVoucherMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/discount-codes/validate", { code });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Gutschein eingelöst",
        description: `Gutschein erfolgreich eingelöst! ${data.discountAmount ? `${data.discountAmount/100}€` : `${data.discountPercent}%`} Rabatt erhalten.`,
      });
      setRedeemCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Gutschein konnte nicht eingelöst werden.",
        variant: "destructive",
      });
    },
  });

  const createVoucherMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", { amount });
      return response.json();
    },
    onSuccess: (data) => {
      // Here you would typically redirect to Stripe checkout or handle payment
      const voucherCode = `WASHR${Date.now().toString(36).toUpperCase()}`;
      toast({
        title: "Gutschein erstellt",
        description: `Gutschein-Code: ${voucherCode}`,
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Gutschein konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const handleRedeemVoucher = () => {
    if (redeemCode.trim()) {
      redeemVoucherMutation.mutate(redeemCode.trim());
    }
  };

  const handleCreateVoucher = () => {
    createVoucherMutation.mutate(selectedAmount);
  };

  const handleShareVoucher = (code: string) => {
    const shareText = `Ich schenke dir einen ${selectedAmount}€ WASHR Gutschein! Code: ${code}`;
    if (navigator.share) {
      navigator.share({
        title: "WASHR Gutschein",
        text: shareText,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Kopiert",
        description: "Gutschein-Text wurde in die Zwischenablage kopiert.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Redeem Voucher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-primary" />
            <span>Gutschein einlösen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="redeemCode">Gutschein-Code</Label>
              <Input
                id="redeemCode"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="WASHR123..."
                className="font-mono"
              />
            </div>
            <Button 
              onClick={handleRedeemVoucher}
              disabled={!redeemCode.trim() || redeemVoucherMutation.isPending}
              className="w-full"
            >
              {redeemVoucherMutation.isPending ? "Wird eingelöst..." : "Gutschein einlösen"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Voucher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Gutschein kaufen</span>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Erstellen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gutschein erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label>Gutscheinwert wählen</Label>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {voucherAmounts.map((voucher) => (
                        <motion.button
                          key={voucher.amount}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedAmount(voucher.amount)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedAmount === voucher.amount
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          } ${voucher.popular ? "ring-2 ring-primary/20" : ""}`}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold">{voucher.amount}€</div>
                            {voucher.popular && (
                              <div className="text-xs text-primary font-medium mt-1">Beliebt</div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Gutschein-Vorschau:</div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">WASHR Gutschein</span>
                      <span className="text-lg font-bold text-primary">{selectedAmount}€</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateVoucher}
                    disabled={createVoucherMutation.isPending}
                    className="w-full"
                  >
                    {createVoucherMutation.isPending ? "Wird erstellt..." : `${selectedAmount}€ Gutschein kaufen`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Verschenken Sie WASHR Gutscheine an Freunde und Familie. 
            Gutscheine werden digital erstellt und können per E-Mail oder Link geteilt werden.
          </p>
        </CardContent>
      </Card>

      {/* Sample Vouchers (for demonstration) */}
      <Card>
        <CardHeader>
          <CardTitle>Meine Gutscheine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">WASHR25WELCOME</div>
                <div className="text-sm text-muted-foreground">Gültig bis 31.12.2024</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-primary">25€</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShareVoucher("WASHR25WELCOME")}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-center py-4 text-muted-foreground">
              Keine weiteren Gutscheine vorhanden
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}