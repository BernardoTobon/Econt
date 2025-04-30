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
    <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400 overflow-x-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center tracking-widest">Clientes</h2>
      <table className="w-full text-left min-w-[900px]">
        <thead>
          <tr className="text-green-700 border-b border-green-200">
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Nombre completo / Razón social</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Tipo de identificación</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Número de identificación</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Tipo de persona</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Responsabilidad tributaria</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Email</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Editar</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={9} className="text-center py-6">Cargando...</td></tr>
          ) : clients.length === 0 ? (
            <tr><td colSpan={9} className="text-center py-6">No hay clientes registrados.</td></tr>
          ) : (
            clients.map((client) => (
              <tr key={client.id} className="border-b border-green-100 hover:bg-green-50">
                <td className="py-2 px-2 border-1 border-green-500">{client.fullName}</td>
                <td className="py-2 px-2 border-1 border-green-500">{client.idType}</td>
                <td className="py-2 px-2 border-1 border-green-500">{client.idNumber}</td>
                <td className="py-2 px-2 border-1 border-green-500">{client.personType}</td>
                <td className="py-2 px-2 border-1 border-green-500">{client.taxResponsibility}</td>
                <td className="py-2 px-2 border-1 border-green-500">{client.email}</td>
                <td className="py-2 px-2 border-1 border-green-500">
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
