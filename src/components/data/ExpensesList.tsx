"use client";
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";
import { app } from "../../firebase/Index";
import { formatCurrencyInput } from "../../utils/formatCurrency";
import * as XLSX from 'xlsx';

interface Expense {
  id: string;
  date: string;
  expenseType: string;
  concept: string;
  amount: number;
  bankAccount: string;
  createdAt: any;
}

interface ExpensesListProps {
  refreshTrigger?: number;
}

function ExpensesList({ refreshTrigger }: ExpensesListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState("");
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 50; // Mostrar 50 registros por página
  
  // Obtener mes y año actual por defecto
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // +1 porque getMonth() va de 0-11
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Opciones de meses
  const months = [
    { value: 0, label: "Todos los meses" },
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  // Generar años desde 2025 en adelante
  const generateYears = () => {
    const years = [{ value: 0, label: "Todos los años" }];
    const currentYear = new Date().getFullYear();
    for (let year = 2025; year <= currentYear + 5; year++) {
      years.push({ value: year, label: year.toString() });
    }
    return years;
  };

  const years = generateYears();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const db = getFirestore(app);
      // Ordenar por fecha de creación descendente (más recientes primero)
      const expensesQuery = query(
        collection(db, "expenses"), 
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(expensesQuery);
      
      const data: Expense[] = querySnapshot.docs.map((doc) => {
        const expense = doc.data();
        return {
          id: doc.id,
          date: expense.date || "",
          expenseType: expense.expenseType || "",
          concept: expense.concept || "",
          amount: expense.amount || 0,
          bankAccount: expense.bankAccount || "",
          createdAt: expense.createdAt,
        };
      });
      
      setExpenses(data);
    } catch (error) {
      console.error("Error al cargar los gastos:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Efecto para refrescar cuando se registra un nuevo gasto
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchExpenses();
    }
  }, [refreshTrigger]);
  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });  };
  
  // Función para manejar el cambio de filtro "Mostrar todos"
  const handleShowAllChange = (show: boolean) => {
    setShowAll(show);
    setCurrentPage(1); // Resetear a la primera página
    if (show) {
      // Si se activa "Mostrar todos", resetear filtros de fecha
      setSelectedMonth(0);
      setSelectedYear(0);
    } else {
      // Si se desactiva, volver a los filtros por defecto (mes actual)
      setSelectedMonth(currentDate.getMonth() + 1);
      setSelectedYear(currentDate.getFullYear());
    }
  };
  
  // Filtrar gastos por tipo, mes y año
  const filteredExpenses = expenses.filter(expense => {
    // Filtro por tipo de gasto
    const matchesType = expense.expenseType.toLowerCase().includes(searchType.toLowerCase());
    
    // Si "Mostrar todos" está activo, no aplicar filtros de fecha
    if (showAll) {
      return matchesType;
    }
    
    // Filtro por mes y año
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.getMonth() + 1; // +1 porque getMonth() va de 0-11
    const expenseYear = expenseDate.getFullYear();
    
    const matchesMonth = selectedMonth === 0 || expenseMonth === selectedMonth;
    const matchesYear = selectedYear === 0 || expenseYear === selectedYear;
    
    return matchesType && matchesMonth && matchesYear;
  });

  // Paginación
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  // Función para cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchType, selectedMonth, selectedYear, showAll]);  // Función para exportar a Excel
  const exportToExcel = () => {
    try {
      // Preparar los datos para Excel
      const dataToExport = filteredExpenses.map((expense, index) => ({
        'N°': index + 1,
        'Fecha': formatDate(expense.date),
        'Tipo de Gasto': expense.expenseType,
        'Concepto': expense.concept,
        'Valor': expense.amount,
        'Cuenta Bancaria': expense.bankAccount
      }));

      // Crear un libro de trabajo
      const workbook = XLSX.utils.book_new();
      
      // Crear la hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Configurar el ancho de las columnas
      worksheet['!cols'] = [
        { wch: 8 },   // N°
        { wch: 15 },  // Fecha
        { wch: 25 },  // Tipo de Gasto
        { wch: 50 },  // Concepto
        { wch: 18 },  // Valor
        { wch: 30 }   // Cuenta Bancaria
      ];

      // Obtener el rango de datos
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        // Configurar filtros automáticos
      worksheet['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(range.e.c)}${range.e.r + 1}` };

      // APLICAR COLORES A LOS ENCABEZADOS
      const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'];
      headerCells.forEach(cellAddr => {
        if (worksheet[cellAddr]) {
          worksheet[cellAddr].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { patternType: "solid", fgColor: { rgb: "2E8B57" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      });

      // Formato para columna de valores
      for (let row = 2; row <= range.e.r + 1; row++) {
        const cellAddr = `E${row}`;
        if (worksheet[cellAddr]) {
          worksheet[cellAddr].s = {
            numFmt: '"$"#,##0',
            alignment: { horizontal: "right" }
          };
        }
      }

      // AGREGAR FILA DE TOTALES CON COLOR
      const totalRow = range.e.r + 2;
      const totalAmount = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
      
      // Celda "TOTAL:"
      const totalLabelCell = `D${totalRow}`;
      worksheet[totalLabelCell] = {
        v: 'TOTAL:',
        t: 's',
        s: {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { patternType: "solid", fgColor: { rgb: "228B22" } },
          alignment: { horizontal: "right", vertical: "center" }
        }
      };

      // Celda del valor total
      const totalValueCell = `E${totalRow}`;
      worksheet[totalValueCell] = {
        v: totalAmount,
        t: 'n',
        s: {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { patternType: "solid", fgColor: { rgb: "228B22" } },
          numFmt: '"$"#,##0',
          alignment: { horizontal: "right", vertical: "center" }
        }
      };

      // Actualizar el rango para incluir la fila de totales
      worksheet['!ref'] = `A1:F${totalRow}`;

      // Agregar la hoja al libro
      const sheetName = showAll 
        ? 'Todos los Gastos' 
        : `Gastos ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generar nombre del archivo
      const currentDate = new Date();
      const timestamp = currentDate.toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = showAll 
        ? `Gastos_Todos_${timestamp}.xlsx`
        : `Gastos_${months.find(m => m.value === selectedMonth)?.label}_${selectedYear}_${timestamp}.xlsx`;

      // Descargar el archivo
      XLSX.writeFile(workbook, fileName);

      alert(`Excel exportado: ${fileName}`);
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al exportar el archivo. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400 overflow-x-auto">      <div className="flex justify-between items-center mb-6 relative">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 text-center tracking-widest w-full">
          Lista de Gastos
        </h2>
        {/* Botón de exportar a Excel */}
        <button
          onClick={exportToExcel}
          disabled={loading || filteredExpenses.length === 0}
          className="absolute right-0 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          title={filteredExpenses.length === 0 ? "No hay datos para exportar" : "Exportar a Excel"}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Excel
        </button>
      </div>{/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Toggle Mostrar Todos */}
        <div className="flex items-center min-w-[140px]">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showAll}
              onChange={e => handleShowAllChange(e.target.checked)}
              className="mr-2 w-4 h-4 text-green-600 bg-gray-100 border-green-300 rounded focus:ring-green-500"
            />
            <span className="text-green-700 font-medium">Mostrar todos</span>
          </label>
        </div>
        
        {/* Buscador por tipo */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por tipo de gasto..."
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
            className="w-full px-4 py-2 border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-green-800"
          />
        </div>
        
        {/* Selector de mes */}
        <div className="min-w-[180px]">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            disabled={showAll}
            className={`w-full px-4 py-2 border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-green-800 ${
              showAll ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''
            }`}
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Selector de año */}
        <div className="min-w-[150px]">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            disabled={showAll}
            className={`w-full px-4 py-2 border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-green-800 ${
              showAll ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''
            }`}
          >
            {years.map(year => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="w-full min-w-[1000px]">
        <table className="w-full text-left">
          <thead>
            <tr className="text-green-700 border-b border-green-200">
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[120px]">
                Fecha
              </th>
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[180px]">
                Tipo de Gasto
              </th>
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[250px]">
                Concepto
              </th>
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[150px]">
                Valor
              </th>
              <th className="py-2 px-2 bg-green-100 border-2 border-green-700 min-w-[200px]">
                Cuenta Bancaria
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-green-600">
                  Cargando gastos...
                </td>
              </tr>            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-green-600">
                  {expenses.length === 0 
                    ? "No hay gastos registrados."
                    : `No se encontraron gastos${searchType ? ` del tipo "${searchType}"` : ''}${
                        !showAll && selectedMonth > 0 ? ` para ${months.find(m => m.value === selectedMonth)?.label}` : ''
                      }${!showAll && selectedYear > 0 ? ` de ${selectedYear}` : ''}.`
                  }
                </td>
              </tr>
            ) : (
              paginatedExpenses.map((expense) => (
                <tr key={expense.id} className="border-b border-green-100 hover:bg-green-50">
                  <td className="py-2 px-2 border-1 border-green-500 min-w-[120px]">
                    {formatDate(expense.date)}
                  </td>
                  <td className="py-2 px-2 border-1 border-green-500 min-w-[180px]">
                    {expense.expenseType}
                  </td>
                  <td className="py-2 px-2 border-1 border-green-500 min-w-[250px]">
                    {expense.concept}
                  </td>
                  <td className="py-2 px-2 border-1 border-green-500 min-w-[150px] font-semibold text-green-700">
                    {formatCurrencyInput(expense.amount)}
                  </td>
                  <td className="py-2 px-2 border-1 border-green-500 min-w-[200px]">
                    {expense.bankAccount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>      </div>
      
      {/* Controles de paginación */}
      {filteredExpenses.length > itemsPerPage && (
        <div className="mt-4 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          <span className="text-green-700 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
        
      {/* Resumen de gastos */}
      {expenses.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-green-700 font-medium">
              {showAll 
                ? `${filteredExpenses.length} gastos en total${searchType ? ` (tipo: "${searchType}")` : ''}`
                : `${filteredExpenses.length} gastos del mes de ${months.find(m => m.value === selectedMonth)?.label} de ${selectedYear}${
                    searchType ? ` (tipo: "${searchType}")` : ''
                  }`
              }
              {filteredExpenses.length > itemsPerPage && (
                <span className="text-sm text-green-600 ml-2">
                  (Mostrando {startIndex + 1}-{Math.min(endIndex, filteredExpenses.length)} de {filteredExpenses.length})
                </span>
              )}
            </span>
            <span className="text-green-700 font-bold text-lg">
              Total: {formatCurrencyInput(
                filteredExpenses.reduce((total, expense) => total + expense.amount, 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpensesList;
