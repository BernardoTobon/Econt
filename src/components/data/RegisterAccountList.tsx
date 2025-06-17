"use client";
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebase/Index";
import RegisterAccount from "./RegisterAccount";

interface Account {
  id: string;
  accountName: string;
  accountType: string;
  accountNumber: string;
  initialAmount: number;
}

const accountTypeLabels: Record<string, string> = {
  savings: "Ahorros",
  checking: "Corriente",
  cash: "Caja",
};

function RegisterAccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "account"));
    const data: Account[] = querySnapshot.docs.map((doc) => {
      const acc = doc.data();
      return {
        id: doc.id,
        accountName: acc.accountName,
        accountType: acc.accountType,
        accountNumber: acc.accountNumber,
        initialAmount: acc.initialAmount,
      };
    });
    setAccounts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handler para refrescar desde RegisterAccount
  const handleAccountRegistered = () => {
    fetchAccounts();
  };

  return (    <div className="min-h-screen flex flex-col sm:flex-row items-start justify-start px-2 sm:px-4 py-4 gap-6 relative">
      <div className="w-full sm:w-1/3">
        <RegisterAccount onRegistered={handleAccountRegistered} />
      </div>
      <div className="w-full sm:w-2/3">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center">Cuentas</h2>
        <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400">
          <table className="w-full text-left">
            <thead>
              <tr className="text-green-700 border-b border-green-200">
                <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Nombre de cuenta</th>
                <th className="py-2 px-2 bg-green-100  border-2 border-green-700">Tipo de cuenta</th>
                <th className="py-2 px-2 bg-green-100  border-2 border-green-700">Número de cuenta</th>
                <th className="py-2 px-2 bg-green-100  border-2 border-green-700">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-6">Cargando...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6">No hay cuentas registradas.</td></tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="border-b border-green-100 hover:bg-green-50">
                    <td className="py-2 px-2 border-1 border-green-500">{acc.accountName}</td>
                    <td className="py-2 px-2 border-1 border-green-500">{accountTypeLabels[acc.accountType] || acc.accountType}</td>
                    <td className="py-2 px-2 border-1 border-green-500">{acc.accountNumber}</td>
                    <td className="py-2 px-2 border-1 border-green-500">${acc.initialAmount.toLocaleString("es-ES")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <img
        src="/E-cont 1.png"
        alt="E-cont logo"
        style={{
          position: "fixed",
          right: "2vw",
          bottom: "2vh",
          width: "80px",
          height: "auto",
          opacity: 0.85,
          zIndex: 50,
          pointerEvents: "none"
        }}
      />
    </div>
  );
}

export default RegisterAccountList;
