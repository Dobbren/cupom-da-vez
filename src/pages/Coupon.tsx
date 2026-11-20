import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { coupons, generateCodeOptions } from "@/lib/coupons";
import { Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";

/* ─── Confetti helper ─────────────────────────────────────── */
const CONFETTI_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899"];

const launchConfetti = () => {
  const container = document.body;
  for (let i = 0; i < 25; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.top = "-20px";
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.width = Math.random() * 10 + 6 + "px";
    piece.style.height = Math.random() * 10 + 6 + "px";
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    piece.style.animationDuration = Math.random() * 2 + 2 + "s";
    piece.style.animationDelay = Math.random() * 0.8 + "s";
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
};

/* ─── Wrong-shake helper ──────────────────────────────────── */
const shakeElement = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("animate-wiggle");
  setTimeout(() => el.classList.remove("animate-wiggle"), 500);
};

const Coupon = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const couponIndex = parseInt(id || "1") - 1;
  const coupon = coupons[couponIndex];

  const [userName, setUserName] = useState("");
  const [totalBalance, setTotalBalance] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [lastReward, setLastReward] = useState(0);
  const [cardKey, setCardKey] = useState(0); // remount card on navigate to re-trigger animation

  const codeOptions = useMemo(() => {
    if (coupon) return generateCodeOptions(coupon.barcode);
    return [];
  }, [coupon?.barcode]);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (!name) { navigate("/"); return; }
    setUserName(name);
    const balance = parseInt(localStorage.getItem("totalBalance") || "0");
    setTotalBalance(balance);
    setCardKey((k) => k + 1); // trigger entrance animation on each coupon
  }, [navigate, id]);

  if (!coupon) { navigate("/limit-reached"); return null; }

  const handleCodeSelect = useCallback((selectedCode: string, btnId: string) => {
    if (selectedCode === coupon.barcode) {
      const newBalance = totalBalance + coupon.reward;
      localStorage.setItem("totalBalance", newBalance.toString());
      setTotalBalance(newBalance);
      setLastReward(coupon.reward);
      launchConfetti();
      setTimeout(() => setShowRewardModal(true), 300);
    } else {
      shakeElement(btnId);
      toast.error("Código incorreto! Tente novamente.", {
        icon: "❌",
        style: { borderLeft: "4px solid #ef4444" },
      });
    }
  }, [coupon, totalBalance]);

  const handleContinue = () => {
    setShowRewardModal(false);
    if (couponIndex + 1 < coupons.length) {
      navigate(`/coupon/${couponIndex + 2}`);
    } else {
      navigate("/limit-reached");
    }
  };

  const progressPercentage = ((couponIndex + 1) / coupons.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-welcome">
      <Header userName={userName} balance={totalBalance} />

      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Title row */}
          <div className="text-center space-y-4 animate-fadeInDown">
            <div className="inline-flex items-center gap-2 bg-success/10 border border-success/30 rounded-full px-4 py-1.5">
              <Sparkles className="w-4 h-4 text-success animate-spin-slow" />
              <h1 className="label-badge text-success">
                Novo Cupom Encontrado!
              </h1>
              <Sparkles className="w-4 h-4 text-success animate-spin-slow" />
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Cupom {couponIndex + 1} de {coupons.length}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-animated transition-all duration-700 ease-out progress-stripe"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Coupon card — re-animates on each coupon */}
          <div
            key={cardKey}
            className="bg-card rounded-2xl shadow-xl p-6 space-y-6 card-hover animate-scaleIn border border-border/50"
          >
            <h2 className="text-display-md text-center text-card-foreground animate-fadeIn delay-100">
              {coupon.productName}
            </h2>

            {/* Product image */}
            <div className="bg-product-bg rounded-xl p-4 flex items-center justify-center min-h-[280px] overflow-hidden relative animate-fadeIn delay-200">
              {/* Subtle shine overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)",
                }}
              />
              <img
                src={coupon.image}
                alt={coupon.productName}
                className="max-w-full max-h-[400px] object-contain rounded-lg drop-shadow-md transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Code selection */}
            <div className="space-y-4 animate-fadeInUp delay-300">
              <p className="text-center text-info font-medium flex items-center justify-center gap-2 text-sm">
                <span>ℹ️</span>
                Selecione o código correto da imagem acima
                <span>ℹ️</span>
              </p>

              <div className="grid grid-cols-2 gap-3">
                {codeOptions.map((code, index) => {
                  const btnId = `code-btn-${index}`;
                  return (
                    <Button
                      key={index}
                      id={btnId}
                      variant="outline"
                      onClick={() => handleCodeSelect(code, btnId)}
                      className="h-14 code-btn-text border-2 hover:border-primary hover:bg-primary/10 hover:scale-[1.03] active:scale-95 transition-all duration-200"
                      style={{ animationDelay: `${0.35 + index * 0.08}s` }}
                    >
                      {code}
                    </Button>
                  );
                })}
              </div>

              {/* Reward badge */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-full px-5 py-2 animate-heartbeat">
                  <span className="text-lg">💰</span>
                  <p className="font-bold text-destructive text-lg">
                    Kz {coupon.reward.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reward modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl overflow-hidden p-0">
          {/* Gradient header */}
          <div className="bg-gradient-success p-8 text-center space-y-3">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center animate-bounceIn">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-display-md text-white animate-fadeInUp">
              Recompensa Desbloqueada! 🎉
            </h3>
          </div>

          {/* Body */}
          <div className="p-8 text-center space-y-5 bg-card">
            <div className="animate-bounceIn delay-100">
              <p className="text-5xl font-black text-success">
                + Kz {lastReward.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">adicionados ao seu saldo</p>
            </div>

            <p className="text-muted-foreground animate-fadeIn delay-200">
              Continue a avaliar para ganhar ainda mais! 🚀
            </p>

            <Button
              id="reward-continue-btn"
              onClick={handleContinue}
              className="w-full h-12 text-lg font-bold btn-shimmer animate-fadeInUp delay-300"
              style={{ background: "linear-gradient(135deg, hsl(142 71% 45%), hsl(142 71% 35%))" }}
            >
              Próximo Cupom →
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coupon;
