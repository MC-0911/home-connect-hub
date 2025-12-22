import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(searchParams.get("mode") === "signup" ? "signup" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  // Get redirect URL from query params, default to "/"
  const redirectTo = searchParams.get("redirect") || "/";

  // Check if user is already logged in
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate(redirectTo);
      }
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session?.user) {
        navigate(redirectTo);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, redirectTo]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.name
            }
          }
        });
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
        } else if (data.user) {
          if (data.user.identities?.length === 0) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.success("Account created! Please check your email to verify your account.", {
              duration: 5000
            });
          }
        }
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Please verify your email before signing in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate(redirectTo);
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSocialLogin = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`
        }
      });
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 min-h-screen flex items-center justify-center px-4 bg-primary-foreground my-[30px]">
        <div className="w-full max-w-md">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="bg-card rounded-2xl p-8 shadow-elegant border border-border">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-gold">
                  <span className="font-display font-bold text-accent-foreground text-xl">R</span>
                </div>
              </Link>
              <h1 className="font-display text-2xl font-semibold text-foreground">
                {mode === "login" ? "Welcome Back" : "Create Your Account"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {mode === "login" ? "Sign in to access your dashboard" : "Join Royal Landmark today"}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex rounded-lg p-1 mb-8 bg-sidebar-foreground">
              <button onClick={() => setMode("login")} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                Sign In
              </button>
              <button onClick={() => setMode("signup")} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input placeholder="Full Name" className="pl-10 h-12" value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} disabled={loading} />
                </div>}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="email" placeholder="Email Address" className="pl-10 h-12" value={formData.email} onChange={e => setFormData({
                ...formData,
                email: e.target.value
              })} required disabled={loading} />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="Password" className="pl-10 pr-10 h-12" value={formData.password} onChange={e => setFormData({
                ...formData,
                password: e.target.value
              })} required disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {mode === "login" && <div className="flex justify-end">
                  <button type="button" className="text-sm text-accent hover:underline">
                    Forgot password?
                  </button>
                </div>}

              <Button variant="gold" className="w-full h-12" type="submit" disabled={loading}>
                {loading ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    {mode === "login" ? "Signing In..." : "Creating Account..."}
                  </span> : <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12" onClick={() => handleSocialLogin("google")} disabled={loading}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-12" onClick={() => handleSocialLogin("github")} disabled={loading}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              By continuing, you agree to our{" "}
              <a href="#" className="text-accent hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-accent hover:underline">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </div>
      </main>
    </div>;
}