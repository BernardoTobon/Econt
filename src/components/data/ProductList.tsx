'use client';
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { app } from "../../firebase/Index";
import { formatCurrencyCOP } from "../../utils/formatCurrency";
import RegisterProduct from "./RegisterProduct";
import { trashIcon } from "@/icons/Icons";
import * as XLSX from "xlsx";

interface Product {
  id: string;
  codigo: string;
  nombre: string;
  gramaje: string;
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
  // Función para exportar a Excel
  const exportToExcel = () => {
    const filteredProducts = products.filter((product) => {
      return (
        product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.gramaje.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });    const dataForExcel = filteredProducts.map((product) => ({
      "Código": product.codigo,
      "Nombre": product.nombre,
      "Gramaje": product.gramaje,
      "Valor unitario compra": product.valorUnitarioCompra,
      "Valor unitario venta": product.valorUnitarioVenta,
      "Cantidad": product.cantidad,
      "Stock": product.stock,
      "Valor inventario (compra)": product.valorUnitarioCompra * product.cantidad,
      "Valor inventario (venta)": product.valorUnitarioVenta * product.cantidad
    }));

    // Agregar fila con el valor total del inventario
    const totalInventoryValue = filteredProducts.reduce((total, product) => 
      total + (product.valorUnitarioCompra * product.cantidad), 0
    );
    const totalInventoryValueSale = filteredProducts.reduce((total, product) => 
      total + (product.valorUnitarioVenta * product.cantidad), 0
    );    dataForExcel.push({
      "Código": "",
      "Nombre": "VALOR TOTAL DEL INVENTARIO",
      "Gramaje": "",
      "Valor unitario compra": 0,
      "Valor unitario venta": 0,
      "Cantidad": 0,
      "Stock": 0,
      "Valor inventario (compra)": totalInventoryValue,
      "Valor inventario (venta)": totalInventoryValueSale
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    
    // Función para calcular el ancho de columna basado en el contenido
    const getColumnWidth = (data: any[], key: string) => {
      const lengths = data.map(row => {
        const value = row[key] ? row[key].toString() : '';
        return value.length;
      });
      // Incluir también la longitud del encabezado
      lengths.push(key.length);
      const maxLength = Math.max(...lengths);
      // Agregar un poco de padding y limitar el ancho máximo
      return Math.min(Math.max(maxLength + 2, 10), 50);
    };

    // Configurar el ancho de las columnas
    const columnKeys = Object.keys(dataForExcel[0] || {});
    const columnWidths = columnKeys.map(key => ({
      wch: getColumnWidth(dataForExcel, key)
    }));
    worksheet['!cols'] = columnWidths;

    // Aplicar formato de tabla
    if (dataForExcel.length > 0) {
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Aplicar estilo a los encabezados
      for (let col = range.s.c; col <= range.e.c; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[headerCell]) continue;
        
        worksheet[headerCell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F7942" } }, // Verde similar al diseño
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }      // Aplicar bordes a todas las celdas de datos
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) continue;
          
          const isLastRow = row === range.e.r; // Fila de totales
          
          worksheet[cellAddress].s = {
            border: {
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } }
            },
            alignment: { vertical: "center" },
            // Destacar la fila de totales
            ...(isLastRow && {
              font: { bold: true },
              fill: { fgColor: { rgb: "F0F8E8" } }
            })
          };
        }
      }

      // Configurar el rango como tabla
      if (worksheet['!ref']) {
        worksheet['!autofilter'] = { ref: worksheet['!ref'] };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const fileName = `inventario_${dateString}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const db = getFirestore(app);

      // Obtener todos los productos de la colección products
      const productsQuery = query(collection(db, "products"), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(productsQuery);

      // Obtener todas las bodegas de la colección cellars
      const cellarsQuerySnapshot = await getDocs(collection(db, "cellars"));

      const data: Product[] = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const d = doc.data();

          let totalCantidad = 0;

          // Iterar sobre las bodegas y sumar las cantidades de la subcolección productLoc
          for (const cellarDoc of cellarsQuerySnapshot.docs) {
            const productLocSnapshot = await getDocs(collection(cellarDoc.ref, "productLoc"));
            productLocSnapshot.docs.forEach((productLocDoc) => {
              const productLocData = productLocDoc.data();
              if (productLocData.codigoProducto === d.codigo) {
                totalCantidad += productLocData.cantidad || 0;
              }
            });
          } return {
            id: doc.id,
            codigo: d.codigo,
            nombre: d.nombre,
            gramaje: d.gramaje || 'No especificado',
            valorUnitarioCompra: d.valorUnitarioCompra,
            valorUnitarioVenta: d.valorUnitarioVenta,
            cantidad: totalCantidad, // Suma de las cantidades de la subcolección productLoc
            stock: d.stock,
          };
        })
      );

      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const inventoryValue = calculateInventoryValue(products);
  const filteredProducts = products.filter((product) => {
    return (
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.gramaje.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 border border-green-400 overflow-x-auto relative">
      <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center tracking-widest">Inventario</h2>
      <div className="flex justify-between items-center mb-4">        <label className="text-green-700 font-bold flex justify-start">
        <input
          type="text"
          placeholder="Buscar por código, nombre o gramaje"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-green-400 rounded px-2 py-1 w-64"
        />
      </label>
        <label className="text-green-700 font-bold flex justify-end">
          VALOR DEL INVENTARIO: {formatCurrencyCOP(inventoryValue)}        </label>      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-blue-950 font-bold hover:from-blue-400 hover:to-blue-500 transition text-sm shadow-lg border border-blue-600 whitespace-nowrap"
        >
          Exportar Excel
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleAddProductClick}
        >
          Registrar Producto
        </button>
      </div>
      <table className="w-full text-left min-w-[900px]">
        <thead>
          <tr className="text-green-700 border-b border-green-200">
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Código</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Nombre</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Gramaje</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Valor unitario compra</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Valor unitario venta</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Cantidad</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Stock</th>
            <th className="py-2 px-2 bg-green-100 border-2 border-green-700">Acción</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8} className="text-center py-6">Cargando...</td></tr>
          ) : filteredProducts.length === 0 ? (
            <tr><td colSpan={8} className="text-center py-6">No hay productos registrados.</td></tr>
          ) : (
            filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-green-100 hover:bg-green-50">
                <td className="py-2 px-2 border-1 border-green-500">{product.codigo}</td>
                <td className="py-2 px-2 border-1 border-green-500">{product.nombre}</td>
                <td className="py-2 px-2 border-1 border-green-500 text-sm text-gray-600">{product.gramaje}</td>
                <td className="py-2 px-2 border-1 border-green-500">{formatCurrencyCOP(product.valorUnitarioCompra)}</td>
                <td className="py-2 px-2 border-1 border-green-500">{formatCurrencyCOP(product.valorUnitarioVenta)}</td>
                <td
                  className={`py-2 px-2 border-1 border-green-500 cursor-pointer ${product.cantidad <= product.stock ? 'bg-red-200' : ''}`}
                  onClick={async () => {
                    const db = getFirestore(app);
                    const cellarsQuerySnapshot = await getDocs(collection(db, "cellars"));
                    const bodegasInfo: string[] = [];

                    for (const cellarDoc of cellarsQuerySnapshot.docs) {
                      const cellarData = cellarDoc.data(); // Obtener los datos de la bodega
                      const productLocSnapshot = await getDocs(collection(cellarDoc.ref, "productLoc"));
                      productLocSnapshot.docs.forEach((productLocDoc) => {
                        const productLocData = productLocDoc.data();
                        if (productLocData.codigoProducto === product.codigo) {
                          bodegasInfo.push(`${cellarData.cellarName || cellarDoc.id}: ${productLocData.cantidad}`);
                        }
                      });
                    }

                    alert(`Bodegas para ${product.nombre} (Código: ${product.codigo}):\n\n${bodegasInfo.join("\n")}`);
                  }}
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
