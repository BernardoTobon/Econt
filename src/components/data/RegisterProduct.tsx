'use client';
import React, { useState } from "react";

interface ProductoForm {
  codigo: string;
  nombre: string;
  valorUnitarioCompra: string;
  valorUnitarioVenta: string;
  cantidad: string;
  stock: string;
}

interface RegisterProductProps {
  onCloseModal?: () => void;
  onProductRegistered?: (newProduct: any) => void;
}

import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { app } from "../../firebase/Index";
import { formatCurrencyCOP } from "../../utils/formatCurrency";

const RegisterProduct: React.FC<RegisterProductProps> = ({ onCloseModal, onProductRegistered }) => {
  const [form, setForm] = useState<ProductoForm>({
    codigo: "",
    nombre: "",
    valorUnitarioCompra: "",
    valorUnitarioVenta: "",
    cantidad: "",
    stock: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Verifica si ya existe un producto con el mismo código
  const codigoYaExiste = async (codigo: string) => {
    const db = getFirestore(app);
    const q = query(collection(db, "products"), where("codigo", "==", codigo));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!form.codigo || !form.nombre || !form.valorUnitarioCompra || !form.valorUnitarioVenta || !form.cantidad || !form.stock) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      if (await codigoYaExiste(form.codigo)) {
        setError("Ya existe un producto con ese código.");
        setLoading(false);
        return;
      }
      const db = getFirestore(app);
      const newProduct = {
        codigo: form.codigo,
        nombre: form.nombre,
        valorUnitarioCompra: Number(form.valorUnitarioCompra),
        valorUnitarioVenta: Number(form.valorUnitarioVenta),
        cantidad: Number(form.cantidad),
        stock: Number(form.stock),
        createdAt: new Date(),
      };
      await addDoc(collection(db, "products"), newProduct);
      setSuccess("¡Producto registrado exitosamente!");
      setForm({ codigo: "", nombre: "", valorUnitarioCompra: "", valorUnitarioVenta: "", cantidad: "", stock: "" });
      if (onProductRegistered) onProductRegistered(newProduct);
      if (onCloseModal) onCloseModal();
    } catch (err) {
      setError("Error al registrar el producto. Intenta de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100 px-2 sm:px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-green-950 bg-opacity-80 p-8 sm:p-12 rounded-2xl shadow-2xl w-full max-w-md border border-green-500 flex flex-col items-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">
          Registrar Producto
        </h2>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="codigo">
            Código
          </label>
          <input
            type="text"
            id="codigo"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="nombre">
            Nombre del producto
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="valorUnitario">
            Valor unitario compra
          </label>
          <input
            type="text"
            id="valorUnitario"
            name="valorUnitario"
            inputMode="numeric"
            value={formatCurrencyCOP(form.valorUnitarioCompra)}
            onChange={e => {
              // Solo números, sin decimales
              const raw = e.target.value.replace(/[^\d]/g, "");
              setForm({ ...form, valorUnitarioCompra: raw });
            }}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
            min="0"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="valorUnitario">
            Valor unitario venta
          </label>
          <input
            type="text"
            id="valorUnitario"
            name="valorUnitario"
            inputMode="numeric"
            value={formatCurrencyCOP(form.valorUnitarioVenta)}
            onChange={e => {
              // Solo números, sin decimales
              const raw = e.target.value.replace(/[^\d]/g, "");
              setForm({ ...form, valorUnitarioVenta: raw });
            }}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
            min="0"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="cantidad">
            Cantidad
          </label>
          <input
            type="text"
            id="cantidad"
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
            min="0"
          />
        </div>
        <div className="mb-6 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="stock">
            Stock
          </label>
          <input
            type="text"
            id="stock"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
            min="0"
          />
        </div>
        {error && <div className="mb-4 text-red-400 text-center text-sm w-full">{error}</div>}
        {success && <div className="mb-4 text-green-400 text-center text-sm w-full">{success}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-base mt-2"
        >
          Registrar
        </button>
      </form>
    </div>
  );
};

export default RegisterProduct;
