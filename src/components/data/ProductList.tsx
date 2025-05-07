'use client';
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { app } from "../../firebase/Index";
import { formatCurrencyCOP } from "../../utils/formatCurrency";
import RegisterProduct from "./RegisterProduct";
import { trashIcon } from "@/icons/Icons";

interface Product {
  id: string;
  codigo: string;
  nombre: string;
  valorUnitarioCompra: number;
  valorUnitarioVenta: number;
  cantidad: number;
  stock: number;
}

const calculateInventoryValue = (products: Product[]): number => {
  return products.reduce((total, product) => total + (product.valorUnitarioCompra || 0) * (product.cantidad || 0), 0);
};

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDeleteProduct = async (productId: string) => {
    const confirmDelete = window.confirm("¿Estás seguro que deseas eliminar este producto?");
    if (!confirmDelete) return;

    try {
      const db = getFirestore(app);
      await deleteDoc(doc(db, "products", productId));
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
      alert("Producto eliminado con éxito.");
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Hubo un error al eliminar el producto.");
    }
  };

  const handleAddProductClick = () => {
    setShowAddProductModal(true);
  };

  const closeAddProductModal = () => {
    setShowAddProductModal(false);
  };

  const handleProductCreated = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setShowAddProductModal(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const db = getFirestore(app);
      const productsQuery = query(collection(db, "products"), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(productsQuery);
      const data: Product[] = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          codigo: d.codigo,
          nombre: d.nombre,
          valorUnitarioCompra: d.valorUnitarioCompra,
          valorUnitarioVenta: d.valorUnitarioVenta,
          cantidad: d.cantidad,
          stock: d.stock,
        };
      });
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const inventoryValue = calculateInventoryValue(products);

  const filteredProducts = products.filter((product) => {
    return (
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400 overflow-x-auto relative pl-26">
      <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center tracking-widest">Inventario</h2>
      <div className="flex justify-between items-center mb-4">
        <label className="text-green-700 font-bold flex justify-start">
          <input
            type="text"
            placeholder="Buscar por código o nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-green-400 rounded px-2 py-1"
          />
        </label>
        <label className="text-green-700 font-bold flex justify-end">
          VALOR DEL INVENTARIO: {formatCurrencyCOP(inventoryValue)}
        </label>
      </div>
      <button
        className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={handleAddProductClick}
      >
        Registrar Producto
      </button>
      <table className="w-full text-left min-w-[800px]">
        <thead>
          <tr className="text-green-700 border-b border-green-200">
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Código</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Nombre</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Valor unitario compra</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Valor unitario venta</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Cantidad</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Stock</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Acción</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className="text-center py-6">Cargando...</td></tr>
          ) : filteredProducts.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-6">No hay productos registrados.</td></tr>
          ) : (
            filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-green-100 hover:bg-green-50">
                <td className="py-2 px-2 border-1 border-green-500">{product.codigo}</td>
                <td className="py-2 px-2 border-1 border-green-500">{product.nombre}</td>
                <td className="py-2 px-2 border-1 border-green-500">{formatCurrencyCOP(product.valorUnitarioCompra)}</td>
                <td className="py-2 px-2 border-1 border-green-500">{formatCurrencyCOP(product.valorUnitarioVenta)}</td>
                <td
                  className={
                    `py-2 px-2 border-1 border-green-500 ${product.cantidad <= product.stock ? 'bg-red-200' : ''}`
                  }
                >
                  {product.cantidad}
                </td>
                <td className="py-2 px-2 border-1 border-green-500">{product.stock}</td>
                <td className="py-2 px-2 border-1 border-green-500 text-center">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    {trashIcon}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showAddProductModal && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg w-1/2">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeAddProductModal}
            >
              X
            </button>
            <RegisterProduct
              onCloseModal={closeAddProductModal}
              onProductRegistered={handleProductCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
