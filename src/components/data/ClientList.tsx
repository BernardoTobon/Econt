"use client";
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { app } from "../../firebase/Index";
import Modal from "./Modal";
import AddClient from "./AddClient";
import * as XLSX from "xlsx";

interface Client {
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

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "clients"));
    const data: Client[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Client[];
    setClients(data);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchClients();
  }, []);
  // Guardar cambios de edición
  const handleUpdateClient = async (updatedData: any) => {
    if (!editClient) return;
    const db = getFirestore(app);
    const ref = doc(db, "clients", editClient.id);
    await updateDoc(ref, updatedData);
    setModalOpen(false);
    setEditClient(null);
    fetchClients();
  };
  // Función para exportar a Excel
  const exportToExcel = () => {
    // Filtrar los datos según la búsqueda actual
    const filteredClients = clients.filter(client =>
      client.fullName.toLowerCase().includes(search.toLowerCase()) ||
      client.idNumber.toLowerCase().includes(search.toLowerCase())
    );

    // Preparar los datos para Excel
    const dataForExcel = filteredClients.map((client) => ({
      "Nombre completo / Razón social": client.fullName,
      "Tipo de identificación": client.idType,
      "Número de identificación": client.idNumber,
      "Tipo de persona": client.personType,
      "Responsabilidad tributaria": client.taxResponsibility,
      "Ciudad": client.city || "",
      "Dirección": client.address || "",
      "Código postal": client.postalCode || "",
      "Email": client.email || ""
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
      }      // Configurar el rango como tabla
      if (worksheet['!ref']) {
        worksheet['!autofilter'] = { ref: worksheet['!ref'] };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

    // Generar el nombre del archivo con la fecha actual
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const fileName = `clientes_${dateString}.xlsx`;

    // Descargar el archivo
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      const db = getFirestore(app);
      const querySnapshot = await getDocs(collection(db, "clients"));
      const data: Client[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Client[];
      setClients(data);
      setLoading(false);
    };
    fetchClients();
  }, []);

  return (    <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400 overflow-x-auto">
      <div className="flex justify-between items-center mb-6 relative">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 text-center tracking-widest w-full">Clientes</h2>
        <div className="absolute right-0 flex gap-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-blue-950 font-bold hover:from-blue-400 hover:to-blue-500 transition text-sm shadow-lg border border-blue-600 whitespace-nowrap"
          >
            Exportar Excel
          </button>
          <a
            href="/add-client"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition text-sm shadow-lg border border-green-600 whitespace-nowrap"
          >
            Registrar cliente
          </a>
        </div>
      </div>
      {/* Buscador */}
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
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[100px]">Editar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-6">Cargando...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-6">No hay clientes registrados.</td></tr>
            ) : (
              clients
                .filter(client =>
                  client.fullName.toLowerCase().includes(search.toLowerCase()) ||
                  client.idNumber.toLowerCase().includes(search.toLowerCase())
                )
                .map((client) => (
                  <tr key={client.id} className="border-b border-green-100 hover:bg-green-50">
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[260px]">{client.fullName}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[170px]">{client.idType}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[180px]">{client.idNumber}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[150px]">{client.personType}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[200px]">{client.taxResponsibility}</td>
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[100px]">
                      <button
                        className="text-green-700 underline hover:text-green-900"
                        onClick={(e) => { e.preventDefault(); setEditClient(client); setModalOpen(true); }}
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
      {/* Modal de edición */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditClient(null); }}>
        {editClient && (
          <AddClient
            onRegistered={fetchClients}
            initialData={editClient}
            editMode={true}
            onUpdate={handleUpdateClient}
            onCloseModal={() => { setModalOpen(false); setEditClient(null); }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ClientList;
