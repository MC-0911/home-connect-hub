import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MortgageCalculatorSection() {
  const [homePrice, setHomePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState("30");
  const [result, setResult] = useState<{ monthly: number; totalInterest: number; totalPayment: number } | null>(null);

  const calculate = () => {
    const principal = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = parseInt(loanTerm) * 12;

    if (monthlyRate === 0) {
      const monthly = principal / numPayments;
      setResult({ monthly, totalInterest: 0, totalPayment: principal });
      return;
    }

    const monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalPayment = monthly * numPayments;
    const totalInterest = totalPayment - principal;

    setResult({ monthly, totalInterest, totalPayment });
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-6 w-6 text-accent" />
        <h2 className="text-2xl font-bold">Mortgage Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Home Price</label>
              <Input type="number" value={homePrice} onChange={e => setHomePrice(Number(e.target.value))} step={10000} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Down Payment</label>
              <Input type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} step={5000} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Interest Rate (%)</label>
              <Input type="number" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} step={0.1} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Loan Term</label>
              <Select value={loanTerm} onValueChange={setLoanTerm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 years</SelectItem>
                  <SelectItem value="20">20 years</SelectItem>
                  <SelectItem value="30">30 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={calculate} className="w-full">Calculate</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
            {result ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="text-4xl font-bold text-accent">{formatCurrency(result.monthly)}</p>
                <p className="text-sm text-muted-foreground">Principal & Interest</p>
                <div className="w-full border-t border-border pt-4 mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Interest:</span>
                    <span className="font-semibold">{formatCurrency(result.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Payment:</span>
                    <span className="font-semibold">{formatCurrency(result.totalPayment)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter values and click Calculate to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
