import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import BottomNav from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Wallet, 
  ArrowLeft,
  Plus,
  DollarSign
} from "lucide-react";

export default function AddMoney() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");

  const addMoneyMutation = useMutation({
    mutationFn: async (data: { amount: number }) => {
      return await apiRequest("POST", "/api/wallet/add-money", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Money added to wallet successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add money",
        variant: "destructive",
      });
    },
  });

  const handleAddMoney = () => {
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    addMoneyMutation.mutate({ amount: amountValue });
  };

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Add Money</h1>
        </div>

        {/* Add Money Form */}
        <Card className="bg-card-bg border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-neon-orange" />
              Top up your wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300">
                Enter Amount (₦)
              </Label>
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-900 border-gray-700 pl-10 text-lg font-semibold focus:border-neon-blue focus:shadow-neon-blue"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label className="text-gray-300">Quick amounts</Label>
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="bg-gray-900 border-gray-700 hover:border-neon-orange hover:bg-gray-800"
                  >
                    ₦{quickAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <Label className="text-gray-300">Payment Method</Label>
              <div className="space-y-3">
                <div className="p-4 bg-gray-900 rounded-lg border border-neon-blue">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-neon-blue" />
                    <div>
                      <p className="text-white font-medium">Bank Transfer</p>
                      <p className="text-gray-400 text-sm">
                        Transfer to your virtual account: 2039482819
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 opacity-50">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-gray-500 font-medium">Card Payment</p>
                      <p className="text-gray-500 text-sm">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Money Button */}
            <Button
              onClick={handleAddMoney}
              disabled={addMoneyMutation.isPending || !amount}
              className="w-full neon-gradient hover:shadow-neon-orange transition-all text-lg py-6"
            >
              {addMoneyMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              {addMoneyMutation.isPending ? "Adding..." : `Add ₦${amount || "0"}`}
            </Button>

            {/* Note */}
            <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                <strong>Note:</strong> For this demo, money will be added instantly. In production, 
                bank transfers may take a few minutes to reflect.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}