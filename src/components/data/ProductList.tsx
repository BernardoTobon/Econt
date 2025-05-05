'use client';
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebase/Index";
import { formatCurrencyCOP } from "../../utils/formatCurrency";

interface Product {
  id: string;
  codigo: string;
  nombre: string;
  valorUnitario: number;
  cantidad: number;
  stock: number;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const db = getFirestore(app);
      const querySnapshot = await getDocs(collection(db, "products"));
      const data: Product[] = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          codigo: d.codigo,
          nombre: d.nombre,
          valorUnitario: d.valorUnitario,
          cantidad: d.cantidad,
          stock: d.stock,
        };
      });
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400 overflow-x-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center tracking-widest">Productos</h2>
      <table className="w-full text-left min-w-[800px]">
        <thead>
          <tr className="text-green-700 border-b border-green-200">
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Código</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Nombre</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Valor unitario</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Cantidad</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Stock</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="text-center py-6">Cargando...</td></tr>
          ) : products.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-6">No hay productos registrados.</td></tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="border-b border-green-100 hover:bg-green-50">
                <td className="py-2 px-2 border-1 border-green-500">{product.codigo}</td>
                <td className="py-2 px-2 border-1 border-green-500">{product.nombre}</td>
                <td className="py-2 px-2 border-1 border-green-500">{formatCurrencyCOP(product.valorUnitario)}</td>
                <td
                  className={
                    `py-2 px-2 border-1 border-green-500 ${product.cantidad <= product.stock ? 'bg-red-200' : ''}`
                  }
                >
                  {product.cantidad}
                </td>
                <td className="py-2 px-2 border-1 border-green-500">{product.stock}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
