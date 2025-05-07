"use client";
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { app } from "../../firebase/Index";
import Modal from "./Modal";
import AddClient from "./AddClient";

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

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400 overflow-x-auto pl-26">
      <div className="flex justify-between items-center mb-6 relative">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 text-center tracking-widest w-full">Clientes</h2>
        <a
          href="/add-client"
          className="absolute right-0 px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition text-sm shadow-lg border border-green-600 whitespace-nowrap"
        >
          Registrar cliente
        </a>
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
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[200px]">Email</th>
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
                    <td className="py-2 px-2 border-1 border-green-500 min-w-[200px]">{client.email}</td>
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
