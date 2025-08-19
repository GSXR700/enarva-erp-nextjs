"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else if (result?.ok) {
      router.push("/administration");
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="flex flex-col justify-center items-center mb-2">
          <Image
            src="/images/light-logo.png" // Assurez-vous que le chemin vers votre logo est correct
            alt="Enarva Logo"
            width={32}
            height={32}
            className="mb-2"
          />
          <span className="text-2xl text-[#5f6368]" style={{ fontWeight: 400 }}>
            Workspace
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>
        <p className="text-gray-500 text-sm mt-1">
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
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            placeholder="nom@exemple.com"
            type="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
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
              className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition pr-10"
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
              <span className="sr-only">Afficher/Cacher le mot de passe</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-500 hover:text-blue-600 font-medium"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <button
          className="w-full text-white font-semibold py-3 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
          style={{
            backgroundImage: "linear-gradient(to right, #267df4, #2155c9)",
          }}
        >
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}