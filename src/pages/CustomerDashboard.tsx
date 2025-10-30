import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Users, Scissors, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type BarberShop = {
  id: string;
  name: string;
  address: string;
  rating: number;
  average_service_time: number;
  price_range: string;
  is_open: boolean;
  queue_count: number;
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shops, setShops] = useState<BarberShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [myQueue, setMyQueue] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchShops();
    fetchMyQueue();
    subscribeToQueueChanges();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from("barber_shops")
        .select(`
          *,
          queue_entries!queue_entries_shop_id_fkey(count)
        `)
        .eq("is_open", true);

      if (error) throw error;

      const shopsWithCount = data?.map((shop: any) => ({
        ...shop,
        queue_count: shop.queue_entries?.[0]?.count || 0,
      }));

      setShops(shopsWithCount || []);
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

  const fetchMyQueue = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("queue_entries")
        .select(`
          *,
          barber_shops(name)
        `)
        .eq("customer_id", user.id)
        .in("status", ["waiting", "in_service"])
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setMyQueue(data);
    } catch (error: any) {
      console.error("Error fetching queue:", error);
    }
  };

  const subscribeToQueueChanges = () => {
    const channel = supabase
      .channel("queue-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_entries",
        },
        () => {
          fetchShops();
          fetchMyQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const joinQueue = async (shopId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("queue_entries")
        .insert({
          shop_id: shopId,
          customer_id: user.id,
          status: "waiting",
        });

      if (error) throw error;

      toast({
        title: "Joined queue!",
        description: "You'll be notified when it's your turn",
      });

      fetchMyQueue();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const leaveQueue = async () => {
    try {
      const { error } = await supabase
        .from("queue_entries")
        .update({ status: "cancelled" })
        .eq("id", myQueue.id);

      if (error) throw error;

      toast({
        title: "Left queue",
        description: "You've been removed from the queue",
      });

      setMyQueue(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold">BarberQueue</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* My Queue Status */}
        {myQueue && (
          <Card className="p-6 bg-accent/10 border-accent">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">You're in queue!</h3>
                <p className="text-muted-foreground mb-1">
                  {myQueue.barber_shops?.name}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Position: {myQueue.position || "Calculating..."}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    ~{myQueue.estimated_wait_time || 0} min
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={leaveQueue}>
                Leave Queue
              </Button>
            </div>
          </Card>
        )}

        {/* Shops List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Nearby Barber Shops</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading shops...</p>
          ) : shops.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No barber shops available yet. Check back soon!
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map((shop) => (
                <Card key={shop.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold">{shop.name}</h3>
                      <Badge variant={shop.queue_count < 3 ? "default" : shop.queue_count < 6 ? "secondary" : "destructive"}>
                        {shop.is_open ? "Open" : "Closed"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {shop.address}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-accent" />
                        {shop.queue_count} waiting
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-accent" />
                        ~{shop.queue_count * shop.average_service_time} min
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {shop.price_range}
                    </p>

                    <Button
                      className="w-full"
                      onClick={() => joinQueue(shop.id)}
                      disabled={!!myQueue || !shop.is_open}
                    >
                      {myQueue ? "Already in Queue" : "Join Queue"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;