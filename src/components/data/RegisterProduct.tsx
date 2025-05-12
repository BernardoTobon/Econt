'use client';
import React, { useState, useEffect } from "react";

interface ProductoForm {
  codigo: string;
  nombre: string;
  valorUnitarioCompra: string;
  valorUnitarioVenta: string;
  valorTotalCompra: string;
  bodega: string;
  cantidad: string;
  stock: string;
}

interface RegisterProductProps {
  onCloseModal?: () => void;
  onProductRegistered?: (newProduct: any) => void;
}

import { getFirestore, collection, addDoc, query, where, getDocs, doc } from "firebase/firestore";
import { app } from "../../firebase/Index";
import { formatCurrencyCOP } from "../../utils/formatCurrency";

const RegisterProduct: React.FC<RegisterProductProps> = ({ onCloseModal, onProductRegistered }) => {
  const [form, setForm] = useState<ProductoForm>({
    codigo: "",
    nombre: "",
    valorUnitarioCompra: "",
    valorUnitarioVenta: "",
    valorTotalCompra: "",
    bodega: "",
    cantidad: "",
    stock: "",
  });
  
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [cellars, setCellars] = useState<any[]>([]);
  const [searchCellar, setSearchCellar] = useState("");
  const [filteredCellars, setFilteredCellars] = useState<any[]>([]);
  const [showCellarDropdown, setShowCellarDropdown] = useState(false);

  const [bodegasSeleccionadas, setBodegasSeleccionadas] = useState<{ bodega: string; cantidad: string }[]>([]);

  const handleCantidadBodegaChange = (index: number, cantidad: string) => {
    setBodegasSeleccionadas((prev) =>
      prev.map((bodega, i) =>
        i === index ? { ...bodega, cantidad } : bodega
      )
    );
  };

  const agregarBodegaDesdeDropdown = (cellar: any, cantidad: string) => {
    if (!bodegasSeleccionadas.some((b) => b.bodega === cellar.cellarName)) {
      setBodegasSeleccionadas((prev) => [
        ...prev,
        { bodega: cellar.cellarName, cantidad: cantidad || "0" },
      ]);
    } else {
      setBodegasSeleccionadas((prev) =>
        prev.map((b) =>
          b.bodega === cellar.cellarName ? { ...b, cantidad } : b
        )
      );
    }
  };

  useEffect(() => {
    const fetchCellars = async () => {
      const db = getFirestore(app);
      const querySnapshot = await getDocs(collection(db, "cellars"));
      const cellarsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCellars(cellarsData);
    };

    fetchCellars();
  }, []);

  useEffect(() => {
    if (searchCellar.length === 0) {
      setFilteredCellars(cellars.slice(-3)); // Mostrar solo los últimos 3 registros
    } else {
      setFilteredCellars(
        cellars.filter((cellar) =>
          cellar.cellarName.toLowerCase().includes(searchCellar.toLowerCase())
        ).slice(-3) // Filtrar y limitar a los últimos 3
      );
    }
  }, [searchCellar, cellars]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#bodega-dropdown") && showCellarDropdown) {
        setShowCellarDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showCellarDropdown]);

  const handleCellarSelect = (cellar: any) => {
    setForm({ ...form, bodega: cellar.cellarName });
    setSearchCellar(cellar.cellarName);
    setShowCellarDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTotalCompraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const raw = e.target.value.replace(/[^\d]/g, "");
  const cantidad = parseFloat(form.cantidad);
  const totalCompra = parseFloat(raw);
  const unitario = cantidad > 0 ? (totalCompra / cantidad).toFixed(0) : "0";

  setForm({
    ...form,
    valorTotalCompra: raw,
    valorUnitarioCompra: unitario,
  });
};


 const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const rawCantidad = e.target.value.replace(/[^\d]/g, "");
  const cantidad = parseFloat(rawCantidad);
  const totalCompra = parseFloat(form.valorTotalCompra);
  const unitario = cantidad > 0 ? (totalCompra / cantidad).toFixed(0) : "0";

  setForm({
    ...form,
    cantidad: rawCantidad,
    valorUnitarioCompra: unitario,
  });
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
    if (!form.codigo || !form.nombre || !form.valorUnitarioCompra || !form.valorUnitarioVenta || !form.valorTotalCompra || !form.cantidad || !form.stock) {
      setError("Por favor completa todos los campos obligatorios.");
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
      const productRef = await addDoc(collection(db, "products"), {
        codigo: form.codigo,
        nombre: form.nombre,
        valorUnitarioCompra: Number(form.valorUnitarioCompra),
        valorUnitarioVenta: Number(form.valorUnitarioVenta),
        valorTotalCompra: Number(form.valorTotalCompra),
        stock: Number(form.stock), // Aseguramos que el stock se registre
        createdAt: new Date(),
      });

      if (bodegasSeleccionadas.length === 0) {
        bodegasSeleccionadas.push({ bodega: form.bodega || "Bodega", cantidad: form.cantidad || "0" });
      } else if (bodegasSeleccionadas.length === 1 && !form.bodega) {
        bodegasSeleccionadas[0].bodega = bodegasSeleccionadas[0].bodega || "Bodega";
      }

      // Guardar las bodegas en la subcolección productLoc dentro de la colección cellars
      for (const bodega of bodegasSeleccionadas) {
        const cellarQuery = query(collection(db, "cellars"), where("cellarName", "==", bodega.bodega));
        const cellarSnapshot = await getDocs(cellarQuery);

        if (!cellarSnapshot.empty) {
          const cellarDoc = cellarSnapshot.docs[0]; // Obtener el primer documento que coincida
          const productLocCollectionRef = collection(cellarDoc.ref, "productLoc");
          await addDoc(productLocCollectionRef, {
            codigoProducto: form.codigo,
            nombreProducto: form.nombre,
            cantidad: Number(bodega.cantidad),
          });
        } else {
          console.error(`No se encontró la bodega con el nombre: ${bodega.bodega}`);
        }
      }

      setSuccess("¡Producto registrado exitosamente!");
      setForm({ codigo: "", nombre: "", valorUnitarioCompra: "", valorUnitarioVenta: "", valorTotalCompra: "", bodega: "", cantidad: "", stock: "" });
      setBodegasSeleccionadas([]); // Limpiar bodegas seleccionadas
      if (onProductRegistered) onProductRegistered({ id: productRef.id, ...form });
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
        className="bg-green-950 bg-opacity-80 p-8 sm:p-12 rounded-2xl shadow-xl w-full max-w-4xl border border-green-500 flex flex-col items-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center tracking-widest">
          Registrar Producto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="valorTotalCompra">
            Valor total compra
          </label>
          <input
            type="text"
            id="valorTotalCompra"
            name="valorTotalCompra"
            inputMode="numeric"
            value={formatCurrencyCOP(form.valorTotalCompra)}
            onChange={handleTotalCompraChange}
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
            onChange={handleCantidadChange}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
            min="0"
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
        <div className="mb-4 w-full relative" id="bodega-dropdown">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="bodega">
            Bodega
          </label>
          <input
            type="text"
            id="bodega"
            name="bodega"
            value={searchCellar}
            onChange={(e) => {
              setSearchCellar(e.target.value);
              setShowCellarDropdown(true);
            }}
            onFocus={() => setShowCellarDropdown(true)}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
          />
          {showCellarDropdown && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full max-h-40 overflow-y-auto">
              {filteredCellars.map((cellar, index) => (
                <li
                    key={`cellar-${cellar.id}-${index}`}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  >
                    <span>{cellar.cellarName}</span>
                    <input
                      type="number"
                      placeholder="Cantidad"
                      className="ml-2 w-20 px-2 py-1 border rounded"
                      value={bodegasSeleccionadas.find((b) => b.bodega === cellar.cellarName)?.cantidad || ""}
                      onChange={(e) => {
                        const cantidad = e.target.value;
                        agregarBodegaDesdeDropdown(cellar, cantidad);
                      }}
                    />
                  </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-4 w-full">
          <h3 className="text-green-400 mb-2 text-base sm:text-lg">Bodegas Seleccionadas</h3>
          <ul className="list-disc pl-5">
            {bodegasSeleccionadas.map((bodega, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-white">{bodega.bodega} - Cantidad: {bodega.cantidad}</span>
                <button
                  type="button"
                  onClick={() => setBodegasSeleccionadas((prev) => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
        {error && <div className="mb-4 text-red-400 text-center text-sm w-full">{error}</div>}
        {success && <div className="mb-4 text-green-400 text-center text-sm w-full">{success}</div>}
        </div>
        <button
          type="submit"
          className="w-64 py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-base mt-2"
        >
          Registrar
        </button>
      </form>
    </div>
  );
};

export default RegisterProduct;
