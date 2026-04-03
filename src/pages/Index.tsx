import { Phone, Mail } from "lucide-react";
import { ApplicationForm } from "@/components/ApplicationForm";
import kairosLogo from "@/assets/kairos-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img 
              src={kairosLogo} 
              alt="Kairos Security" 
              className="h-14 md:h-16 object-contain"
            />
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              <a 
                href="tel:1-888-524-7678" 
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
              >
                <Phone className="w-4 h-4 text-primary" />
                1-888-524-7678
              </a>
              <a 
                href="mailto:info@kairossecurity.com" 
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
              >
                <Mail className="w-4 h-4 text-primary" />
                info@kairossecurity.com
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Simple and clean like their website */}
      <section className="bg-foreground text-background py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-display font-bold mb-3">
            Security Officer Onboarding Packet
          </h1>
          <p className="text-base md:text-lg text-background/80 max-w-xl mx-auto">
            Welcome to the team! Please complete your onboarding paperwork below.
          </p>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-8 md:py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <ApplicationForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <img 
              src={kairosLogo} 
              alt="Kairos Security" 
              className="h-10 object-contain brightness-0 invert"
            />
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              <a 
                href="tel:1-888-524-7678" 
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                1-888-524-7678
              </a>
              <a 
                href="mailto:info@kairossecurity.com" 
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@kairossecurity.com
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 mt-4">
            <p className="text-center text-sm text-background/60">
              © 2026 Kairos Security. All rights reserved.
            </p>
            <a 
              href="/admin" 
              className="text-xs text-background/40 hover:text-background/60 transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;