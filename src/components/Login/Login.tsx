'use client';
import React, { useState } from 'react';
// Importa la función de autenticación de Firebase si ya la tienes configurada
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../../firebase';

export const Login = () => {
  const [form, setForm] = useState({
    usuario: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!form.usuario || !form.password) {
      setError('Por favor, completa todos los campos.');
      setLoading(false);
      return;
    }
    // Aquí iría la lógica de autenticación con Firebase
    // try {
    //   await signInWithEmailAndPassword(auth, form.usuario, form.password);
    // } catch (err) {
    //   setError('Usuario o contraseña incorrectos.');
    // }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-400 px-2 sm:px-4">
      <img
        src="/E-cont 1.png"
        alt="Logo E-cont"
        className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 mb-6 object-contain drop-shadow-lg transition-all duration-300"
      />
      <form
        onSubmit={handleSubmit}
        className="bg-green-950 bg-opacity-80 p-4 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-green-500 flex flex-col items-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">Iniciar Sesión</h2>
        <div className="mb-4">
          <label className="block text-green-400 mb-2 text-sm sm:text-base" htmlFor="usuario">
            Usuario
          </label>
          <input
            type="text"
            id="usuario"
            name="usuario"
            value={form.usuario}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-sm sm:text-base"
            autoComplete="username"
          />
        </div>
        <div className="mb-6">
          <label className="block text-green-400 mb-2 text-sm sm:text-base" htmlFor="password">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-sm sm:text-base"
            autoComplete="current-password"
          />
        </div>
        {error && <div className="mb-4 text-red-400 text-center text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? 'Accediendo...' : 'Acceder'}
        </button>
      </form>
    </div>
  );
};

