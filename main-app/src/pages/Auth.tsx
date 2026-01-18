import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import heroImage from "../assets/hero-artisan-marketplace.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [userRole, setUserRole] = useState<"customer" | "artisan">("customer");
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // <--- NEW STATE FOR SUCCESS

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (authMode === "signup") {
        // 1. SIGN UP LOGIC
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: userRole,
            },
          },
        });
        if (error) throw error;
        
        // 👇 SUCCESS! Show message & Redirect
        setSuccessMsg("Successfully registered! Redirecting...");
        
        setTimeout(() => {
            if (userRole === "customer") {
                navigate("/customer");
            } else {
                navigate("/artist");
            }
        }, 1500);

      } else {
        // 2. LOGIN LOGIC
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Redirect based on role
        const role = data.user.user_metadata.role;
        if (role === "artisan") navigate("/artist");
        else navigate("/customer");
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans bg-slate-50">
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Background" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/40 to-purple-100/40" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-5xl h-auto md:h-[600px] flex rounded-3xl overflow-hidden shadow-xl bg-white/80 border border-white/60 m-4 animate-fade-in backdrop-blur-xl">
        
        {/* LEFT SIDE: Visuals */}
        <div className={`hidden md:flex w-1/2 relative flex-col justify-between p-12 transition-colors duration-500 ${
          userRole === 'customer' 
            ? 'bg-gradient-to-br from-orange-200 to-rose-300 text-orange-950'  
            : 'bg-gradient-to-br from-purple-200 to-indigo-300 text-indigo-950'
        }`}>
          {/* Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

           <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                <Sparkles className={`w-6 h-6 ${userRole === 'customer' ? 'text-orange-700' : 'text-purple-700'}`} />
              </div>
              <span className="text-2xl font-bold tracking-tight">KalaSetu</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              {userRole === 'customer' ? "Discover the Soul of Indian Craft" : "Share Your Craft with the World"}
            </h2>
             <p className={`text-lg leading-relaxed ${userRole === 'customer' ? 'text-orange-900/80' : 'text-indigo-900/80'}`}>
              {userRole === 'customer'
                ? "Join a community of art lovers supporting traditional artisans directly."
                : "Access professional tools to manage your inventory, orders, and sales."}
            </p>
          </div>
          
           <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/30 p-4 rounded-xl backdrop-blur-md border border-white/40">
              <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${userRole === 'customer' ? 'text-orange-800' : 'text-purple-800'}`} />
              <span className="text-sm font-semibold">Verified Authentic Artisans</span>
            </div>
            <div className="flex items-center gap-3 bg-white/30 p-4 rounded-xl backdrop-blur-md border border-white/40">
              <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${userRole === 'customer' ? 'text-orange-800' : 'text-purple-800'}`} />
              <span className="text-sm font-semibold">Secure Payments & Shipping</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full md:w-1/2 bg-white/90 backdrop-blur-xl p-8 md:p-12 flex flex-col justify-center">
          
          <div className="mb-6">
             <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-slate-700 mb-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
             <h3 className="text-3xl font-bold text-slate-800 mb-2">
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            
            {/* 👇 ERROR & SUCCESS MESSAGES */}
            {errorMsg && <p className="text-red-500 text-sm font-medium animate-pulse">{errorMsg}</p>}
            {successMsg && <p className="text-green-600 text-sm font-bold animate-pulse">{successMsg}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-600">Full Name</Label>
                <div className="relative">
                   <User className="absolute left-3 top-3 h-5 w-5 text-slate-300" />
                   <Input 
                    id="name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe" 
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-orange-300"
                    required 
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-600">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-300" />
                <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-orange-300"
                    required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-600">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-300" />
                <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-orange-300"
                    required 
                />
              </div>
            </div>
            
            <div className="flex p-1 bg-slate-50 rounded-lg mb-4 border border-slate-100">
               <button type="button" onClick={() => setUserRole("customer")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${userRole === "customer" ? "bg-orange-100 text-orange-700 shadow-sm" : "text-slate-400"}`}>Customer</button>
               <button type="button" onClick={() => setUserRole("artisan")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${userRole === "artisan" ? "bg-purple-100 text-purple-700 shadow-sm" : "text-slate-400"}`}>Artisan</button>
            </div>

            <Button 
                type="submit" 
                className={`w-full h-11 text-lg font-bold shadow-md transition-all hover:scale-[1.02] text-white border-0 ${
                    userRole === 'customer' 
                    ? 'bg-gradient-to-r from-orange-300 to-rose-400 hover:from-orange-400 hover:to-rose-500'
                    : 'bg-gradient-to-r from-purple-300 to-indigo-400 hover:from-purple-400 hover:to-indigo-500'
                }`} 
                disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (authMode === "login" ? "Sign In" : "Sign Up")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className={`font-bold hover:underline ${userRole === 'customer' ? 'text-orange-400' : 'text-purple-400'}`}>
              {authMode === "login" ? "Create an account" : "Already have an account?"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;