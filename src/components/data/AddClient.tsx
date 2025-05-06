"use client";
import React, { useState } from "react";
import Link from "next/link";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../../firebase/Index";
// @ts-ignore
import { municipiosDepartamentos } from "../../constants/Departments";

const idTypes = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "NIT", label: "Número de identificación tributaria" },
];
const personTypes = [
  { value: "natural", label: "Persona natural" },
  { value: "juridica", label: "Persona jurídica" },
];
const taxResponsabilities = [
  { value: "noiva", label: "No responsable del IVA" },
  { value: "iva", label: "Responsable del IVA" },
];

interface AddClientProps {
  onRegistered?: () => void;
  initialData?: any;
  editMode?: boolean;
  onUpdate?: (data: any) => void;
  onCloseModal?: () => void;
}

export default function AddClient({ onRegistered, initialData, editMode, onUpdate, onCloseModal }: AddClientProps) {
  const [mode, setMode] = useState<"client" | "company">(initialData && initialData.mode ? initialData.mode : "client");
  const [form, setForm] = useState({
    fullName: initialData?.fullName || "",
    idType: initialData?.idType || "CC",
    idNumber: initialData?.idNumber || "",
    personType: initialData?.personType || "natural",
    taxResponsibility: initialData?.taxResponsibility || "noiva",
    city: initialData?.city || "",
    address: initialData?.address || "",
    postalCode: initialData?.postalCode || "",
    email: initialData?.email || "",
    celular: initialData?.celular || "",
  });
  const [search, setSearch] = useState(initialData ? initialData.city : "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredOptions = search.length === 0
    ? municipiosDepartamentos
    : municipiosDepartamentos.filter((item: { departamento: string; municipio: string }) =>
        (`${item.departamento} - ${item.municipio}`.toLowerCase().includes(search.toLowerCase()))
      );

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.client-dropdown')) {
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
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (
      (mode === "client" && (!form.fullName || !form.celular || !form.email)) ||
      (mode === "company" && (!form.fullName || !form.idNumber || !form.city || !form.address || !form.postalCode || !form.email || !form.celular))
    ) {
      setError("Por favor completa todos los campos obligatorios.");
      setLoading(false);
      return;
    }
    try {
      // Guardar el label (texto completo) de la responsabilidad tributaria en Firebase
      const taxLabel = taxResponsabilities.find(t => t.value === form.taxResponsibility)?.label || form.taxResponsibility;
      // Guardar el tipo de persona como label
      const personTypeLabel = personTypes.find(t => t.value === form.personType)?.label || form.personType;
      // Guardar el tipo de identificación como label
      const idTypeLabel = idTypes.find(t => t.value === form.idType)?.label || form.idType;
      // Guardar el municipio/departamento literal como aparece en el input de búsqueda
      const dataToSave = {
        ...form,
        taxResponsibility: taxLabel,
        personType: personTypeLabel,
        idType: idTypeLabel,
        city: search || form.city,
        mode,
        updatedAt: new Date(),
      };
      if (editMode && onUpdate) {
        await onUpdate(dataToSave);
        setSuccess("¡Actualización exitosa!");
        if (onCloseModal) onCloseModal();
      } else {
        const db = getFirestore(app);
        await addDoc(collection(db, "clients"), {
          ...dataToSave,
          createdAt: new Date(),
        });
        setSuccess("¡Registro exitoso!");
        setForm({
          fullName: "",
          idType: "CC",
          idNumber: "",
          personType: "natural",
          taxResponsibility: taxResponsabilities[0].value,
          city: "",
          address: "",
          postalCode: "",
          email: "",
          celular: "",
        });
        setSearch("");
        if (onRegistered) onRegistered();
      }
    } catch (err) {
      setError("Error al registrar. Intenta de nuevo.");
    }
    setLoading(false);
  };

  // Detectar si está en modal (editMode o onCloseModal presente)
  const isModal = !!onCloseModal || !!editMode;

  return (
    <div
      className={
        isModal
          ? "flex items-start justify-center w-full bg-transparent"
          : "flex items-start justify-center px-2 sm:px-4 min-h-screen w-full bg-green-100"
      }
      style={isModal ? { minHeight: 0, padding: 0, position: 'relative' } : { position: 'relative' }}
    >
      {/* Botón para cerrar el modal si está en modo modal */}
      {isModal && onCloseModal && (
        <button
          type="button"
          onClick={onCloseModal}
          className="absolute top-4 right-4 z-50 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition text-sm shadow-lg border border-green-600"
        >
          Cerrar
        </button>
      )}
      <form
        onSubmit={handleSubmit}
        className={
          isModal
            ? "bg-green-950 bg-opacity-90 p-8 sm:p-12 rounded-2xl shadow-2xl w-full max-w-4xl border border-green-500 flex flex-col items-center"
            : "bg-green-950 bg-opacity-80 p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-4xl border border-green-500 flex flex-col items-center mt-8"
        }
        style={isModal ? { marginTop: 0, maxWidth: '56rem', width: '100%' } : {}}
      >
                <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">
            {mode === "client" ? "Registrar cliente" : "Registrar empresa"}
        </h2>
        <div className="flex gap-6 mb-6 w-full justify-center">
          <label className="flex items-center gap-2 text-green-200">
            <input
              type="radio"
              name="mode"
              value="client"
              checked={mode === "client"}
              onChange={() => setMode("client")}
            />
            Agregar Cliente
          </label>
          <label className="flex items-center gap-2 text-green-200">
            <input
              type="radio"
              name="mode"
              value="company"
              checked={mode === "company"}
              onChange={() => setMode("company")}
            />
            Agregar Empresa
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Columna 1 */}
          <div className="flex flex-col gap-6">
            <div className="mb-0 w-full">
              <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="fullName">
                {mode === "company" ? "Razón social" : "Nombre completo"}
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
                autoComplete="off"
              />
            </div>
            <div className="mb-0 w-full">
              <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="idType">
                Tipo de identificación
              </label>
              <select
                id="idType"
                name="idType"
                value={form.idType}
                onChange={handleChange}
                className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
              >
                {idTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-0 w-full">
              <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="idNumber">
                Número de identificación
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={form.idNumber}
                onChange={handleChange}
                className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
                autoComplete="off"
              />
            </div>
            <div className="mb-0 w-full">
              <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="personType">
                Tipo de persona
              </label>
              <select
                id="personType"
                name="personType"
                value={form.personType}
                onChange={handleChange}
                className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
              >
                {personTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-0 w-full">
              <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="taxResponsibility">
                Responsabilidad tributaria
              </label>
              <select
                id="taxResponsibility"
                name="taxResponsibility"
                value={form.taxResponsibility}
                onChange={handleChange}
                className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
              >
                {taxResponsabilities.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Columna 2 */}
          <div className="flex flex-col gap-6">
            <div className="mb-0 w-full relative client-dropdown">
              <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="city">
                Departamento y municipio
              </label>
              <input
                type="text"
                placeholder="Buscar departamento o municipio"
                value={search}
                onChange={e => setSearch(e.target.value)}
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
                autoComplete="off"
              />
            </div>
            <div className="mb-0 w-full">
              <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="postalCode">
                Código postal
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
                autoComplete="off"
              />
            </div>
            <div className="mb-0 w-full">
              <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
                autoComplete="off"
              />
            </div>
            <div className="mb-0 w-full">
              <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="celular">
                Celular
              </label>
              <input
                type="text"
                id="celular"
                name="celular"
                value={form.celular}
                onChange={handleChange}
                className="w-full min-w-[320px] px-10 py-4 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
                autoComplete="off"
              />
            </div>
          </div>
        </div>
        {error && <div className="mb-4 text-red-400 text-center text-sm w-full">{error}</div>}
        {success && <div className="mb-4 text-green-400 text-center text-sm w-full">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-96 py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-sm sm:text-base  mt-6"
        >
          {loading
            ? editMode ? "Actualizando..." : "Registrando..."
            : editMode ? "Actualizar" : "Registrar"}
        </button>
      </form>
    </div>
  );
}
