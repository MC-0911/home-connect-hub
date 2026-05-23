import { useState, useEffect } from "react";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Home, Building2, Briefcase, Github } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { ScramblePassword } from "@/components/auth/ScramblePassword";
import { useUserRole } from "@/hooks/useUserRole";
import "./auth-slide.css";

type AccountType = "buyer" | "seller" | "agent";

const accountTypes: { value: AccountType; label: string; icon: typeof Home }[] = [
  { value: "buyer", label: "Buyer", icon: Home },
  { value: "seller", label: "Seller", icon: Building2 },
  { value: "agent", label: "Agent", icon: Briefcase },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [active, setActive] = useState(searchParams.get("mode") === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("buyer");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const { getDashboardPath, primaryRole, loading: roleLoading } = useUserRole();

  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user && !roleLoading && primaryRole) {
        const target = redirectTo !== "/" ? redirectTo : getDashboardPath();
        navigate(target);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !roleLoading && primaryRole) {
        const target = redirectTo !== "/" ? redirectTo : getDashboardPath();
        navigate(target);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, redirectTo, roleLoading, primaryRole, getDashboardPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) toast.error("Invalid email or password.");
        else if (error.message.includes("Email not confirmed")) toast.error("Please verify your email before signing in.");
        else toast.error(error.message);
      } else {
        toast.success("Welcome back!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.email || !signupData.password || !signupData.name.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (signupData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: signupData.name, account_type: accountType },
        },
      });
      if (error) {
        if (error.message.includes("already registered")) toast.error("This email is already registered.");
        else toast.error(error.message);
      } else if (data.user) {
        if (data.user.identities?.length === 0) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          await supabase.rpc("assign_user_role", { _user_id: data.user.id, _role: accountType });
          toast.success("Account created! Check your email to verify.", { duration: 5000 });
          if (accountType === "agent") navigate("/verify-agent");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}${redirectTo}` },
      });
      if (error) toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff]">
        <div className={`auth-container ${active ? "active" : ""}`}>
          {/* Login form */}
          <div className="auth-form-box auth-login">
            <form onSubmit={handleLogin}>
              <h1>Login</h1>
              <div className="auth-input-box">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  disabled={loading}
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                />
                <Mail className="auth-input-icon" />
              </div>
              <div className="auth-input-box">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  disabled={loading}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="auth-input-icon auth-eye"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </button>
              </div>
              <div className="auth-forgot">
                <button type="button" onClick={() => setForgotPasswordOpen(true)}>
                  Forgot Password?
                </button>
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Signing In..." : "Login"}
              </button>
              <p>or login with social platforms</p>
              <div className="auth-social-icons">
                <button type="button" onClick={() => handleSocialLogin("google")} disabled={loading} aria-label="Google">
                  <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </button>
                <button type="button" onClick={() => handleSocialLogin("github")} disabled={loading} aria-label="GitHub">
                  <Github className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Register form */}
          <div className="auth-form-box auth-register">
            <form onSubmit={handleSignup}>
              <h1>Registration</h1>
              <div className="auth-input-box">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  disabled={loading}
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                />
                <User className="auth-input-icon" />
              </div>
              <div className="auth-input-box">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  disabled={loading}
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                />
                <Mail className="auth-input-icon" />
              </div>
              <div className="auth-input-box">
                <input
                  type={showPassword2 ? "text" : "password"}
                  placeholder="Password"
                  required
                  disabled={loading}
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="auth-input-icon auth-eye"
                  onClick={() => setShowPassword2((s) => !s)}
                  tabIndex={-1}
                >
                  {showPassword2 ? <EyeOff className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </button>
              </div>
              {signupData.password && (
                <div className="-mt-4 mb-2 text-left">
                  <PasswordStrengthIndicator password={signupData.password} />
                </div>
              )}
              <div className="auth-role-grid">
                {accountTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setAccountType(t.value)}
                      className={`auth-role-btn ${accountType === t.value ? "active" : ""}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Register"}
              </button>
              <p>or register with social platforms</p>
              <div className="auth-social-icons">
                <button type="button" onClick={() => handleSocialLogin("google")} disabled={loading} aria-label="Google">
                  <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </button>
                <button type="button" onClick={() => handleSocialLogin("github")} disabled={loading} aria-label="GitHub">
                  <Github className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Toggle panel */}
          <div className="auth-toggle-box">
            <div className="auth-toggle-panel auth-toggle-left">
              <h1>Hello, Welcome!</h1>
              <p>Don't have an account?</p>
              <button className="auth-btn auth-toggle-btn" onClick={() => setActive(true)}>
                Register
              </button>
            </div>
            <div className="auth-toggle-panel auth-toggle-right">
              <h1>Welcome Back!</h1>
              <p>Already have an account?</p>
              <button className="auth-btn auth-toggle-btn" onClick={() => setActive(false)}>
                Login
              </button>
            </div>
          </div>
        </div>
      </main>
      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
      <Footer />
    </div>
  );
}
