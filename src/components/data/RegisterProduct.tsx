'use client';
import React, { useState, useEffect } from "react";

interface ProductForm {
  codigo: string;
  nombre: string;
  valorUnitarioCompra: string;
  valorUnitarioVenta: string;
  valorTotalCompra: string;
  bodega: string;
  cantidad: string;
  gramaje: string;
  gramajePorUnidad: string;
  stock: string;
  codigoBarras: string;
}

interface RegisterProductProps {
  onCloseModal?: () => void;
  onProductRegistered?: (newProduct: any) => void;
}

import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { app } from "../../firebase/Index";
import { formatCurrencyCOP } from "../../utils/formatCurrency";
import { generateUniqueBarcodeValue } from "../barcode/utils/barcodeUtils";
import BarcodeGenerator from "../barcode/BarcodeGenerator";
import * as XLSX from 'xlsx';

const RegisterProduct: React.FC<RegisterProductProps> = ({ onCloseModal, onProductRegistered }) => {  const [form, setForm] = useState<ProductForm>({
    codigo: "",
    nombre: "",
    valorUnitarioCompra: "",
    valorUnitarioVenta: "",
    valorTotalCompra: "",
    bodega: "",
    cantidad: "",
    gramaje: "",
    gramajePorUnidad: "",
    stock: "",
    codigoBarras: "",
  });
    const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

  const [cellars, setCellars] = useState<any[]>([]);
  const [searchCellar, setSearchCellar] = useState("");
  const [filteredCellars, setFilteredCellars] = useState<any[]>([]);
  const [showCellarDropdown, setShowCellarDropdown] = useState(false);  const [selectedWarehouses, setSelectedWarehouses] = useState<{ warehouse: string; quantity: string }[]>([]);
  // Estados para importación masiva
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importWarehouseSelections, setImportWarehouseSelections] = useState<{[productCode: string]: {warehouse: string; quantity: string}[]}>({});

  const addWarehouseFromDropdown = (cellar: any, quantity: string) => {
    if (!selectedWarehouses.some((w) => w.warehouse === cellar.cellarName)) {
      setSelectedWarehouses((prev) => [
        ...prev,
        { warehouse: cellar.cellarName, quantity: quantity || "0" },
      ]);
    } else {
      setSelectedWarehouses((prev) =>
        prev.map((w) =>
          w.warehouse === cellar.cellarName ? { ...w, quantity } : w
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
    };  }, [showCellarDropdown]);

  const calculateGramajePorUnidad = (gramaje: string, cantidad: string): string => {
    const gramajeNum = parseFloat(gramaje);
    const cantidadNum = parseFloat(cantidad);
    
    if (gramajeNum > 0 && cantidadNum > 0) {
      return (gramajeNum / cantidadNum).toFixed(2);
    }
    return "";
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Actualizar el campo correspondiente
    const updatedForm = { ...form, [name]: value };
    
    // Si se está cambiando gramaje o cantidad, recalcular gramaje por unidad
    if (name === 'gramaje' || name === 'cantidad') {
      const gramajePorUnidad = calculateGramajePorUnidad(
        name === 'gramaje' ? value : form.gramaje,
        name === 'cantidad' ? value : form.cantidad
      );
      updatedForm.gramajePorUnidad = gramajePorUnidad;
    }
    
    setForm(updatedForm);
    
    // Si se está cambiando el código del producto, generar nuevo código de barras
    if (name === 'codigo' && value.trim()) {
      generateBarcodeForProduct(value.trim());
    } else if (name === 'codigo' && !value.trim()) {
      // Si se borra el código, limpiar también el código de barras
      setForm(prev => ({ ...prev, codigoBarras: "" }));
    }
  };

  const generateBarcodeForProduct = async (productCode: string) => {
    if (!productCode) return;
    
    setGeneratingBarcode(true);
    try {
      const barcodeValue = await generateUniqueBarcodeValue(productCode);
      setForm(prev => ({ ...prev, codigoBarras: barcodeValue }));
    } catch (error) {
      console.error("Error generando código de barras:", error);
      setError("Error al generar el código de barras");
    } finally {
      setGeneratingBarcode(false);
    }
  };
  const handlePurchaseTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

 const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const rawCantidad = e.target.value.replace(/[^\d]/g, "");
  const cantidad = parseFloat(rawCantidad);
  const totalCompra = parseFloat(form.valorTotalCompra);
  const unitario = cantidad > 0 ? (totalCompra / cantidad).toFixed(0) : "0";

  // Calcular gramaje por unidad
  const gramajePorUnidad = calculateGramajePorUnidad(form.gramaje, rawCantidad);

  setForm({
    ...form,
    cantidad: rawCantidad,
    valorUnitarioCompra: unitario,
    gramajePorUnidad: gramajePorUnidad,
  });
};

  // Verifica si ya existe un producto con el mismo código
  const codeAlreadyExists = async (codigo: string) => {
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
      if (await codeAlreadyExists(form.codigo)) {
        setError("Ya existe un producto con ese código.");
        setLoading(false);
        return;
      }
      const db = getFirestore(app);      const productRef = await addDoc(collection(db, "products"), {
        codigo: form.codigo,
        nombre: form.nombre,
        valorUnitarioCompra: Number(form.valorUnitarioCompra),
        valorUnitarioVenta: Number(form.valorUnitarioVenta),
        valorTotalCompra: Number(form.valorTotalCompra),
        stock: Number(form.stock), // Aseguramos que el stock se registre
        codigoBarras: form.codigoBarras, // Guardamos el código de barras
        gramaje: form.gramaje,
        gramajePorUnidad: Number(form.gramajePorUnidad), // Guardamos gramaje por unidad
        createdAt: new Date(),
      });if (selectedWarehouses.length === 0) {
        selectedWarehouses.push({ warehouse: form.bodega || "Bodega", quantity: form.cantidad || "0" });
      } else if (selectedWarehouses.length === 1 && !form.bodega) {
        selectedWarehouses[0].warehouse = selectedWarehouses[0].warehouse || "Bodega";
      }

      // Guardar las bodegas en la subcolección productLoc dentro de la colección cellars
      for (const warehouse of selectedWarehouses) {
        const cellarQuery = query(collection(db, "cellars"), where("cellarName", "==", warehouse.warehouse));
        const cellarSnapshot = await getDocs(cellarQuery);

        if (!cellarSnapshot.empty) {
          const cellarDoc = cellarSnapshot.docs[0]; // Obtener el primer documento que coincida
          const productLocCollectionRef = collection(cellarDoc.ref, "productLoc");
          await addDoc(productLocCollectionRef, {
            codigoProducto: form.codigo,
            nombreProducto: form.nombre,
            cantidad: Number(warehouse.quantity),
          });
        } else {
          console.error(`No se encontró la bodega con el nombre: ${warehouse.warehouse}`);
        }
      }      setSuccess("¡Producto registrado exitosamente!");
      setForm({ codigo: "", nombre: "", valorUnitarioCompra: "", valorUnitarioVenta: "", valorTotalCompra: "", bodega: "", cantidad: "", gramaje: "", gramajePorUnidad: "", stock: "", codigoBarras: "" });
      setSelectedWarehouses([]); // Limpiar bodegas seleccionadas
      if (onProductRegistered) onProductRegistered({ id: productRef.id, ...form });
      if (onCloseModal) onCloseModal();
    } catch (err) {
      setError("Error al registrar el producto. Intenta de nuevo.");
    }
    setLoading(false);
  };

  // Función para manejar la selección de archivo Excel
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      processExcelFile(file);
    }
  };

  // Función para procesar el archivo Excel
  const processExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validar estructura del archivo
        const validatedData = validateExcelData(jsonData);
        if (validatedData.length > 0) {
          setImportData(validatedData);
          setShowImportModal(true);
        }
      } catch (error) {
        console.error("Error procesando archivo Excel:", error);
        setError("Error al procesar el archivo Excel. Verifica el formato.");
      }
    };
    reader.readAsArrayBuffer(file);
  };
  // Función para validar los datos del Excel
  const validateExcelData = (data: any[]): any[] => {
    const validData: any[] = [];
    const errors: string[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 porque empezamos en fila 2 (considerando encabezados)
      
      // Validar campos obligatorios (removemos Bodega de los obligatorios)
      const requiredFields = ['Código', 'Nombre', 'Valor Total Compra', 'Cantidad', 'Valor Unitario Venta', 'Stock'];
      const missingFields = requiredFields.filter(field => !row[field]);
      
      if (missingFields.length > 0) {
        errors.push(`Fila ${rowNumber}: Faltan campos obligatorios: ${missingFields.join(', ')}`);
        return;
      }

      // Calcular valores automáticos
      const cantidad = parseFloat(row['Cantidad']) || 0;
      const valorTotalCompra = parseFloat(row['Valor Total Compra']) || 0;
      const gramaje = parseFloat(row['Gramaje Total']) || 0;
      
      const valorUnitarioCompra = cantidad > 0 ? (valorTotalCompra / cantidad).toFixed(0) : "0";
      const gramajePorUnidad = cantidad > 0 && gramaje > 0 ? (gramaje / cantidad).toFixed(2) : "";

      validData.push({
        codigo: row['Código']?.toString().trim(),
        nombre: row['Nombre']?.toString().trim(),
        valorTotalCompra: valorTotalCompra.toString(),
        cantidad: cantidad.toString(),
        valorUnitarioCompra,
        valorUnitarioVenta: (parseFloat(row['Valor Unitario Venta']) || 0).toString(),
        stock: (parseFloat(row['Stock']) || 0).toString(),
        gramaje: gramaje.toString(),
        gramajePorUnidad,
        codigoBarras: "", // Se generará automáticamente
      });
    });

    if (errors.length > 0) {
      setImportErrors(errors);
      setError(`Se encontraron errores en ${errors.length} filas. Revisa el archivo.`);
    }

    return validData;
  };

  // Función para agregar bodega a un producto en la importación
  const addWarehouseToImportProduct = (productCode: string) => {
    setImportWarehouseSelections(prev => ({
      ...prev,
      [productCode]: [
        ...(prev[productCode] || []),
        { warehouse: '', quantity: '' }
      ]
    }));
  };

  // Función para actualizar bodega/cantidad en importación
  const updateImportWarehouse = (productCode: string, index: number, field: 'warehouse' | 'quantity', value: string) => {
    setImportWarehouseSelections(prev => ({
      ...prev,
      [productCode]: (prev[productCode] || []).map((wh, i) => 
        i === index ? { ...wh, [field]: value } : wh
      )
    }));
  };

  // Función para eliminar bodega de un producto en importación
  const removeWarehouseFromImportProduct = (productCode: string, index: number) => {
    setImportWarehouseSelections(prev => ({
      ...prev,
      [productCode]: (prev[productCode] || []).filter((_, i) => i !== index)
    }));
  };
  // Función para procesar importación masiva
  const processMassiveImport = async () => {
    setIsImporting(true);
    setImportProgress(0);
    const errors: string[] = [];
    const db = getFirestore(app);

    for (let i = 0; i < importData.length; i++) {
      const product = importData[i];
      const productWarehouses = importWarehouseSelections[product.codigo] || [];
      
      try {
        // Verificar si ya existe el código
        if (await codeAlreadyExists(product.codigo)) {
          errors.push(`Producto ${product.codigo}: Ya existe un producto con este código`);
          continue;
        }

        // Validar que tenga al menos una bodega asignada
        if (productWarehouses.length === 0) {
          errors.push(`Producto ${product.codigo}: No tiene bodegas asignadas`);
          continue;
        }

        // Validar que todas las bodegas tengan cantidad
        const invalidWarehouses = productWarehouses.filter(wh => !wh.warehouse || !wh.quantity || parseFloat(wh.quantity) <= 0);
        if (invalidWarehouses.length > 0) {
          errors.push(`Producto ${product.codigo}: Hay bodegas sin seleccionar o sin cantidad válida`);
          continue;
        }

        // Validar que la suma de cantidades no exceda la cantidad total
        const totalAssigned = productWarehouses.reduce((sum, wh) => sum + parseFloat(wh.quantity), 0);
        const totalProduct = parseFloat(product.cantidad);
        if (totalAssigned > totalProduct) {
          errors.push(`Producto ${product.codigo}: La suma de cantidades en bodegas (${totalAssigned}) excede la cantidad total (${totalProduct})`);
          continue;
        }

        // Generar código de barras
        const codigoBarras = await generateUniqueBarcodeValue(product.codigo);

        // Guardar producto
        const productRef = await addDoc(collection(db, "products"), {
          codigo: product.codigo,
          nombre: product.nombre,
          valorUnitarioCompra: Number(product.valorUnitarioCompra),
          valorUnitarioVenta: Number(product.valorUnitarioVenta),
          valorTotalCompra: Number(product.valorTotalCompra),
          stock: Number(product.stock),
          codigoBarras,
          gramaje: product.gramaje,
          gramajePorUnidad: Number(product.gramajePorUnidad),
          createdAt: new Date(),
        });

        // Guardar en múltiples bodegas
        for (const warehouse of productWarehouses) {
          const cellarQuery = query(collection(db, "cellars"), where("cellarName", "==", warehouse.warehouse));
          const cellarSnapshot = await getDocs(cellarQuery);

          if (!cellarSnapshot.empty) {
            const cellarDoc = cellarSnapshot.docs[0];
            const productLocCollectionRef = collection(cellarDoc.ref, "productLoc");
            await addDoc(productLocCollectionRef, {
              codigoProducto: product.codigo,
              nombreProducto: product.nombre,
              cantidad: Number(warehouse.quantity),
            });
          } else {
            errors.push(`Producto ${product.codigo}: No se encontró la bodega "${warehouse.warehouse}"`);
          }
        }

        // Actualizar progreso
        setImportProgress(Math.round(((i + 1) / importData.length) * 100));
        
      } catch (error) {
        console.error(`Error procesando producto ${product.codigo}:`, error);
        errors.push(`Producto ${product.codigo}: Error al procesar`);
      }
    }

    setIsImporting(false);
    setImportErrors(errors);
    
    if (errors.length === 0) {
      setSuccess(`¡${importData.length} productos importados exitosamente!`);
    } else {
      setError(`Importación completada con ${errors.length} errores.`);
    }
    
    setShowImportModal(false);
    setImportData([]);
    setImportFile(null);
    setImportWarehouseSelections({});
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
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
            onChange={handlePurchaseTotalChange}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
            min="0"
          />
        </div>        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="cantidad">
            Cantidad
          </label>
          <input
            type="text"
            id="cantidad"
            name="cantidad"
            value={form.cantidad}
            onChange={handleQuantityChange}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
            min="0"
          />
        </div>        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="gramaje">
            Gramaje Total
          </label>
          <input
            type="number"
            step="0.1"
            id="gramaje"
            name="gramaje"
            value={form.gramaje}
            onChange={handleChange}
            className="w-full px-8 py-3 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg text-center"
            autoComplete="off"
            placeholder="Ej: 80.5"
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-base sm:text-lg" htmlFor="gramajePorUnidad">
            Gramaje por Unidad
          </label>
          <input
            type="text"
            id="gramajePorUnidad"
            name="gramajePorUnidad"
            value={form.gramajePorUnidad ? `${form.gramajePorUnidad} g` : 'Calculo automático'}
            className="w-full px-8 py-3 rounded-xl bg-gray-100 text-gray-600 border border-green-600 text-base sm:text-lg text-center cursor-not-allowed"
            disabled
            placeholder="Calculo automático"
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
        </div>        <div className="mb-6 w-full">
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
          />        </div>
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
                    <span>{cellar.cellarName}</span>                    <input
                      type="number"
                      placeholder="Cantidad"
                      className="ml-2 w-20 px-2 py-1 border rounded"
                      value={selectedWarehouses.find((w) => w.warehouse === cellar.cellarName)?.quantity || ""}
                      onChange={(e) => {
                        const quantity = e.target.value;
                        addWarehouseFromDropdown(cellar, quantity);
                      }}
                    />
                  </li>
              ))}
            </ul>
          )}
        </div>        <div className="mb-4 w-full">
          <h3 className="text-green-400 mb-2 text-base sm:text-lg">Bodegas Seleccionadas</h3>          <ul className="list-disc pl-5">
            {selectedWarehouses.map((warehouse, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-white">{warehouse.warehouse} - Cantidad: {warehouse.quantity}</span>
                <button
                  type="button"
                  onClick={() => setSelectedWarehouses((prev) => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sección del Código de Barras - Tercera columna */}
        {form.codigo && (
          <div className="mb-4 w-full">
            <label className="block text-green-400 mb-2 text-base sm:text-lg">
              Código de Barras
            </label>
            <div className="bg-white p-4 rounded-xl border border-green-600">
              {generatingBarcode ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
                  <span className="text-green-800 text-sm">Generando...</span>
                </div>
              ) : form.codigoBarras ? (
                <BarcodeGenerator 
                  value={form.codigoBarras}
                  className="w-full"
                  width={1.5}
                  height={60}
                  fontSize={14}
                />
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Se generará automáticamente
                </div>
              )}
            </div>
          </div>
        )}        {error && <div className="mb-4 text-red-400 text-center text-sm w-full">{error}</div>}
        {success && <div className="mb-4 text-green-400 text-center text-sm w-full">{success}</div>}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            type="submit"
            disabled={loading}
            className="w-64 py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-base"
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>

          <div className="flex flex-col items-center">
            <input
              type="file"
              id="excel-import"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="excel-import"
              className="w-64 py-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-blue-950 font-bold hover:from-blue-400 hover:to-blue-500 transition cursor-pointer text-base text-center flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Importar desde Excel
            </label>
            <p className="text-green-300 text-xs mt-1 text-center">
              Formatos: .xlsx, .xls
            </p>
          </div>
        </div>

        {/* Modal de previsualización de importación */}
        {showImportModal && (
          <div className="fixed inset-0 bg-green-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-green-700">
                    Previsualización de Importación - {importData.length} productos
                  </h3>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>                {/* Tabla de previsualización */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-3 py-2">Código</th>
                        <th className="px-3 py-2">Nombre</th>
                        <th className="px-3 py-2">Cantidad Total</th>
                        <th className="px-3 py-2">Valor Total</th>
                        <th className="px-3 py-2">Valor Unit. Compra</th>
                        <th className="px-3 py-2">Valor Unit. Venta</th>
                        <th className="px-3 py-2">Stock</th>
                        <th className="px-3 py-2 w-80">Distribución en Bodegas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.map((product, index) => (
                        <tr key={index} className="bg-white border-b">
                          <td className="px-3 py-2 font-medium">{product.codigo}</td>
                          <td className="px-3 py-2">{product.nombre}</td>
                          <td className="px-3 py-2">{product.cantidad}</td>
                          <td className="px-3 py-2">{formatCurrencyCOP(product.valorTotalCompra)}</td>
                          <td className="px-3 py-2">{formatCurrencyCOP(product.valorUnitarioCompra)}</td>
                          <td className="px-3 py-2">{formatCurrencyCOP(product.valorUnitarioVenta)}</td>
                          <td className="px-3 py-2">{product.stock}</td>
                          <td className="px-3 py-2">
                            <div className="space-y-2">
                              {/* Bodegas seleccionadas para este producto */}
                              {(importWarehouseSelections[product.codigo] || []).map((warehouse, whIndex) => (
                                <div key={whIndex} className="flex gap-2 items-center">
                                  <select
                                    value={warehouse.warehouse}
                                    onChange={(e) => updateImportWarehouse(product.codigo, whIndex, 'warehouse', e.target.value)}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                  >
                                    <option value="">Seleccionar bodega...</option>
                                    {cellars.map((cellar) => (
                                      <option key={cellar.id} value={cellar.cellarName}>
                                        {cellar.cellarName}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    value={warehouse.quantity}
                                    onChange={(e) => updateImportWarehouse(product.codigo, whIndex, 'quantity', e.target.value)}
                                    placeholder="Cant."
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                    min="0"
                                    max={product.cantidad}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeWarehouseFromImportProduct(product.codigo, whIndex)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              
                              {/* Botón para agregar bodega */}
                              <button
                                type="button"
                                onClick={() => addWarehouseToImportProduct(product.codigo)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span>+</span> Agregar bodega
                              </button>
                              
                              {/* Mostrar total asignado vs total disponible */}
                              {importWarehouseSelections[product.codigo] && (
                                <div className="text-xs text-gray-600">
                                  Asignado: {importWarehouseSelections[product.codigo].reduce((sum, wh) => sum + (parseFloat(wh.quantity) || 0), 0)} / {product.cantidad}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importData.length > 10 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Mostrando todos los {importData.length} productos
                    </p>
                  )}
                </div>

                {/* Errores de validación */}
                {importErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <h4 className="font-medium text-red-800 mb-2">Errores encontrados:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {importErrors.slice(0, 5).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importErrors.length > 5 && (
                        <li className="text-gray-600">... y {importErrors.length - 5} errores más</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Barra de progreso */}
                {isImporting && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-700">
                        Procesando productos...
                      </span>
                      <span className="text-sm text-green-600">
                        {importProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    disabled={isImporting}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={processMassiveImport}
                    disabled={isImporting || importData.length === 0}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isImporting ? "Procesando..." : `Importar ${importData.length} productos`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterProduct;
