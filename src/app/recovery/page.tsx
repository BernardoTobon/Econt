"use client";
import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../../firebase/Index";

function PasswordRecovery() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setLoading(true);
    try {
      const auth = getAuth(app);
      await sendPasswordResetEmail(auth, email);
      setMensaje("Se ha enviado un correo para restablecer tu contraseña.");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No existe una cuenta con ese correo electrónico.");
      } else if (err.code === "auth/invalid-email") {
        setError("La dirección de correo no es válida.");
      } else {
        setError("Ocurrió un error. Intenta de nuevo.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-400 px-2 sm:px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-green-950 bg-opacity-80 p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-md border border-green-500 flex flex-col items-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">Recuperar Contraseña</h2>
        <label className="block text-green-400 mb-2 text-base sm:text-lg w-full text-left" htmlFor="email">
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg mb-4"
          autoComplete="email"
        />
        {mensaje && <div className="mb-4 text-green-400 text-center text-sm w-full">{mensaje}</div>}
        {error && <div className="mb-4 text-red-400 text-center text-sm w-full">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-1 sm:py-1.5 rounded-md bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-xs sm:text-sm mb-3"
        >
          {loading ? "Enviando..." : "Enviar enlace de recuperación"}
        </button>
      </form>
    </div>
  );
}

export default PasswordRecovery;
