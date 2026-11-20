import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const LimitReached = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [totalBalance, setTotalBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (!name) { navigate("/"); return; }
    setUserName(name);
    const balance = parseInt(localStorage.getItem("totalBalance") || "0");
    setTotalBalance(balance);
    setTimeout(() => setMounted(true), 100);
  }, [navigate]);

  // Count-up animation for balance
  useEffect(() => {
    if (!mounted || totalBalance === 0) return;
    let start = 0;
    const end = totalBalance;
    const duration = 1500;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplayBalance(end); clearInterval(timer); }
      else setDisplayBalance(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [mounted, totalBalance]);

  return (
    <div className="min-h-screen bg-gradient-welcome relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 animate-float"
          style={{ background: "radial-gradient(circle, hsl(142 71% 50%), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-15 animate-floatSlow"
          style={{ background: "radial-gradient(circle, hsl(45 93% 60%), transparent 70%)" }}
        />
      </div>

      <Header userName={userName} balance={totalBalance} />

      <div className="relative container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">

          {/* Trophy icon */}
          <div className={`text-7xl md:text-8xl transition-all duration-700 ${mounted ? "animate-bounceIn" : "opacity-0"}`}>
            🏆
          </div>

          {/* Heading */}
          <div className={`space-y-3 transition-all duration-700 ${mounted ? "animate-fadeInUp" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
            <h1 className="text-display-lg">
              Limite Diário{" "}
              <span className="text-gradient-gold">Atingido!</span>
            </h1>
            <p className="text-body-lg text-muted-foreground">
              Parabéns, {userName}! Você completou todos os cupões de hoje. 🎉
            </p>
          </div>

          {/* Balance card */}
          <div
            className={`space-y-3 transition-all duration-700 ${mounted ? "animate-scaleIn" : "opacity-0"}`}
            style={{ animationDelay: "0.4s" }}
          >
            <p className="text-lg font-semibold text-foreground">Saldo Total Acumulado:</p>
            <div className="relative bg-success/10 border-2 border-success rounded-2xl p-8 animate-pulseGlow overflow-hidden">
              {/* Shimmering overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2.5s infinite",
                }}
              />
              <p className="relative text-5xl md:text-6xl font-black text-success tracking-tight">
                Kz {displayBalance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div
            className={`space-y-4 transition-all duration-700 ${mounted ? "animate-fadeInUp" : "opacity-0"}`}
            style={{ animationDelay: "0.6s" }}
          >
            <p className="text-info font-medium flex items-center justify-center gap-2">
              <span>ℹ️</span>
              Realize o seu saque abaixo
              <span>ℹ️</span>
            </p>

            <Button
              id="limit-reached-withdraw-btn"
              onClick={() => navigate("/withdraw")}
              size="lg"
              className="w-full max-w-md h-14 text-lg font-bold btn-shimmer"
              style={{
                background: "linear-gradient(135deg, hsl(45 93% 47%), hsl(33 100% 50%))",
              }}
            >
              💸 REALIZAR SAQUE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitReached;
