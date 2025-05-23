'use client';
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "../../firebase/Index";
import { useRouter } from "next/navigation";

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!form.email || !form.password) {
      setError('Por favor, completa todos los campos.');
      setLoading(false);
      return;
    }
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, form.email, form.password);
      console.log("Login exitoso, redirigiendo...");
      router.push("/dashboard");
    } catch (err: any) {
      let message = "Error al iniciar sesión.";
      if (err.code === "auth/user-not-found") {
        message = "El usuario no está registrado.";
      } else if (err.code === "auth/wrong-password") {
        message = "La contraseña es incorrecta.";
      } else if (err.code === "auth/invalid-email") {
        message = "La dirección de correo no es válida.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Demasiados intentos fallidos. Intenta más tarde.";
      }
      setError(message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log("Login con Google exitoso, redirigiendo...");
      router.push("/dashboard");
    } catch (err: any) {
      let message = "Error al iniciar sesión con Google.";
      if (err.code === "auth/popup-closed-by-user") {
        message = "La ventana de Google fue cerrada antes de completar el inicio de sesión.";
      } else if (err.code === "auth/cancelled-popup-request") {
        message = "Se canceló el inicio de sesión con Google.";
      }
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-400 px-2 sm:px-4">
      <div className="flex justify-center mb-6">
        <div className="bg-green-900 rounded-full p-4 flex items-center justify-center">
          <img
            src="/E-cont 1.png"
            alt="Logo E-cont"
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain drop-shadow-lg transition-all duration-300"
          />
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-green-950 bg-opacity-80 p-4 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-green-500 flex flex-col items-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">Iniciar Sesión</h2>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="email">
            Correo electrónico
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="username"
          />
        </div>
        <div className="mb-6 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="password">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="current-password"
          />
        </div>
        {error && <div className="mb-4 text-red-400 text-center text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-1 sm:py-1.5 rounded-md bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-xs sm:text-sm mb-3"
        >
          {loading ? 'Accediendo...' : 'Acceder'}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-1 sm:py-1.5 rounded-md bg-white text-green-900 font-bold border border-green-400 hover:bg-green-100 transition flex items-center justify-center gap-2 text-xs sm:text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.3-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 17.1 19.4 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.5 5.1 29.5 3 24 3 15.1 3 7.6 8.7 6.3 14.7z"/><path fill="#FBBC05" d="M24 44c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.7 35.7 27 36.5 24 36.5c-5.7 0-10.6-2.9-13.7-7.2l-7 5.4C7.6 39.3 15.1 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2.1l-7 5.4C15.5 42.9 19.4 44 24 44c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.3-4z"/></g></svg>
          Iniciar sesión con Google
        </button>
        <div className="w-full flex justify-end mt-2">
          <a href="/recovery" className="text-green-300 text-xs hover:underline">¿Olvidaste tu contraseña?</a>
        </div>
        <div className="w-full flex justify-center mt-4">
          <span className="text-green-200 text-xs">¿No tienes cuenta? </span>
          <a href="/signup" className="text-green-300 text-xs hover:underline ml-1">Regístrate aquí</a>
        </div>
      </form>
    </div>
  );
};

export default Login;