"use client";
import React, { useState } from "react";
import { municipiosDepartamentos } from "../../constants/Departments";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../../firebase/Index";

function Cellar({ onRegistered }: { onRegistered: () => void }) {
  const [form, setForm] = useState({
    cellarName: "",
    department: "",
    city: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Filtrar municipiosDepartamentos según búsqueda
  const filteredOptions = search.length === 0
    ? municipiosDepartamentos
    : municipiosDepartamentos.filter(item =>
        (`${item.departamento} - ${item.municipio}`.toLowerCase().includes(search.toLowerCase()))
      );

  // Cerrar dropdown al hacer click fuera
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.cellar-dropdown')) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
      ...(e.target.name === "department" ? { city: "" } : {}),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!form.cellarName || !form.city || !form.address) {
      setError("Por favor completa todos los campos.");
      setLoading(false);
      return;
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "cellars"), {
        cellarName: form.cellarName,
        city: form.city,
        address: form.address,
        createdAt: new Date(),
      });
      setSuccess("¡Bodega registrada exitosamente!");
      setForm({ cellarName: "", department: "", city: "", address: "" });
      if (onRegistered) onRegistered();
    } catch (err) {
      setError("Error al registrar la bodega. Intenta de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-start justify-center px-2 sm:px-4 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-green-950 bg-opacity-80 p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-md border border-green-500 flex flex-col items-center mt-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">Registrar bodega</h2>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="cellarName">
            Nombre de la bodega
          </label>
          <input
            type="text"
            id="cellarName"
            name="cellarName"
            value={form.cellarName}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
            autoComplete="off"
          />
        </div>
        <div className="mb-4 w-full relative cellar-dropdown">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="city">
            Departamento y municipio
          </label>
          <input
            type="text"
            placeholder="Buscar departamento o municipio"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
            autoComplete="off"
          />
          {showDropdown && (
            <ul className="absolute z-10 w-full max-h-56 overflow-y-auto bg-white border border-green-400 rounded-xl mt-1 shadow-lg">
              {filteredOptions.length === 0 && (
                <li className="px-5 py-2 text-green-800">Sin resultados</li>
              )}
              {filteredOptions.map((item) => (
                <li
                  key={item.departamento + '-' + item.municipio}
                  className="px-5 py-2 cursor-pointer hover:bg-green-100 text-green-800"
                  onMouseDown={() => {
                    setForm({ ...form, city: item.municipio });
                    setSearch(`${item.departamento} - ${item.municipio}`);
                    setShowDropdown(false);
                  }}
                >
                  {item.departamento} - {item.municipio}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-6 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="address">
            Dirección
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
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
          {loading ? "Registrando..." : "Registrar bodega"}
        </button>
      </form>
    </div>
  );
}

export default Cellar;
