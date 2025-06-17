"use client";
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { app } from "../../firebase/Index";
import Modal from "./Modal";
import AddSupplier from "./AddSupplier";
import * as XLSX from "xlsx";

interface Supplier {
  id: string;
  fullName: string;
  idType: string;
  idNumber: string;
  personType: string;
  taxResponsibility: string;
  city: string;
  address: string;
  postalCode: string;
  email: string;
}

const SupplierList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [search, setSearch] = useState("");

  const fetchSuppliers = async () => {
    setLoading(true);
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "suppliers"));
    const data: Supplier[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Supplier[];
    setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);
  const handleUpdateSupplier = async (updatedData: any) => {
    if (!editSupplier) return;
    const db = getFirestore(app);
    const ref = doc(db, "suppliers", editSupplier.id);
    await updateDoc(ref, updatedData);
    setModalOpen(false);
    setEditSupplier(null);
    fetchSuppliers();
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    // Filtrar los datos según la búsqueda actual
    const filteredSuppliers = suppliers.filter(supplier =>
      supplier.fullName.toLowerCase().includes(search.toLowerCase()) ||
      supplier.idNumber.toLowerCase().includes(search.toLowerCase())
    );

    // Preparar los datos para Excel
    const dataForExcel = filteredSuppliers.map((supplier) => ({
      "Nombre completo / Razón social": supplier.fullName,
      "Tipo de identificación": supplier.idType,
      "Número de identificación": supplier.idNumber,
      "Tipo de persona": supplier.personType,
      "Responsabilidad tributaria": supplier.taxResponsibility,
      "Email": supplier.email || "",
      "Ciudad": supplier.city || "",
      "Dirección": supplier.address || "",
      "Código postal": supplier.postalCode || ""
    }));

    // Crear el libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    
    // Función para calcular el ancho de columna basado en el contenido
    const getColumnWidth = (data: any[], key: string) => {
      const lengths = data.map(row => {
        const value = row[key] ? row[key].toString() : '';
        return value.length;
      });
      // Incluir también la longitud del encabezado
      lengths.push(key.length);
      const maxLength = Math.max(...lengths);
      // Agregar un poco de padding y limitar el ancho máximo
      return Math.min(Math.max(maxLength + 2, 10), 50);
    };

    // Configurar el ancho de las columnas
    const columnKeys = Object.keys(dataForExcel[0] || {});
    const columnWidths = columnKeys.map(key => ({
      wch: getColumnWidth(dataForExcel, key)
    }));
    worksheet['!cols'] = columnWidths;

    // Aplicar formato de tabla
    if (dataForExcel.length > 0) {
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Aplicar estilo a los encabezados
      for (let col = range.s.c; col <= range.e.c; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[headerCell]) continue;
        
        worksheet[headerCell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F7942" } }, // Verde similar al diseño
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }

      // Aplicar bordes a todas las celdas de datos
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) continue;
          
          worksheet[cellAddress].s = {
            border: {
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } }
            },
            alignment: { vertical: "center" }
          };
        }
      }

      // Configurar el rango como tabla
      if (worksheet['!ref']) {
        worksheet['!autofilter'] = { ref: worksheet['!ref'] };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");

    // Generar el nombre del archivo con la fecha actual
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const fileName = `proveedores_${dateString}.xlsx`;

    // Descargar el archivo
    XLSX.writeFile(workbook, fileName);
  };

  return (    <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400 overflow-x-auto">
      <div className="flex justify-between items-center mb-6 relative">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 text-center tracking-widest w-full">Proveedores</h2>
        <div className="absolute right-0 flex gap-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-blue-950 font-bold hover:from-blue-400 hover:to-blue-500 transition text-sm shadow-lg border border-blue-600 whitespace-nowrap"
          >
            Exportar Excel
          </button>
          <a
            href="/add-supplier"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition text-sm shadow-lg border border-green-600 whitespace-nowrap"
          >
            Registrar proveedor
          </a>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-xs px-4 py-2 border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-green-800"
        />
      </div>
      <div className="w-full min-w-[1100px]">
        <table className="w-full text-left min-w-[1000px]">
          <thead>
            <tr className="text-green-700 border-b border-green-200">
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[260px]">Nombre completo / Razón social</th>
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[170px]">Tipo de identificación</th>
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[180px]">Número de identificación</th>
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[150px]">Tipo de persona</th>
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[200px]">Responsabilidad tributaria</th>
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[200px]">Email</th>
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[100px]">Editar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-6">Cargando...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-6">No hay proveedores registrados.</td></tr>
            ) : (
              suppliers
                .filter(supplier =>
                  supplier.fullName.toLowerCase().includes(search.toLowerCase()) ||
                  supplier.idNumber.toLowerCase().includes(search.toLowerCase())
                )
                .map((supplier) => (
                  <tr key={supplier.id} className="border-b border-green-100 hover:bg-green-50">
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[260px]">{supplier.fullName}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[170px]">{supplier.idType}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[180px]">{supplier.idNumber}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[150px]">{supplier.personType}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[200px]">{supplier.taxResponsibility}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[200px]">{supplier.email}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[100px]">
                      <button
                        className="text-green-700 underline hover:text-green-900"
                        onClick={(e) => { e.preventDefault(); setEditSupplier(supplier); setModalOpen(true); }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditSupplier(null); }}>
        {editSupplier && (
          <AddSupplier
            onRegistered={fetchSuppliers}
            initialData={editSupplier}
            editMode={true}
            onUpdate={handleUpdateSupplier}
            onCloseModal={() => { setModalOpen(false); setEditSupplier(null); }}
          />
        )}
      </Modal>
    </div>
  );
};

export default SupplierList;
