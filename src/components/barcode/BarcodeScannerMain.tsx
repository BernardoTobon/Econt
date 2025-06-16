'use client';
import React, { useState } from 'react';
import BarcodeScanner from './BarcodeScanner';
import ProductInfoModal from './ProductInfoModal';
import { findProductByBarcode, findProductLocations } from './utils/barcodeUtils';

interface BarcodeScannerMainProps {
  onClose?: () => void;
}

const BarcodeScannerMain: React.FC<BarcodeScannerMainProps> = ({ onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  // Estados para el modal de información
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productLocations, setProductLocations] = useState<any[]>([]);

  const handleStartScanning = () => {
    setIsScanning(true);
    setError("");
    setSuccess("");
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  const handleScanSuccess = async (scannedValue: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("Código escaneado:", scannedValue);
      
      // Buscar el producto por código de barras
      const product = await findProductByBarcode(scannedValue);
      
      if (product) {
        // Buscar ubicaciones del producto
        const locations = await findProductLocations(product.codigo);
        
        setSelectedProduct(product);
        setProductLocations(locations);
        setShowProductModal(true);
        setSuccess(`Producto encontrado: ${product.nombre}`);
      } else {
        setError("No se encontró ningún producto con este código de barras");
      }
    } catch (err: any) {
      console.error("Error buscando producto:", err);
      setError(`Error al buscar el producto: ${err.message}`);
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  const handleScanError = (errorMessage: string) => {
    // Solo mostrar errores importantes, no todos los errores de escaneo
    if (errorMessage.includes("NotFound") || errorMessage.includes("Permission")) {
      setError(`Error del escáner: ${errorMessage}`);
    }
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setProductLocations([]);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100 p-4">
      <div className="bg-green-950 bg-opacity-80 p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-green-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-300 tracking-widest">
            Escáner de Códigos de Barras
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-green-400 hover:text-green-200 text-2xl font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Controles del escáner */}
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={handleStartScanning}
            disabled={isScanning || loading}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-400 text-green-950 font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? "Escaneando..." : "Iniciar Escáner"}
          </button>
          
          {isScanning && (
            <button
              onClick={handleStopScanning}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-400 text-white font-semibold rounded-lg hover:from-red-400 hover:to-red-500 transition"
            >
              Detener Escáner
            </button>
          )}
        </div>

        {/* Escáner */}
        <div className="mb-6">
          <BarcodeScanner
            isActive={isScanning}
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            className="w-full"
          />
        </div>

        {/* Estados de carga */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
            Buscando producto...
          </div>
        )}

        {/* Mensajes de error */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Mensajes de éxito */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <p className="font-semibold">¡Éxito!</p>
            <p>{success}</p>
          </div>
        )}

        {/* Instrucciones */}
        <div className="text-green-400 text-sm space-y-2">
          <h3 className="font-semibold text-base">Instrucciones:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Presiona &quot;Iniciar Escáner&quot; para activar la cámara</li>
            <li>Apunta la cámara hacia el código de barras del producto</li>
            <li>Mantén el código dentro del área de escaneo</li>
            <li>El sistema buscará automáticamente el producto cuando detecte el código</li>
            <li>Se mostrará toda la información del producto encontrado</li>
          </ul>
        </div>
      </div>

      {/* Modal de información del producto */}
      <ProductInfoModal
        isOpen={showProductModal}
        onClose={handleCloseProductModal}
        product={selectedProduct}
        locations={productLocations}
      />
    </div>
  );
};

export default BarcodeScannerMain;
