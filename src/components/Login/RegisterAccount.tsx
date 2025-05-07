"use client";
import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../../firebase/Index";

const accountTypes = [
  { value: "bank", label: "Bank" },
  { value: "cash", label: "Cash" },
];

function RegisterAccount() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!form.accountName || !form.accountType || !form.accountNumber || !form.initialAmount) {
      setError("Please complete all fields.");
      setLoading(false);
      return;
    }
    if (isNaN(Number(form.initialAmount)) || Number(form.initialAmount) < 0) {
      setError("Initial amount must be a positive number.");
      setLoading(false);
      return;
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "account"), {
        accountName: form.accountName,
        accountType: form.accountType,
        accountNumber: form.accountNumber,
        initialAmount: Number(form.initialAmount),
        createdAt: new Date(),
      });
      setSuccess("Account registered successfully!");
      setForm({ accountName: "", accountType: "", accountNumber: "", initialAmount: "" });
    } catch (err) {
      setError("Error registering account. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-400 px-2 sm:px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-green-950 bg-opacity-80 p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-md border border-green-500 flex flex-col items-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">Register Account</h2>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="accountName">
            Account Name
          </label>
          <input
            type="text"
            id="accountName"
            name="accountName"
            value={form.accountName}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
            autoComplete="off"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="accountType">
            Account Type
          </label>
          <select
            id="accountType"
            name="accountType"
            value={form.accountType}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
          >
            <option value="">Select type</option>
            {accountTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="accountNumber">
            Account Number
          </label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
            autoComplete="off"
          />
        </div>
        <div className="mb-6 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="initialAmount">
            Initial Amount
          </label>
          <input
            type="number"
            id="initialAmount"
            name="initialAmount"
            value={form.initialAmount}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
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
          {loading ? "Registering..." : "Register Account"}
        </button>
      </form>
    </div>
  );
}

export default RegisterAccount;
