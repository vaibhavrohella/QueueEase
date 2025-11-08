import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Scissors, Clock, MapPin, BarChart3 } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SaloonQueue
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth?mode=signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
            <Clock className="h-4 w-4" />
            <span>Save time, skip the wait</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Find Saloons,
            <br />
            <span className="bg-gradient-to-r from-accent via-warning to-accent bg-clip-text text-transparent">
              Track Queues
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover nearby saloon shops, check real-time queue status, and plan your visit perfectly. 
            No more waiting in uncertainty.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate("/auth?mode=signup&role=customer")}
            >
              Find a Saloon
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
              onClick={() => navigate("/auth?mode=signup&role=barber")}
            >
              I'm a Saloon Owner
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<MapPin className="h-8 w-8 text-accent" />}
            title="Find Nearby"
            description="Discover saloon shops in your area with real-time availability"
          />
          <FeatureCard
            icon={<Clock className="h-8 w-8 text-accent" />}
            title="Real-time Queue"
            description="See exact wait times and queue positions instantly"
          />
          <FeatureCard
            icon={<Scissors className="h-8 w-8 text-accent" />}
            title="Join Remotely"
            description="Reserve your spot from anywhere and arrive on time"
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8 text-accent" />}
            title="Analytics"
            description="Saloon owners track performance and optimize their business"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-12 text-center text-primary-foreground shadow-lg">
          <h2 className="text-4xl font-bold mb-4">Ready to skip the wait?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of happy customers and saloon owners
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 SaloonQueue. Making saloon visits better.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Landing;