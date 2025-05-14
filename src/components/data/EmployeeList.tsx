'use client';

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/Index";
import AddEmployee from "./AddEmployee";

interface Employee {
  id: string;
  fullName: string;
  cedula: string;
  celular: string;
  email: string;
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "employees"));
      const employeesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching employees: ", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEmployeeRegistered = () => {
    fetchEmployees();
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.cedula.includes(searchTerm)
  );

  return (
    <div className="min-h-screen flex flex-col sm:flex-row items-start justify-start px-2 sm:px-4 py-8 gap-6 relative">
      <div className="w-full sm:w-1/3 ml-18">
        <AddEmployee onRegistered={handleEmployeeRegistered} />
      </div>
      <div className="w-full sm:w-2/3">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center tracking-widest">Lista de Empleados</h2>
        <input
          type="text"
          placeholder="Buscar por nombre o cédula"
          className="w-full max-w-xs px-4 py-2 border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-green-800 mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400">
          <table className="w-full text-left">
            <thead>
              <tr className="text-green-700 border-b border-green-200">
                <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Nombre Completo</th>
                <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Cédula</th>
                <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Celular</th>
                <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-green-100 hover:bg-green-50">
                  <td className="py-2 px-2 border-1 border-green-500">{employee.fullName}</td>
                  <td className="py-2 px-2 border-1 border-green-500">{employee.cedula}</td>
                  <td className="py-2 px-2 border-1 border-green-500">{employee.celular}</td>
                  <td className="py-2 px-2 border-1 border-green-500">{employee.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
