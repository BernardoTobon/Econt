"use client";
import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../../firebase/Index";

function AddEmployee({ onRegistered }: { onRegistered?: () => void }) {
  const [form, setForm] = useState({
    fullName: "",
    cedula: "",
    celular: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!form.fullName || !form.cedula || !form.celular || !form.email || !form.password) {
      setError("Por favor completa todos los campos.");
      setLoading(false);
      return;
    }
    try {
      // 1. Registrar en Firebase Auth primero para validar email único
      const { getAuth, createUserWithEmailAndPassword } = await import("firebase/auth");
      const auth = getAuth(app);
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      } catch (authError: any) {
        if (authError.code === "auth/email-already-in-use") {
          setError("El correo ya está registrado en el sistema.");
        } else {
          setError("Error creando acceso: " + authError.message);
        }
        setLoading(false);
        return;
      }

      // 2. Registrar en la colección employees
      const db = getFirestore(app);
      await addDoc(collection(db, "employees"), {
        fullName: form.fullName,
        cedula: form.cedula,
        celular: form.celular,
        email: form.email,
        uid: userCredential.user.uid,
        createdAt: new Date(),
      });
      setSuccess("¡Empleado registrado exitosamente!");
      setForm({ fullName: "", cedula: "", celular: "", email: "", password: "" });
      if (onRegistered) onRegistered();
    } catch (err) {
      setError("Error al registrar el empleado. Intenta de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-start justify-center px-2 sm:px-4 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-green-950 bg-opacity-80 p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-md border border-green-500 flex flex-col items-center mt-2"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center">
          Registrar empleado
        </h2>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="fullName">
            Nombre completo
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="cedula">
            Cédula
          </label>
          <input
            type="text"
            id="cedula"
            name="cedula"
            value={form.cedula}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="celular">
            Celular
          </label>
          <input
            type="text"
            id="celular"
            name="celular"
            value={form.celular}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
          />
        </div>
        <div className="mb-6 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
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
            autoComplete="new-password"
          />
        </div>
        {error && <div className="mb-4 text-red-400 text-center text-sm w-full">{error}</div>}
        {success && <div className="mb-4 text-green-400 text-center text-sm w-full">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-sm sm:text-base mb-3"
        >
          {loading ? "Registrando..." : "Registrar empleado"}
        </button>
      </form>
    </div>
  );
}

export default AddEmployee;
