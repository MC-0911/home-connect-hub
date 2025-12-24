import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    return { score, checks };
  }, [password]);

  const getStrengthLabel = () => {
    if (strength.score === 0) return { label: "Very Weak", color: "bg-destructive" };
    if (strength.score <= 2) return { label: "Weak", color: "bg-destructive" };
    if (strength.score === 3) return { label: "Fair", color: "bg-yellow-500" };
    if (strength.score === 4) return { label: "Good", color: "bg-primary" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const { label, color } = getStrengthLabel();

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={`text-xs font-medium ${
            strength.score <= 2 ? "text-destructive" : 
            strength.score === 3 ? "text-yellow-500" : 
            strength.score === 4 ? "text-primary" : "text-green-500"
          }`}>
            {label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= strength.score ? color : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <RequirementItem met={strength.checks.length} text="8+ characters" />
        <RequirementItem met={strength.checks.lowercase} text="Lowercase letter" />
        <RequirementItem met={strength.checks.uppercase} text="Uppercase letter" />
        <RequirementItem met={strength.checks.number} text="Number" />
        <RequirementItem met={strength.checks.special} text="Special character" />
      </div>
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {met ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      )}
      <span className={`text-xs ${met ? "text-foreground" : "text-muted-foreground"}`}>
        {text}
      </span>
    </div>
  );
}
