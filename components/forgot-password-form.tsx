"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // Simule un appel API pour la réinitialisation
    // Remplacez ceci par votre logique métier réelle
    console.log("Demande de réinitialisation pour :", email);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  }

  return (
    <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-2xl border border-gray-100">
      <div className="mb-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mot de passe oublié</h1>
        <p className="text-gray-500 text-sm">
          Ne vous inquiétez pas, entrez votre email et nous vous enverrons un lien pour le réinitialiser.
        </p>
      </div>
      <div>
        {isSuccess ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-lg flex">
            <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Vérifiez vos emails</h3>
              <p className="text-sm mt-1">
                Un lien de réinitialisation a été envoyé à votre adresse.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
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
            <button
              className="w-full text-white font-semibold py-3 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
              style={{
                backgroundImage: "linear-gradient(to right, #267df4, #2155c9)",
              }}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}