"use client";
import React, { useState, useEffect } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/Index";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);
// Tipos de datos
type DateAmount = { date: string; amount: number };
type SoldProduct = { name: string; quantity: number };
// Generar datos específicos para cada mes y año
const generateTestData = (): DateAmount[] => {
  const dates: DateAmount[] = [];
  // Generar datos para 4 años (2022-2025)
  const years = [2022, 2023, 2024, 2025];
  years.forEach(year => {
    // Para cada mes del año
    for (let month = 0; month < 12; month++) {
      // Características distintas según el año y mes
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      // Generar entre 3-5 registros por mes
      const entriesCount = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < entriesCount; i++) {
        // Días distribuidos a lo largo del mes
        const day = Math.floor((i + 1) * (daysInMonth / (entriesCount + 1)));
        const date = new Date(year, month, day).toISOString().split("T")[0];
        // Cantidades específicas según el año para notar diferencias
        let baseAmount;
        switch (year) {
          case 2022:
            // Año con valores bajos
            baseAmount = 500 + (month * 100);
            break;
          case 2023:
            // Año con valores medianos
            baseAmount = 1000 + (month * 150);
            break;
          case 2024:
            // Año con valores altos
            baseAmount = 1500 + (month * 200);
            break;
          case 2025:
            // Año actual con valores muy altos
            baseAmount = 2000 + (month * 250);
            break;
          default:
            baseAmount = 1000;
        }
        // Añadir variación
        const variance = Math.floor(Math.random() * 500) - 250;
        dates.push({
          date,
          amount: baseAmount + variance,
        });
      }
    }
  });
  return dates;
};
// Generar y asignar datos
const allData = generateTestData();
// Distribuir los datos en las diferentes categorías
const salesData: DateAmount[] = allData.map(item => ({
  date: item.date,
  amount: Math.floor(item.amount * 1.2) // Ventas siempre mayores
}));
const expensesData: DateAmount[] = allData.map(item => ({
  date: item.date,
  amount: Math.floor(item.amount * 0.7) // Gastos menores que ventas
}));
const purchasesData: DateAmount[] = allData.map(item => ({
  date: item.date,
  amount: Math.floor(item.amount * 0.8) // Compras entre ventas y gastos
}));
const sellersData: { name: string; sales: number }[] = [
  { name: "Vendedor A", sales: 1200 },
  { name: "Vendedor B", sales: 900 },
  { name: "Vendedor C", sales: 1500 },
  { name: "Vendedor D", sales: 800 },
  { name: "Vendedor E", sales: 2000 },
];
const soldProducts = [
  { name: "Producto A", quantity: 120 },
  { name: "Producto B", quantity: 90 },
  { name: "Producto C", quantity: 150 },
  { name: "Producto D", quantity: 80 },
  { name: "Producto E", quantity: 200 },
];
const Dashboard = () => {
  // Estado para guardar el mes seleccionado
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Inicializar con el mes actual
    return new Date().getMonth();
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    // Inicializar con el año actual
    return new Date().getFullYear();
  });
  // Estado para guardar el día seleccionado
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Para generar los días disponibles del mes y año seleccionados
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  
  // Filtrado de datos por mes, año y opcionalmente por día
const filterDataByDate = (data: DateAmount[]): DateAmount[] => {
  return data.filter((item) => {
    // Extraer componentes de la fecha directamente del string para evitar problemas de zona horaria
    // Aseguramos que el formato sea consistente (YYYY-MM-DD)
    const [year, month, day] = item.date.split('-').map(Number);
    
    // Comparar mes y año (recordando que en JavaScript los meses van de 0-11)
    const monthYearMatch = 
      (month - 1) === selectedMonth && 
      year === selectedYear;
    
    // Si no hay día seleccionado, solo filtramos por mes y año
    if (selectedDay === null) {
      return monthYearMatch;
    }
    
    // Si hay día seleccionado, filtramos también por día
    return monthYearMatch && day === selectedDay;
  });
};
  
  // Datos filtrados
  const filteredSalesData = filterDataByDate(salesData);
  const filteredExpensesData = filterDataByDate(expensesData);
  const filteredPurchasesData = filterDataByDate(purchasesData);
  // Calcular totales de los datos filtrados
  const totalSales = filteredSalesData.reduce((sum, v) => sum + v.amount, 0);
  const totalExpenses = filteredExpensesData.reduce((sum, g) => sum + g.amount, 0);
  // Configuraciones de gráficos con datos filtrados
  const salesChart = {
    labels: filteredSalesData.map((v: DateAmount) => v.date),
    datasets: [
      {
        label: `Ventas Totales: $${totalSales}`,
        data: filteredSalesData.map((v: DateAmount) => v.amount),
        backgroundColor: "#22d3ee",
      },
    ],
  };
  const salesAndExpensesChart = {
    labels: filteredSalesData.map((v) => v.date),
    datasets: [
      {
        label: `Ventas Totales: $${totalSales}`,
        data: filteredSalesData.map((v) => v.amount),
        backgroundColor: "#22d3ee",
      },
      {
        label: `Costos y Gastos Totales: $${totalExpenses}`,
        data: filteredExpensesData.map((g) => g.amount),
        backgroundColor: "#f87171",
      },
    ],
  };
  const purchasesChart = {
    labels: filteredPurchasesData.map((c) => c.date),
    datasets: [
      {
        label: "Compras ($)",
        data: filteredPurchasesData.map((c) => c.amount),
        backgroundColor: "#4ade80",
      },
    ],
  };
  const expensesChart = {
    labels: filteredExpensesData.map((g: DateAmount) => g.date),
    datasets: [
      {
        label: `Costos y Gastos Totales: $${totalExpenses}`,
        data: filteredExpensesData.map((g: DateAmount) => g.amount),
        backgroundColor: "#f87171",
      },
    ],
  };
  const sellersChart = {
    labels: sellersData.map((s) => s.name),
    datasets: [
      {
        label: "Ventas por Vendedor ($)",
        data: sellersData.map((s) => s.sales),
        backgroundColor: [
          "#22d3ee",
          "#4ade80",
          "#fbbf24",
          "#f87171",
          "#a78bfa",
        ],
      },
    ],
  };
  const [mostSoldProducts, setMostSoldProducts] = useState<{ name: string; quantity: number }[]>([]);

  useEffect(() => {
    const fetchMostSoldProducts = async () => {
      try {
        const salesInfoCollection = collection(db, "salesInfo");
        const querySnapshot = await getDocs(salesInfoCollection);

        const productSales: { [key: string]: number } = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const descripcion = data.descripcion;
          const cantidad = data.cantidad || 0;

          if (descripcion) {
            productSales[descripcion] = (productSales[descripcion] || 0) + cantidad;
          }
        });

        const sortedProducts = Object.entries(productSales)
          .map(([name, quantity]) => ({ name, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5); // Obtener los 5 productos más vendidos

        setMostSoldProducts(sortedProducts);
      } catch (error) {
        console.error("Error al obtener los productos más vendidos:", error);
      }
    };

    fetchMostSoldProducts();
  }, []);

  const mostSoldProductsChart = {
    labels: mostSoldProducts.map((p) => p.name),
    datasets: [
      {
        label: "Productos Más Vendidos",
        data: mostSoldProducts.map((p) => p.quantity),
        backgroundColor: [
          "#22d3ee",
          "#4ade80",
          "#fbbf24",
          "#f87171",
          "#a78bfa",
        ],
      },
    ],
  };

  const [leastSoldProducts, setLeastSoldProducts] = useState<{ name: string; quantity: number }[]>([]);

  useEffect(() => {
    const fetchLeastSoldProducts = async () => {
      try {
        const salesInfoCollection = collection(db, "salesInfo");
        const querySnapshot = await getDocs(salesInfoCollection);

        const productSales: { [key: string]: number } = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const descripcion = data.descripcion;
          const cantidad = data.cantidad || 0;

          if (descripcion) {
            productSales[descripcion] = (productSales[descripcion] || 0) + cantidad;
          }
        });

        const sortedProducts = Object.entries(productSales)
          .map(([name, quantity]) => ({ name, quantity }))
          .sort((a, b) => a.quantity - b.quantity) // Ordenar de menor a mayor
          .slice(0, 5); // Obtener los 5 productos menos vendidos

        setLeastSoldProducts(sortedProducts);
      } catch (error) {
        console.error("Error al obtener los productos menos vendidos:", error);
      }
    };

    fetchLeastSoldProducts();
  }, []);

  const leastSoldProductsChart = {
    labels: leastSoldProducts.map((p) => p.name),
    datasets: [
      {
        label: "Productos Menos Vendidos",
        data: leastSoldProducts.map((p) => p.quantity),
        backgroundColor: [
          "#22d3ee",
          "#4ade80",
          "#fbbf24",
          "#f87171",
          "#a78bfa",
        ],
      },
    ],
  };

  // Array de meses para el selector
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  // Años específicos para los datos de prueba
  const years = [2022, 2023, 2024, 2025];
  
  // Resetear el día seleccionado cuando cambia el mes o año
  useEffect(() => {
    setSelectedDay(null);
  }, [selectedMonth, selectedYear]);
  
  // Mensaje cuando no hay datos
  const NoDataMessage = () => (
    <div className="flex justify-center items-center h-72 text-gray-500 text-lg">
      No hay datos disponibles para el período seleccionado
    </div>
  );
  
  // Generar array de días para el selector
  const getDaysArray = () => {
    const daysArray = [];
    for (let i = 1; i <= daysInSelectedMonth; i++) {
      daysArray.push(i);
    }
    return daysArray;
  };
  
  // Texto para el título de la fecha
  const getDateTitle = () => {
    if (selectedDay) {
      return `${selectedDay} de ${months[selectedMonth]} ${selectedYear}`;
    }
    return `${months[selectedMonth]} ${selectedYear}`;
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-600">Dashboard</h1>
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Mes:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Año:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Día:</label>
          <select
            value={selectedDay || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedDay(value === "" ? null : parseInt(value));
            }}
            className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todos los días</option>
            {getDaysArray().map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-green-600">
            Ventas - {getDateTitle()}
          </h2>
          {filteredSalesData.length > 0 ? (
            <Bar data={salesChart} />
          ) : (
            <NoDataMessage />
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-green-600">
            Costos y Gastos - {getDateTitle()}
          </h2>
          {filteredExpensesData.length > 0 ? (
            <Bar data={expensesChart} />
          ) : (
            <NoDataMessage />
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg col-span-2">
          <h2 className="text-xl font-bold mb-4 text-green-600">
            Ventas vs Costos y Gastos - {getDateTitle()}
          </h2>
          {filteredSalesData.length > 0 && filteredExpensesData.length > 0 ? (
            <Bar data={salesAndExpensesChart} />
          ) : (
            <NoDataMessage />
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-green-600">
            Productos Más Vendidos
          </h2>
          <Pie data={mostSoldProductsChart} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-green-600">
            Productos Menos Vendidos
          </h2>
          <Pie data={leastSoldProductsChart} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-green-600">
            Ventas por Vendedor
          </h2>
          <Pie data={sellersChart} />
        </div>
      </div>
    </div>
  );
};
export default Dashboard;