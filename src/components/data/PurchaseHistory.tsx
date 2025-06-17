'use client'

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/Index';
import Image from 'next/image';

interface PurchaseProduct {
  codigo: string;
  nombreProducto: string;
  gramajePorUnidad: number;
  gramajeTotal: number;
  cantidad: number;
  valorUnitarioCompra: number;
  total: number;
}

interface Purchase {
  id: string;
  fecha: string;
  total: number;
  imagen?: string;
  productos: PurchaseProduct[];
}

interface PurchaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  loadingDetail: boolean;
}

const PurchaseDetailModal = ({ isOpen, onClose, purchase, loadingDetail }: PurchaseDetailModalProps) => {
  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 bg-green-50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl max-h-[90vh] overflow-auto border border-green-400">        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-700">Detalle de Compra</h2>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
          <div className="mb-4">
          <p className="text-green-600 font-semibold">Fecha: {purchase.fecha}</p>
          <p className="text-green-600 font-semibold">Total: ${purchase.total.toLocaleString()}</p>
        </div><div className="overflow-x-auto">
          {loadingDetail ? (            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-green-600">Cargando detalles...</span>
            </div>
          ) : (            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="text-green-700 border-b border-green-200">
                  <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Código</th>
                  <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Nombre del Producto</th>
                  <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Gramaje por Unidad</th>
                  <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Gramaje Total</th>
                  <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Cantidad</th>
                  <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Valor Unitario de Compra</th>
                  <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {purchase.productos && purchase.productos.length > 0 ? (                  purchase.productos.map((producto, index) => (
                    <tr key={index} className="border-b border-green-100 hover:bg-green-50">
                      <td className="py-2 px-2 border-1 border-green-500">{producto.codigo}</td>
                      <td className="py-2 px-2 border-1 border-green-500">{producto.nombreProducto}</td>
                      <td className="py-2 px-2 border-1 border-green-500">{producto.gramajePorUnidad}g</td>
                      <td className="py-2 px-2 border-1 border-green-500">{producto.gramajeTotal}g</td>
                      <td className="py-2 px-2 border-1 border-green-500">{producto.cantidad}</td>
                      <td className="py-2 px-2 border-1 border-green-500">${producto.valorUnitarioCompra.toLocaleString()}</td>
                      <td className="py-2 px-2 border-1 border-green-500">${producto.total.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (                  <tr>
                    <td colSpan={7} className="text-center py-6 text-green-600">
                      No se encontraron productos en esta compra
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);  const fetchPurchases = async () => {
    try {
      const purchasesRef = collection(db, 'purchases');
      const q = query(purchasesRef, orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const purchasesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fecha: data.fecha,
          total: data.total,
          imagen: data.imagen,
          productos: [] as PurchaseProduct[] // Inicialmente vacío, se carga cuando se necesite
        } as Purchase;
      });
      
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleShowDetail = async (purchase: Purchase) => {
    setLoadingDetail(true);
    try {
      // Cargar los detalles de la subcolección si no están ya cargados
      if (!purchase.productos || purchase.productos.length === 0) {
        const detalleRef = collection(db, 'purchases', purchase.id, 'detalle');
        const detalleSnapshot = await getDocs(detalleRef);
        
        const productos = detalleSnapshot.docs.map(detalleDoc => ({
          ...detalleDoc.data()
        })) as PurchaseProduct[];
        
        purchase.productos = productos;
      }
      
      setSelectedPurchase(purchase);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching purchase details:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPurchase(null);
  };
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-green-600 font-semibold">Cargando historial de compras...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400 overflow-x-auto relative">
      <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center tracking-widest">Historial de Compras</h2>
      
      <table className="w-full text-left min-w-[900px]">
        <thead>
          <tr className="text-green-700 border-b border-green-200">
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Fecha</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Total</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Imagen</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="text-center py-6">Cargando...</td></tr>
          ) : purchases.length === 0 ? (
            <tr><td colSpan={4} className="text-center py-6">No se encontraron compras registradas</td></tr>
          ) : (
            purchases.map((purchase) => (
              <tr key={purchase.id} className="border-b border-green-100 hover:bg-green-50">
                <td className="py-2 px-2 border-1 border-green-500">
                  {new Date(purchase.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </td>
                <td className="py-2 px-2 border-1 border-green-500 font-semibold">
                  ${purchase.total.toLocaleString()}
                </td>
                <td className="py-2 px-2 border-1 border-green-500">
                  {purchase.imagen ? (
                    <div className="w-16 h-16 relative">
                      <Image
                        src={purchase.imagen}
                        alt="Imagen de compra"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sin imagen</span>
                    </div>
                  )}
                </td>
                <td className="py-2 px-2 border-1 border-green-500 text-center">
                  <button
                    onClick={() => handleShowDetail(purchase)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table><PurchaseDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        purchase={selectedPurchase}
        loadingDetail={loadingDetail}
      />
    </div>
  );
};

export default PurchaseHistory;
