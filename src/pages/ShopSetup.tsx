import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ShopSetup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("Not logged in");

      const { error } = await supabase.from("barber_shops").insert({
        name: shopName,
        address,
        owner_id: user.id,
        is_open: true,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Shop created successfully!",
        description: "Redirecting to your dashboard...",
      });

      navigate("/barber/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Set Up Your Barber Shop</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateShop} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                type="text"
                placeholder="Classic Cuts"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Shop"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopSetup;
