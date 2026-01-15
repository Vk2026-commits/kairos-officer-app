import { CheckCircle, Clock, Users, Phone, Mail } from "lucide-react";
import { ApplicationForm } from "@/components/ApplicationForm";
import kairosLogo from "@/assets/kairos-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img 
              src={kairosLogo} 
              alt="Kairos Security" 
              className="h-16 md:h-20 object-contain"
            />
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              <a 
                href="tel:1-888-524-7678" 
                className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
              >
                <Phone className="w-4 h-4" />
                1-888-524-7678
              </a>
              <a 
                href="mailto:info@kairossecurity.com" 
                className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@kairossecurity.com
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Join Our Elite Security Team
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            Start your career with one of the most trusted security companies. 
            Complete your application online in just a few minutes.
          </p>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold">Competitive Pay</h3>
              <p className="text-sm text-primary-foreground/80">Industry-leading wages and benefits</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold">Flexible Schedules</h3>
              <p className="text-sm text-primary-foreground/80">Multiple shift options available</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold">Career Growth</h3>
              <p className="text-sm text-primary-foreground/80">Advancement opportunities within</p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              Security Officer Application
            </h2>
            <p className="text-muted-foreground">
              Complete all sections below to submit your application
            </p>
          </div>
          
          <ApplicationForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="hero-gradient text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <img 
              src={kairosLogo} 
              alt="Kairos Security" 
              className="h-12 object-contain brightness-0 invert"
            />
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              <a 
                href="tel:1-888-524-7678" 
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <Phone className="w-4 h-4" />
                1-888-524-7678
              </a>
              <a 
                href="mailto:info@kairossecurity.com" 
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@kairossecurity.com
              </a>
            </div>
          </div>
          <p className="text-center text-sm text-primary-foreground/70 mt-6">
            © 2026 Kairos Security. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
