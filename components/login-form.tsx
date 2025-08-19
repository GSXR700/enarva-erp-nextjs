"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, AlertCircle, Sun, Moon } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState('light');
  const router = useRouter();
  
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Gère le thème au chargement
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
    <div className="w-full max-w-md bg-white dark:bg-dark-surface p-8 md:p-10 rounded-xl shadow-2xl border border-gray-100 dark:border-dark-border relative">
      <button 
        onClick={toggleTheme} 
        className="absolute top-4 right-4 p-2 rounded-full text-gray-500 dark:text-dark-subtle hover:bg-gray-100 dark:hover:bg-dark-highlight-bg transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>

      <div className="text-center mb-8">
        <div className="flex flex-col justify-center items-center mb-4">
          <Image
            src={theme === 'light' ? "/images/light-logo.png" : "/images/dark-logo.png"}
            alt="Enarva Logo"
            width={60}
            height={60}
            className="mb-3"
          />
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
            className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-dark-container border-gray-200 dark:border-dark-border focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary dark:text-dark-text transition"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 dark:text-dark-subtle"
          >
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
              className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-dark-container border-gray-200 dark:border-dark-border focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary dark:text-dark-text transition pr-10"
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 dark:text-dark-subtle" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 dark:text-dark-subtle" />
              )}
              <span className="sr-only">Afficher/Cacher le mot de passe</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-500 hover:text-primary dark:text-dark-subtle dark:hover:text-primary font-medium"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <button
          className="w-full text-white font-semibold py-3 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          type="submit"
          disabled={isLoading}
          style={{
            backgroundImage: "linear-gradient(to right, #267df4, #2155c9)",
          }}
        >
          <span className="relative z-10">
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </span>
          {isLoading && (
            <span 
              className="absolute inset-0 bg-white/30 animate-wipe"
              style={{ transform: 'skewX(-20deg)' }}
            />
          )}
        </button>
      </form>
    </div>
  );
}