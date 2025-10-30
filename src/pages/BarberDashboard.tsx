import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, LogOut, Users, Clock, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type QueueEntry = {
  id: string;
  position: number;
  estimated_wait_time: number;
  status: string;
  profiles: {
    full_name: string;
  };
};

const BarberDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shop, setShop] = useState<any>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchShopData();
    subscribeToQueueChanges();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchShopData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get shop
      const { data: shopData, error: shopError } = await supabase
        .from("barber_shops")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (shopError && shopError.code !== "PGRST116") throw shopError;

      if (!shopData) {
        // No shop yet, could redirect to setup
        setLoading(false);
        return;
      }

      setShop(shopData);

      // Get queue
      const { data: queueData, error: queueError } = await supabase
        .from("queue_entries")
        .select(`
          *,
          profiles(full_name)
        `)
        .eq("shop_id", shopData.id)
        .eq("status", "waiting")
        .order("position");

      if (queueError) throw queueError;
      setQueue(queueData || []);

      // Get today's analytics
      const today = new Date().toISOString().split("T")[0];
      const { data: analyticsData } = await supabase
        .from("shop_analytics")
        .select("*")
        .eq("shop_id", shopData.id)
        .eq("date", today)
        .single();

      setAnalytics(analyticsData);
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

  const subscribeToQueueChanges = () => {
    const channel = supabase
      .channel("barber-queue-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_entries",
        },
        () => {
          fetchShopData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const callNextCustomer = async () => {
    if (queue.length === 0) return;

    const nextCustomer = queue[0];

    try {
      const { error } = await supabase
        .from("queue_entries")
        .update({
          status: "in_service",
          called_at: new Date().toISOString(),
        })
        .eq("id", nextCustomer.id);

      if (error) throw error;

      toast({
        title: "Customer called",
        description: `${nextCustomer.profiles.full_name} is now being served`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completeService = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from("queue_entries")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", entryId);

      if (error) throw error;

      toast({
        title: "Service completed",
        description: "Customer marked as done",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleShopStatus = async () => {
    if (!shop) return;

    try {
      const { error } = await supabase
        .from("barber_shops")
        .update({ is_open: !shop.is_open })
        .eq("id", shop.id);

      if (error) throw error;

      setShop({ ...shop, is_open: !shop.is_open });
      
      toast({
        title: shop.is_open ? "Shop closed" : "Shop opened",
        description: shop.is_open ? "New customers cannot join" : "Accepting new customers",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <Card className="w-full max-w-md p-8 text-center">
          <Scissors className="h-16 w-16 mx-auto mb-4 text-accent" />
          <h2 className="text-2xl font-bold mb-2">Welcome to BarberQueue!</h2>
          <p className="text-muted-foreground mb-6">
            You need to set up your barber shop first. Please contact support to create your shop profile.
          </p>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6 text-accent" />
            <div>
              <span className="text-xl font-bold block">{shop.name}</span>
              <span className="text-xs text-muted-foreground">Barber Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={shop.is_open ? "default" : "secondary"}
              size="sm"
              onClick={toggleShopStatus}
            >
              {shop.is_open ? "Open" : "Closed"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Analytics Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Today's Customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-3xl font-bold">
                  {analytics?.total_customers || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Queue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                <span className="text-3xl font-bold">{queue.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg. Wait Time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <span className="text-3xl font-bold">
                  {analytics?.average_wait_time || 0}m
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Today's Earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                <span className="text-3xl font-bold">
                  ${analytics?.total_earnings || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Queue</CardTitle>
                <CardDescription>
                  Manage your queue and call next customer
                </CardDescription>
              </div>
              <Button
                onClick={callNextCustomer}
                disabled={queue.length === 0}
                size="lg"
              >
                Call Next Customer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No customers in queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        #{entry.position}
                      </Badge>
                      <div>
                        <p className="font-semibold">{entry.profiles.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Wait: ~{entry.estimated_wait_time} min
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeService(entry.id)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarberDashboard;