"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Music2, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";

export default function HomePage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou senha incorretos.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta.");
        setLoading(false);
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
    } catch {
      setError("Erro de conexão.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600 mb-4">
            <Music2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">SetList Pro</h1>
          <p className="text-slate-400 mt-1">Seu repertório sempre em mãos</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                tab === "login"
                  ? "text-violet-400 border-b-2 border-violet-500 bg-slate-800/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Entrar
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                tab === "register"
                  ? "text-violet-400 border-b-2 border-violet-500 bg-slate-800/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Criar Conta
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Senha</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Senha</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      placeholder="mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  {loading ? "Criando conta..." : "Criar Conta"}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          SetList Pro v1.0 — Feito para músicos
        </p>
      </div>
    </main>
  );
}
