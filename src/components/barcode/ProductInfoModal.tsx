'use client';
import React from 'react';
import { formatCurrencyCOP } from '../../utils/formatCurrency';
import BarcodeGenerator from './BarcodeGenerator';

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  locations: any[];
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({
  isOpen,
  onClose,
  product,
  locations
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-green-950 bg-opacity-95 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-green-500">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-green-600">
          <h2 className="text-2xl font-bold text-green-300">
            Información del Producto
          </h2>
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Código de Barras */}
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3 text-center">
              Código de Barras
            </h3>
            <BarcodeGenerator 
              value={product.codigoBarras} 
              className="w-full"
            />
          </div>

          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
                <label className="block text-green-400 text-sm font-medium mb-1">
                  Código del Producto
                </label>
                <p className="text-white text-lg font-mono">{product.codigo}</p>
              </div>

              <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
                <label className="block text-green-400 text-sm font-medium mb-1">
                  Nombre del Producto
                </label>
                <p className="text-white text-lg">{product.nombre}</p>
              </div>

              <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
                <label className="block text-green-400 text-sm font-medium mb-1">
                  Gramaje
                </label>
                <p className="text-white text-lg">{product.gramaje || 'No especificado'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
                <label className="block text-green-400 text-sm font-medium mb-1">
                  Valor Unitario Compra
                </label>
                <p className="text-white text-lg font-semibold">
                  {formatCurrencyCOP(product.valorUnitarioCompra?.toString() || '0')}
                </p>
              </div>

              <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
                <label className="block text-green-400 text-sm font-medium mb-1">
                  Valor Unitario Venta
                </label>
                <p className="text-white text-lg font-semibold">
                  {formatCurrencyCOP(product.valorUnitarioVenta?.toString() || '0')}
                </p>
              </div>

              <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
                <label className="block text-green-400 text-sm font-medium mb-1">
                  Stock Total
                </label>
                <p className="text-white text-lg font-semibold">{product.stock || 0} unidades</p>
              </div>
            </div>
          </div>

          {/* Ubicaciones en Bodegas */}
          <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-green-400 text-lg font-semibold mb-3">
              Ubicaciones en Bodegas
            </h3>
            {locations.length > 0 ? (
              <div className="space-y-2">
                {locations.map((location, index) => (
                  <div key={index} className="flex justify-between items-center bg-green-800 bg-opacity-50 p-3 rounded">
                    <span className="text-white font-medium">{location.cellarName}</span>
                    <span className="text-green-300 font-semibold">
                      {location.cantidad} unidades
                    </span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-green-600">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-semibold">Total en todas las bodegas:</span>
                    <span className="text-green-300 font-bold text-lg">
                      {locations.reduce((total, location) => total + (location.cantidad || 0), 0)} unidades
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic">No se encontraron ubicaciones en bodegas</p>
            )}
          </div>

          {/* Información Adicional */}
          <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-green-400 text-lg font-semibold mb-3">
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-400">Valor Total Compra:</span>
                <p className="text-white">
                  {formatCurrencyCOP(product.valorTotalCompra?.toString() || '0')}
                </p>
              </div>
              <div>
                <span className="text-green-400">Fecha de Registro:</span>
                <p className="text-white">
                  {product.createdAt ? 
                    new Date(product.createdAt.seconds * 1000).toLocaleDateString('es-CO') : 
                    'No disponible'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-green-600">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-400 text-green-950 font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoModal;
