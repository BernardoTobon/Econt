"use client";
import React, { useState, useRef } from "react";
// Importa la lógica de Firebase
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "../../firebase/Index";
import { useRouter } from "next/navigation";

function SignUp() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Validación de contraseña segura
  const isPasswordValid = (password: string) => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!form.email || !form.password || !form.confirmPassword) {
      setError("Por favor, completa todos los campos.");
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    if (!isPasswordValid(form.password)) {
      setError("La contraseña debe tener al menos 6 caracteres, una mayúscula y un caracter especial.");
      setLoading(false);
      return;
    }
    try {
      const auth = getAuth(app);
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Redirigir al login después de registro exitoso
      router.push("/login");
    } catch (err: any) {
      let message = "Error al registrar usuario.";
      if (err.code === "auth/email-already-in-use") {
        message = "El correo electrónico ya está registrado.";
      } else if (err.code === "auth/invalid-email") {
        message = "La dirección de correo no es válida.";
      } else if (err.code === "auth/weak-password") {
        message = "La contraseña es demasiado débil.";
      } else if (err.code === "auth/operation-not-allowed") {
        message = "El registro con correo electrónico está deshabilitado.";
      }
      setError(message);
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Aquí puedes redirigir o mostrar mensaje de éxito
    } catch (err: any) {
      setError(err.message || "Error al registrarse con Google");
    }
    setLoading(false);
  };

  const handlePasswordBlur = () => setPasswordTouched(true);
  const handleConfirmBlur = () => setConfirmTouched(true);

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
        <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">Crear Cuenta</h2>
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
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="password">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            onFocus={() => setPasswordTouched(true)}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="new-password"
          />
          {passwordTouched && (
            <div className={
              isPasswordValid(form.password)
                ? "text-green-400 text-xs mt-1"
                : "text-red-400 text-xs mt-1"
            }>
              {isPasswordValid(form.password)
                ? "La contraseña es segura."
                : "La contraseña debe tener al menos 6 caracteres, una mayúscula y un caracter especial."}
            </div>
          )}
        </div>
        <div className="mb-6 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="confirmPassword">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            onFocus={() => setConfirmTouched(true)}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="new-password"
          />
          {confirmTouched && form.confirmPassword && (
            <div className={
              form.password === form.confirmPassword
                ? "text-green-400 text-xs mt-1"
                : "text-red-400 text-xs mt-1"
            }>
              {form.password === form.confirmPassword
                ? "Las contraseñas coinciden."
                : "Las contraseñas no coinciden."}
            </div>
          )}
        </div>
        {error && <div className="mb-4 text-red-400 text-center text-sm w-full">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-1 sm:py-1.5 rounded-md bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-xs sm:text-sm mb-3"
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full py-1 sm:py-1.5 rounded-md bg-white text-green-900 font-bold border border-green-400 hover:bg-green-100 transition flex items-center justify-center gap-2 text-xs sm:text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.3-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 17.1 19.4 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.5 5.1 29.5 3 24 3 15.1 3 7.6 8.7 6.3 14.7z"/><path fill="#FBBC05" d="M24 44c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.7 35.7 27 36.5 24 36.5c-5.7 0-10.6-2.9-13.7-7.2l-7 5.4C7.6 39.3 15.1 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2.1l-7 5.4C15.5 42.9 19.4 44 24 44c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.3-4z"/></g></svg>
          Iniciar sesión con Google
        </button>
      </form>
    </div>
  );
};

export default SignUp;
