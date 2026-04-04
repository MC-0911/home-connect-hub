import { useState, useMemo } from "react";
import { Calculator, DollarSign, Percent, Clock, TrendingUp, PiggyBank, Banknote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";

export function MortgageCalculatorSection() {
  const [homePrice, setHomePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState("30");
  const [result, setResult] = useState<{ monthly: number; totalInterest: number; totalPayment: number; principal: number } | null>(null);

  const downPaymentPercent = useMemo(() => {
    if (homePrice <= 0) return 0;
    return Math.round((downPayment / homePrice) * 100);
  }, [homePrice, downPayment]);

  const calculate = () => {
    const principal = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = parseInt(loanTerm) * 12;

    if (monthlyRate === 0) {
      const monthly = principal / numPayments;
      setResult({ monthly, totalInterest: 0, totalPayment: principal, principal });
      return;
    }

    const monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalPayment = monthly * numPayments;
    const totalInterest = totalPayment - principal;

    setResult({ monthly, totalInterest, totalPayment, principal });
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  // Donut chart calculations
  const principalPercent = result ? (result.principal / result.totalPayment) * 100 : 0;
  const interestPercent = result ? (result.totalInterest / result.totalPayment) * 100 : 0;
  const circumference = 2 * Math.PI * 54;
  const principalStroke = (principalPercent / 100) * circumference;
  const interestStroke = (interestPercent / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Mortgage Calculator</h2>
          <p className="text-sm text-muted-foreground">Estimate your monthly mortgage payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 rounded-2xl border border-white/20 bg-card/60 backdrop-blur-xl shadow-xl p-6 space-y-6"
        >
          {/* Home Price */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" />
                Home Price
              </label>
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                {formatCurrency(homePrice)}
              </span>
            </div>
            <Input
              type="number"
              value={homePrice}
              onChange={e => setHomePrice(Number(e.target.value))}
              step={10000}
              className="bg-background/50 border-border/50 rounded-xl h-11 font-medium backdrop-blur-sm"
            />
            <Slider
              value={[homePrice]}
              onValueChange={([v]) => setHomePrice(v)}
              min={50000}
              max={2000000}
              step={10000}
              className="mt-1"
            />
          </div>

          {/* Down Payment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-accent" />
                Down Payment
              </label>
              <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-lg">
                {downPaymentPercent}%
              </span>
            </div>
            <Input
              type="number"
              value={downPayment}
              onChange={e => setDownPayment(Number(e.target.value))}
              step={5000}
              className="bg-background/50 border-border/50 rounded-xl h-11 font-medium backdrop-blur-sm"
            />
            <Slider
              value={[downPayment]}
              onValueChange={([v]) => setDownPayment(v)}
              min={0}
              max={homePrice}
              step={5000}
              className="mt-1"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Percent className="w-4 h-4 text-accent" />
                Interest Rate
              </label>
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                {interestRate}%
              </span>
            </div>
            <Input
              type="number"
              value={interestRate}
              onChange={e => setInterestRate(Number(e.target.value))}
              step={0.1}
              className="bg-background/50 border-border/50 rounded-xl h-11 font-medium backdrop-blur-sm"
            />
            <Slider
              value={[interestRate * 10]}
              onValueChange={([v]) => setInterestRate(v / 10)}
              min={5}
              max={150}
              step={1}
              className="mt-1"
            />
          </div>

          {/* Loan Term */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Loan Term
            </label>
            <Select value={loanTerm} onValueChange={setLoanTerm}>
              <SelectTrigger className="bg-background/50 border-border/50 rounded-xl h-11 font-medium backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="10">10 years</SelectItem>
                <SelectItem value="15">15 years</SelectItem>
                <SelectItem value="20">20 years</SelectItem>
                <SelectItem value="25">25 years</SelectItem>
                <SelectItem value="30">30 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={calculate}
            className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity shadow-lg shadow-accent/25 group"
          >
            Calculate Payment
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 rounded-2xl border border-white/20 bg-card/60 backdrop-blur-xl shadow-xl p-6 flex flex-col"
        >
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col"
              >
                {/* Monthly Payment Hero */}
                <div className="text-center mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Your Monthly Payment</p>
                  <motion.p
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-display font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent"
                  >
                    {formatCurrency(result.monthly)}
                  </motion.p>
                  <p className="text-xs text-muted-foreground mt-2">Principal & Interest • {loanTerm}-Year Fixed</p>
                </div>

                {/* Donut Chart + Breakdown */}
                <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
                  {/* Donut Chart */}
                  <div className="relative w-40 h-40 shrink-0">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="54" fill="none" className="stroke-muted/20" strokeWidth="12" />
                      <motion.circle
                        cx="60" cy="60" r="54" fill="none"
                        className="stroke-accent"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${principalStroke} ${circumference}`}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                      <motion.circle
                        cx="60" cy="60" r="54" fill="none"
                        className="stroke-primary"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${interestStroke} ${circumference}`}
                        strokeDashoffset={-principalStroke}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs text-muted-foreground">Total</span>
                      <span className="text-sm font-bold text-foreground">{formatCurrency(result.totalPayment)}</span>
                    </div>
                  </div>

                  {/* Breakdown Cards */}
                  <div className="flex-1 w-full space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10"
                    >
                      <div className="w-3 h-3 rounded-full bg-accent shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Loan Amount</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(result.principal)}</p>
                      </div>
                      <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-lg">
                        {Math.round(principalPercent)}%
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10"
                    >
                      <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Total Interest</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(result.totalInterest)}</p>
                      </div>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                        {Math.round(interestPercent)}%
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50"
                    >
                      <Banknote className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Total Payment</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(result.totalPayment)}</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                  <TrendingUp className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <p className="text-lg font-semibold text-muted-foreground/60">
                  Enter values and click Calculate
                </p>
                <p className="text-sm text-muted-foreground/40 mt-1">
                  See your estimated monthly payments and breakdown
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
