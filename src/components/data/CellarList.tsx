"use client";
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebase/Index";
import Cellar from "./Cellar";

interface Cellar {
  id: string;
  cellarName: string;
  city: string;
  department?: string;
  address: string;
}

const getDepartmentFromCity = (city: string, municipiosDepartamentos: any[]) => {
  const found = municipiosDepartamentos.find((item) => item.municipio === city);
  return found ? found.departamento : "";
};

import { municipiosDepartamentos } from "../../constants/Departments";

function CellarList() {
  const [cellars, setCellars] = useState<Cellar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCellars = async () => {
    setLoading(true);
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "cellars"));
    const data: Cellar[] = querySnapshot.docs.map((doc) => {
      const cellar = doc.data();
      return {
        id: doc.id,
        cellarName: cellar.cellarName,
        city: cellar.city,
        department: cellar.department || getDepartmentFromCity(cellar.city, municipiosDepartamentos),
        address: cellar.address,
      };
    });
    setCellars(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCellars();
  }, []);

  const handleCellarRegistered = () => {
    fetchCellars();
  };

  return (    <div className="min-h-screen flex flex-col sm:flex-row items-start justify-start px-2 sm:px-4 py-8 gap-6 relative">
      <div className="w-full sm:w-1/3">
        <Cellar onRegistered={handleCellarRegistered} />
      </div>
      <div className="w-full sm:w-2/3">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center tracking-widest">Bodegas</h2>
        <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400">
          <table className="w-full text-left">
            <thead>
              <tr className="text-green-700 border-b border-green-200">
                <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Nombre de bodega</th>
                <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Departamento</th>
                <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Municipio</th>
                <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Dirección</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-6">Cargando...</td></tr>
              ) : cellars.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6">No hay bodegas registradas.</td></tr>
              ) : (
                cellars.map((cellar) => (
                  <tr key={cellar.id} className="border-b border-green-100 hover:bg-green-50">
                    <td className="py-2 px-2 border-1 border-green-500">{cellar.cellarName}</td>
                    <td className="py-2 px-2 border-1 border-green-500">{cellar.department}</td>
                    <td className="py-2 px-2 border-1 border-green-500">{cellar.city}</td>
                    <td className="py-2 px-2 border-1 border-green-500">{cellar.address}</td>
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

export default CellarList;
