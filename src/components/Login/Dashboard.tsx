"use client";
import React, { useState } from "react";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
} from "react-chartjs-2";
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

// Datos quemados para las gráficas
type DateAmount = { date: string; amount: number };
type SoldProduct = { name: string; quantity: number };

const salesData: DateAmount[] = [
  { date: "2025-04-01", amount: 1200 },
  { date: "2025-04-02", amount: 900 },
  { date: "2025-04-03", amount: 1500 },
  { date: "2025-04-04", amount: 800 },
  { date: "2025-04-05", amount: 2000 },
];
const purchasesData: DateAmount[] = [
  { date: "2025-04-01", amount: 700 },
  { date: "2025-04-02", amount: 1200 },
  { date: "2025-04-03", amount: 900 },
  { date: "2025-04-04", amount: 1100 },
  { date: "2025-04-05", amount: 1300 },
];
const expensesData: DateAmount[] = [
  { date: "2025-04-01", amount: 300 },
  { date: "2025-04-02", amount: 400 },
  { date: "2025-04-03", amount: 350 },
  { date: "2025-04-04", amount: 500 },
  { date: "2025-04-05", amount: 450 },
];
const soldProducts: SoldProduct[] = [
  { name: "Producto A", quantity: 120 },
  { name: "Producto B", quantity: 80 },
  { name: "Producto C", quantity: 60 },
  { name: "Producto D", quantity: 30 },
  { name: "Producto E", quantity: 10 },
];

const Dashboard = () => {
  const [startDate, setStartDate] = useState("2025-04-01");
  const [endDate, setEndDate] = useState("2025-04-05");

  // Filtrar datos por fecha
  const filterByDate = (data: DateAmount[]): DateAmount[] =>
    data.filter(
      (d: DateAmount) => d.date >= startDate && d.date <= endDate
    );

  // Configuración de las gráficas
  const filteredSales = filterByDate(salesData);
  const filteredPurchases = filterByDate(purchasesData);
  const filteredExpenses = filterByDate(expensesData);

  const salesChart = {
    labels: filteredSales.map((v) => v.date),
    datasets: [
      {
        label: "Ventas ($)",
        data: filteredSales.map((v) => v.amount),
        backgroundColor: "#22d3ee",
      },
    ],
  };
  const purchasesChart = {
    labels: filteredPurchases.map((c) => c.date),
    datasets: [
      {
        label: "Compras ($)",
        data: filteredPurchases.map((c) => c.amount),
        backgroundColor: "#4ade80",
      },
    ],
  };
  const expensesChart = {
    labels: filteredExpenses.map((g) => g.date),
    datasets: [
      {
        label: "Gastos ($)",
        data: filteredExpenses.map((g) => g.amount),
        backgroundColor: "#f87171",
      },
    ],
  };
  const mostSold = {
    labels: soldProducts.map((p) => p.name),
    datasets: [
      {
        label: "Más Vendidos",
        data: soldProducts.map((p) => p.quantity),
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
  const leastSold = {
    labels: soldProducts
      .slice()
      .sort((a, b) => a.quantity - b.quantity)
      .map((p) => p.name),
    datasets: [
      {
        label: "Menos Vendidos",
        data: soldProducts
          .slice()
          .sort((a, b) => a.quantity - b.quantity)
          .map((p) => p.quantity),
        backgroundColor: [
          "#f87171",
          "#fbbf24",
          "#a78bfa",
          "#4ade80",
          "#22d3ee",
        ],
      },
    ],
  };

  // Calcular totales filtrados
  const totalSales = filteredSales.reduce((acc, v) => acc + v.amount, 0);
  const totalPurchases = filteredPurchases.reduce((acc, c) => acc + c.amount, 0);
  const totalExpenses = filteredExpenses.reduce((acc, g) => acc + g.amount, 0);

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-4xl font-bold text-green-800 mb-8 text-center tracking-widest">Dashboard</h1>
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        <div className="flex flex-col gap-2">
          <label className="text-green-800 font-semibold">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg px-3 py-2 bg-green-100 text-green-800 border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-green-800 font-semibold">Fecha fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg px-3 py-2 bg-green-100 text-green-800 border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>
      {/* Totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-100 rounded-xl p-6 flex flex-col items-center shadow border border-green-200">
          <span className="text-green-700 font-semibold text-lg mb-1">Total Ventas</span>
          <span className="text-2xl font-bold text-green-800">${totalSales.toLocaleString()}</span>
        </div>
        <div className="bg-blue-100 rounded-xl p-6 flex flex-col items-center shadow border border-blue-200">
          <span className="text-blue-700 font-semibold text-lg mb-1">Total Compras</span>
          <span className="text-2xl font-bold text-blue-800">${totalPurchases.toLocaleString()}</span>
        </div>
        <div className="bg-red-100 rounded-xl p-6 flex flex-col items-center shadow border border-red-200">
          <span className="text-red-700 font-semibold text-lg mb-1">Total Gastos</span>
          <span className="text-2xl font-bold text-red-800">${totalExpenses.toLocaleString()}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <h2 className="text-xl font-bold text-green-700 mb-4">Ventas</h2>
          <Bar data={salesChart} options={{ responsive: true, plugins: { legend: { display: false } }, backgroundColor: '#fff' }} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <h2 className="text-xl font-bold text-green-700 mb-4">Compras</h2>
          <Bar data={purchasesChart} options={{ responsive: true, plugins: { legend: { display: false } }, backgroundColor: '#fff' }} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <h2 className="text-xl font-bold text-green-700 mb-4">Gastos</h2>
          <Line data={expensesChart} options={{ responsive: true, plugins: { legend: { display: false } }, backgroundColor: '#fff' }} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 col-span-1 md:col-span-2 xl:col-span-1">
          <h2 className="text-xl font-bold text-green-700 mb-4">Más Vendidos</h2>
          <Doughnut data={mostSold} options={{ responsive: true, plugins: { legend: { labels: { color: '#222' } } }, backgroundColor: '#fff' }} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 col-span-1 md:col-span-2 xl:col-span-1">
          <h2 className="text-xl font-bold text-green-700 mb-4">Menos Vendidos</h2>
          <Pie data={leastSold} options={{ responsive: true, plugins: { legend: { labels: { color: '#222' } } }, backgroundColor: '#fff' }} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
