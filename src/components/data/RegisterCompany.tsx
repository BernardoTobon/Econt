"use client";

import React, { useState } from "react";
import { municipiosDepartamentos } from "../../constants/Departments";
import { db } from "../../firebase/Index";
import { collection, addDoc } from "firebase/firestore";

const RegisterCompany: React.FC = () => {
  const [form, setForm] = useState({
    companyName: "",
    nit: "",
    address: "",
    city: "",
    email: "",
    phone: "",
  });
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = search.length === 0
    ? municipiosDepartamentos
    : municipiosDepartamentos.filter((item: { departamento: string; municipio: string }) =>
        (`${item.departamento} - ${item.municipio}`.toLowerCase().includes(search.toLowerCase()))
      );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "company"), form);
      alert("Compañía registrada exitosamente");
      setForm({
        companyName: "",
        nit: "",
        address: "",
        city: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error al registrar la compañía: ", error);
      alert("Hubo un error al registrar la compañía");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100 px-2 sm:px-4">
        <form onSubmit={handleSubmit} className="bg-green-950 bg-opacity-90 p-8 sm:p-12 rounded-2xl shadow-2xl w-full max-w-4xl border border-green-500 flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">
        Registrar Compañía
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="mb-0 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="companyName">
            Nombre de la Compañía
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
          />
        </div>

        <div className="mb-0 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="nit">
            NIT
          </label>
          <input
            type="text"
            id="nit"
            name="nit"
            value={form.nit}
            onChange={handleChange}
            className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
          />
        </div>

        <div className="mb-0 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="address">
            Dirección
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
          />
        </div>

        <div className="mb-0 w-full relative client-dropdown">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="city">
            Departamento y Municipio
          </label>
          <input
            type="text"
            placeholder="Buscar departamento o municipio"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
            autoComplete="off"
          />
          {showDropdown && (
            <ul className="absolute z-10 w-full max-h-56 overflow-y-auto bg-white border border-green-400 rounded-xl mt-1 shadow-lg">
              {filteredOptions.length === 0 && (
                <li className="px-5 py-2 text-green-800">Sin resultados</li>
              )}
              {filteredOptions.map((item: { departamento: string; municipio: string }) => (
                <li
                  key={item.departamento + "-" + item.municipio}
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

        <div className="mb-0 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
          />
        </div>

        <div className="mb-0 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="phone">
            Teléfono
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-96 py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-sm sm:text-base mt-6"
      >
        Registrar
      </button>
    </form>
    </div>
  );
};

export default RegisterCompany;
