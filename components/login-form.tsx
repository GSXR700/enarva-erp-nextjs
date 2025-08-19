"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

// Icônes pour les boutons de connexion sociale
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.494 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);
const FacebookIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h5.713C23.41 24 24 23.41 24 22.675V1.325C24 .59 23.41 0 22.675 0z" />
    </svg>
);

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Met le focus sur le champ email au chargement
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    
    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      setIsLoading(false);
    } else if (result?.ok) {
      router.push("/administration");
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-dark-surface p-8 md:p-10 rounded-[20px] shadow-2xl border border-gray-100 dark:border-dark-border relative mx-4 sm:mx-0">
      
      <div className="text-center mb-8">
        <div className="flex flex-row justify-center items-center gap-3 mb-4">
          {/* Affiche le bon logo en fonction du thème via CSS */}
          <div className="block dark:hidden">
            <Image
              src={"/images/light-mobile.PNG"}
              alt="Enarva Logo"
              width={40}
              height={40}
            />
          </div>
          <div className="hidden dark:block">
             <Image
              src={"/images/dark-mobile.png"}
              alt="Enarva Logo"
              width={40}
              height={40}
            />
          </div>
          <span className="text-3xl font-semibold text-gray-800 dark:text-dark-text">
            Workspace
          </span>
        </div>
        <p className="text-gray-500 dark:text-dark-subtle text-sm mt-1">
          Entrez vos identifiants pour accéder à votre espace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative flex items-center">
            <AlertCircle className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">
            Email
          </label>
          <input
            ref={emailInputRef}
            id="email"
            placeholder="nom@exemple.com"
            type="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-dark-container border-2 border-transparent focus:border-primary focus:ring-0 dark:text-dark-text transition"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-dark-container border-2 border-transparent focus:border-primary focus:ring-0 dark:text-dark-text transition pr-10"
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? ( <EyeOff className="h-5 w-5 text-gray-400 dark:text-dark-subtle" /> ) : ( <Eye className="h-5 w-5 text-gray-400 dark:text-dark-subtle" /> )}
              <span className="sr-only">Afficher/Cacher le mot de passe</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-primary dark:text-dark-subtle dark:hover:text-primary font-medium">
            Mot de passe oublié ?
          </Link>
        </div>
        <button
          className="w-full text-white font-semibold py-3 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          type="submit"
          disabled={isLoading}
          style={{ backgroundImage: "linear-gradient(to right, #267df4, #2155c9)" }}
        >
          <span className="relative z-10">{isLoading ? "Connexion en cours..." : "Se connecter"}</span>
          {isLoading && (<span className="absolute inset-0 bg-white/30 animate-wipe" style={{ transform: 'skewX(-20deg)' }} />)}
        </button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-dark-border"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-dark-surface text-gray-500 dark:text-dark-subtle">Ou continuer avec</span></div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              disabled={isLoading}
              onClick={() => signIn('google')}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-200 dark:border-dark-border rounded-lg shadow-sm bg-white dark:bg-dark-container text-sm font-medium text-gray-700 dark:text-dark-subtle hover:bg-gray-50 dark:hover:bg-dark-highlight-bg transition-all duration-200 disabled:opacity-50"
            >
              <GoogleIcon /> Google
            </button>
            <button
              disabled={isLoading}
              onClick={() => signIn('facebook')}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-200 dark:border-dark-border rounded-lg shadow-sm bg-white dark:bg-dark-container text-sm font-medium text-gray-700 dark:text-dark-subtle hover:bg-gray-50 dark:hover:bg-dark-highlight-bg transition-all duration-200 disabled:opacity-50"
            >
              <FacebookIcon /> Facebook
            </button>
        </div>
      </div>
    </div>
  );
}