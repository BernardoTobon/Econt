'use client';
import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../../firebase/Index";

const accountTypes = [
  { value: "savings", label: "Ahorros" },
  { value: "checking", label: "Corriente" },
  { value: "cash", label: "Caja" },
];

function RegisterAccount({ onRegistered }: { onRegistered?: () => void }) {
  const [form, setForm] = useState({
    accountName: "",
    accountType: "",
    accountNumber: "",
    initialAmount: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Formatea el valor a $X.XXX
  const formatCurrency = (value: string) => {
    // Elimina todo lo que no sea número
    const numeric = value.replace(/[^\d]/g, "");
    if (!numeric) return "";
    // Formatea con separador de miles y antepone $
    return "$" + parseInt(numeric, 10).toLocaleString("es-ES");
  };

  const handleInitialAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatCurrency(rawValue);
    setForm({
      ...form,
      initialAmount: formatted,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!form.accountName || !form.accountType || !form.accountNumber || !form.initialAmount) {
      setError("Por favor completa todos los campos.");
      setLoading(false);
      return;
    }
    // Remueve formato para validar correctamente
    const numericAmount = Number(form.initialAmount.replace(/[^\d]/g, ""));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("El monto inicial debe ser un número positivo.");
      setLoading(false);
      return;
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "account"), {
        accountName: form.accountName,
        accountType: form.accountType,
        accountNumber: form.accountNumber,
        initialAmount: numericAmount,
        createdAt: new Date(),
      });
      setSuccess("¡Cuenta registrada exitosamente!");
      setForm({ accountName: "", accountType: "", accountNumber: "", initialAmount: "" });
      if (onRegistered) onRegistered();
    } catch (err) {
      setError("Error al registrar la cuenta. Intenta de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-start justify-center px-2 sm:px-4 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-green-950 bg-opacity-80 p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-md border border-green-500 flex flex-col items-center mt-8"
        style={{ marginLeft: '2rem' }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">Registrar cuenta</h2>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="accountName">
            Nombre de la cuenta
          </label>
          <input
            type="text"
            id="accountName"
            name="accountName"
            value={form.accountName}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="accountType">
            Tipo de cuenta
          </label>
          <select
            id="accountType"
            name="accountType"
            value={form.accountType}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
          >
            <option value="">Selecciona tipo</option>
            {accountTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="accountNumber">
            Número de cuenta
          </label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
          />
        </div>
        <div className="mb-6 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="initialAmount">
            Monto inicial
          </label>
          <input
            type="text"
            id="initialAmount"
            name="initialAmount"
            value={form.initialAmount}
            onChange={handleInitialAmountChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            min="0"
            autoComplete="off"
          />
        </div>
        {error && <div className="mb-4 text-red-400 text-center text-sm w-full">{error}</div>}
        {success && <div className="mb-4 text-green-400 text-center text-sm w-full">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-sm sm:text-base mb-3"
        >
          {loading ? "Registrando..." : "Registrar cuenta"}
        </button>
      </form>
    </div>
  );
}

export default RegisterAccount;
