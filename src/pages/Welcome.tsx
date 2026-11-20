import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";

const BgOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    <div
      className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 animate-float"
      style={{ background: "radial-gradient(circle, hsl(45 93% 60%), transparent 70%)" }}
    />
    <div
      className="absolute top-1/3 -right-24 w-96 h-96 rounded-full opacity-15 animate-floatSlow"
      style={{ background: "radial-gradient(circle, hsl(142 71% 50%), transparent 70%)" }}
    />
    <div
      className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full opacity-10 animate-float delay-300"
      style={{ background: "radial-gradient(circle, hsl(199 89% 55%), transparent 70%)" }}
    />
  </div>
);

const Welcome = () => {
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleContinue = () => {
    if (name.trim()) {
      localStorage.setItem("userName", name.trim());
      navigate("/coupon/1");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-welcome flex flex-col overflow-hidden">
      <BgOrbs />

      {/* Header */}
      <div className="relative container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className={`transition-all duration-700 ${mounted ? "animate-fadeInDown" : "opacity-0"}`}>
            <Logo />
          </div>
          <div className={`transition-all duration-700 delay-200 ${mounted ? "animate-fadeInDown" : "opacity-0"}`}>
            <span className="text-sm font-body text-muted-foreground">Olá, Cliente</span>
            <p className="font-heading text-sm font-bold text-foreground">Kz 0</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="relative flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl text-center space-y-10">

          {/* Gift icon */}
          <div className={`text-6xl md:text-7xl transition-all duration-700 ${mounted ? "animate-bounceIn" : "opacity-0"}`}>
            🎁
          </div>

          {/* Heading */}
          <div
            className={`space-y-4 transition-all duration-700 ${mounted ? "animate-fadeInUp" : "opacity-0"}`}
            style={{ animationDelay: "0.15s" }}
          >
            <h1 className="text-display-xl">
              Olá! Como você{" "}
              <span className="text-gradient-gold">se chama?</span>
            </h1>
            <p className="text-body-lg text-muted-foreground">
              Vamos personalizar a sua experiência 🚀
            </p>
          </div>

          {/* Form */}
          <div
            className={`space-y-4 transition-all duration-700 ${mounted ? "animate-fadeInUp" : "opacity-0"}`}
            style={{ animationDelay: "0.3s" }}
          >
            <div
              className={`relative rounded-xl transition-all duration-300 ${focused ? "ring-2 ring-primary/50 scale-[1.01]" : ""}`}
            >
              <Input
                id="welcome-name-input"
                type="text"
                placeholder="Digite seu nome..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleContinue()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="h-14 text-lg text-center border-2 border-border/60 focus:border-primary transition-all duration-300 font-body"
              />
            </div>

            <Button
              id="welcome-continue-btn"
              onClick={handleContinue}
              disabled={!name.trim()}
              className="w-full h-14 text-base font-bold btn-shimmer animate-pulseGlowPrimary disabled:animate-none tracking-wide"
              size="lg"
              style={{
                background: name.trim()
                  ? "linear-gradient(135deg, hsl(45 93% 47%), hsl(33 100% 50%))"
                  : undefined,
                transition: "all 0.3s ease",
              }}
            >
              Continuar →
            </Button>

            <p className="text-body-sm text-muted-foreground animate-fadeIn delay-500">
              Ao continuar, você concorda com nossos{" "}
              <span className="underline cursor-pointer hover:text-foreground transition-colors font-semibold">
                termos de uso
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="relative h-16 overflow-hidden pointer-events-none" aria-hidden>
        <svg viewBox="0 0 1200 80" className="absolute bottom-0 w-full" preserveAspectRatio="none" fill="hsl(45 93% 47% / 0.08)">
          <path d="M0,40 C300,80 900,0 1200,40 L1200,80 L0,80 Z" />
        </svg>
      </div>
    </div>
  );
};

export default Welcome;
