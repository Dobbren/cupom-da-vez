import { useEffect, useState } from "react";
import Logo from "./Logo";

interface HeaderProps {
  userName?: string;
  balance?: number;
}

const Header = ({ userName, balance }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(balance ?? 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animate balance counter when it changes
  useEffect(() => {
    if (balance === undefined) return;
    const target = balance;
    const start = displayBalance;
    const diff = target - start;
    if (diff === 0) return;
    const steps = 30;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplayBalance(Math.round(start + (diff * step) / steps));
      if (step >= steps) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [balance]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-lg shadow-black/5"
          : "bg-background/80 backdrop-blur-sm border-b border-border/50"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo with subtle float */}
        <div className="animate-fadeInDown">
          <Logo />
        </div>

        {/* User info */}
        <div className="flex items-center gap-4 animate-fadeInDown delay-100">
          {userName && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              Olá,{" "}
              <span className="font-semibold text-foreground">{userName}</span>
            </span>
          )}
          {balance !== undefined && (
            <div className="flex items-center gap-1.5 bg-success/10 border border-success/30 rounded-full px-3.5 py-1.5 shadow-sm shadow-success/10 transition-all duration-300">
              <span className="text-success text-xs">💰</span>
              <span className="text-sm font-heading font-extrabold text-success tracking-tight tabular-nums">
                Kz {displayBalance.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
