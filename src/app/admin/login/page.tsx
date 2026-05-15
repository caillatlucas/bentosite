"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      router.push("/admin");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/40 border border-text-black/10 p-8 rounded-sm shadow-xl shadow-shadow-red/10 relative"
      >
        <Link href="/" className="absolute -top-12 left-0 text-text-black/50 hover:text-primary-red flex items-center gap-2 text-sm uppercase tracking-widest font-medium transition-colors">
          <ArrowLeft size={16} /> Retour au site
        </Link>
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-primary-red mb-2 tracking-tighter">CAILLAT</h1>
          <p className="text-text-black/50 text-sm uppercase tracking-widest">Accès Administration</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-black/70 mb-2 font-medium">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-text-black/20 rounded-sm px-4 py-3 focus:outline-none focus:border-primary-red transition-colors"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-black/70 mb-2 font-medium">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-text-black/20 rounded-sm px-4 py-3 focus:outline-none focus:border-primary-red transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-primary-red text-sm font-medium">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full bg-text-black text-white py-4 rounded-sm hover:bg-soft-black transition-all font-medium flex items-center justify-center gap-2 group"
          >
            <Lock size={16} className="group-hover:rotate-12 transition-transform" />
            Se connecter
          </button>
        </form>
      </motion.div>
    </div>
  );
}
