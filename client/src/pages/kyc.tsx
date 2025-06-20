import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import BottomNav from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Upload, 
  Camera, 
  CheckCircle, 
  Clock,
  XCircle,
  CreditCard,
  User,
  FileText,
  AlertCircle
} from "lucide-react";

export default function KYC() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [ninImage, setNinImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [ninImagePreview, setNinImagePreview] = useState<string | null>(null);
  const [selfieImagePreview, setSelfieImagePreview] = useState<string | null>(null);

  const { data: kycData } = useQuery({
    queryKey: ["/api/kyc"],
    enabled: !!user,
  });

  const { data: virtualAccount } = useQuery({
    queryKey: ["/api/virtual-account"],
    enabled: !!user,
  });

  const submitKycMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit KYC");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "KYC documents submitted successfully! We'll review them within 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/kyc"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit KYC",
        variant: "destructive",
      });
    },
  });

  const generateVirtualAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/virtual-account/generate", {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Virtual account generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/virtual-account"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate virtual account",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (file: File, type: 'nin' | 'selfie') => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'nin') {
        setNinImage(file);
        setNinImagePreview(e.target?.result as string);
      } else {
        setSelfieImage(file);
        setSelfieImagePreview(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitKyc = () => {
    if (!bvn.trim() || !nin.trim() || !ninImage || !selfieImage) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields and upload required documents",
        variant: "destructive",
      });
      return;
    }

    if (bvn.length !== 11) {
      toast({
        title: "Invalid BVN",
        description: "BVN must be 11 digits",
        variant: "destructive",
      });
      return;
    }

    if (nin.length !== 11) {
      toast({
        title: "Invalid NIN",
        description: "NIN must be 11 digits",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('bvn', bvn.trim());
    formData.append('nin', nin.trim());
    formData.append('ninImage', ninImage);
    formData.append('selfieImage', selfieImage);
    
    submitKycMutation.mutate(formData);
  };

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 bg-opacity-20 text-green-400 border-green-500"><CheckCircle className="w-4 h-4 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 bg-opacity-20 text-red-400 border-red-500"><XCircle className="w-4 h-4 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500"><Clock className="w-4 h-4 mr-1" />Pending Review</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-400"><AlertCircle className="w-4 h-4 mr-1" />Not Submitted</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Shield className="w-8 h-8 text-neon-blue" />
          <div>
            <h1 className="text-3xl font-bold text-white">Identity Verification</h1>
            <p className="text-gray-400">Complete your KYC to unlock all features</p>
          </div>
        </div>

        {/* KYC Status */}
        <Card className="bg-card-bg border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Verification Status</span>
              {getKycStatusBadge(user?.kycStatus || 'pending')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-gray-700 rounded-lg">
                <User className="w-8 h-8 text-neon-blue mx-auto mb-2" />
                <h4 className="font-semibold text-white">Identity</h4>
                <p className="text-sm text-gray-400">BVN & NIN Verification</p>
              </div>
              <div className="text-center p-4 border border-gray-700 rounded-lg">
                <FileText className="w-8 h-8 text-neon-orange mx-auto mb-2" />
                <h4 className="font-semibold text-white">Documents</h4>
                <p className="text-sm text-gray-400">NIN Card & Selfie</p>
              </div>
              <div className="text-center p-4 border border-gray-700 rounded-lg">
                <CreditCard className="w-8 h-8 text-neon-yellow mx-auto mb-2" />
                <h4 className="font-semibold text-white">Account</h4>
                <p className="text-sm text-gray-400">Virtual Account Setup</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Virtual Account Section */}
        <Card className="bg-card-bg border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-neon-yellow" />
              Virtual Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {virtualAccount ? (
              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Account Number</Label>
                      <p className="text-white font-mono text-lg">{virtualAccount.accountNumber}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Bank</Label>
                      <p className="text-white">{virtualAccount.bankName}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-blue-400 font-semibold">How to fund your wallet</h4>
                      <p className="text-blue-300 text-sm mt-1">
                        Transfer money to the account number above and it will automatically reflect in your Si-link wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No Virtual Account</h3>
                <p className="text-gray-400 mb-4">Generate a virtual account to receive payments</p>
                <Button 
                  onClick={() => generateVirtualAccountMutation.mutate()}
                  disabled={generateVirtualAccountMutation.isPending || user?.kycStatus !== 'approved'}
                  className="neon-gradient"
                >
                  {generateVirtualAccountMutation.isPending ? "Generating..." : "Generate Virtual Account"}
                </Button>
                {user?.kycStatus !== 'approved' && (
                  <p className="text-sm text-gray-500 mt-2">Complete KYC verification first</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* KYC Form */}
        {user?.kycStatus !== 'approved' && (
          <Card className="bg-card-bg border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Submit KYC Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* BVN */}
              <div className="space-y-2">
                <Label htmlFor="bvn" className="text-gray-300">
                  Bank Verification Number (BVN) *
                </Label>
                <Input
                  id="bvn"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="Enter your 11-digit BVN"
                  className="bg-gray-900 border-gray-700 focus:border-neon-blue"
                  maxLength={11}
                />
              </div>

              {/* NIN */}
              <div className="space-y-2">
                <Label htmlFor="nin" className="text-gray-300">
                  National Identification Number (NIN) *
                </Label>
                <Input
                  id="nin"
                  value={nin}
                  onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="Enter your 11-digit NIN"
                  className="bg-gray-900 border-gray-700 focus:border-neon-blue"
                  maxLength={11}
                />
              </div>

              <Separator className="bg-gray-700" />

              {/* NIN Image Upload */}
              <div className="space-y-2">
                <Label className="text-gray-300">
                  NIN Card Image *
                </Label>
                {ninImagePreview ? (
                  <div className="relative">
                    <img
                      src={ninImagePreview}
                      alt="NIN Card"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-700"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setNinImage(null);
                        setNinImagePreview(null);
                      }}
                      className="absolute top-2 right-2"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-neon-blue transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Upload a clear photo of your NIN card</p>
                    <p className="text-gray-500 text-sm mb-4">PNG, JPG up to 5MB</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('nin-upload')?.click()}
                      className="border-gray-700 hover:border-neon-blue"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    <input
                      id="nin-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'nin');
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Selfie Upload */}
              <div className="space-y-2">
                <Label className="text-gray-300">
                  Authentication Selfie *
                </Label>
                {selfieImagePreview ? (
                  <div className="relative">
                    <img
                      src={selfieImagePreview}
                      alt="Selfie"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-700"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelfieImage(null);
                        setSelfieImagePreview(null);
                      }}
                      className="absolute top-2 right-2"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-neon-orange transition-colors">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Take a clear selfie for verification</p>
                    <p className="text-gray-500 text-sm mb-4">Make sure your face is clearly visible</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('selfie-upload')?.click()}
                      className="border-gray-700 hover:border-neon-orange"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <input
                      id="selfie-upload"
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'selfie');
                      }}
                    />
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSubmitKyc}
                disabled={submitKycMutation.isPending}
                className="w-full neon-gradient hover:shadow-neon-blue"
              >
                {submitKycMutation.isPending ? "Submitting..." : "Submit KYC Documents"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}