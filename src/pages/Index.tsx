import { Phone, Mail, FileText, Briefcase, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import kairosLogo from "@/assets/kairos-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      {/* Hero */}
      <section className="bg-foreground text-background py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-display font-bold mb-3">
            Kairos Security Portal
          </h1>
          <p className="text-base md:text-lg text-background/80 max-w-xl mx-auto">
            Select a form below to get started.
          </p>
        </div>
      </section>

      {/* Links */}
      <section className="py-12 md:py-20 bg-secondary/30 flex-1">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="grid gap-6">
            <Link to="/employment-application" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Employment Application</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Apply for a position at Kairos Security. Fill out your employment history, qualifications, and references.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/onboarding-packet" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="rounded-full bg-primary/10 p-3">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Onboarding Packet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Already hired? Complete your onboarding paperwork including W-4, direct deposit, background check, and more.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Admin Portal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Access the admin dashboard to manage applications, view call logs, and oversee operations.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
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
