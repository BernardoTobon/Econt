'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (scannedValue: string) => void;
  onScanError?: (error: string) => void;
  isActive: boolean;
  className?: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  isActive,
  className = ""
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  useEffect(() => {
    // Obtener lista de cámaras disponibles
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        // Seleccionar la cámara trasera por defecto si está disponible
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
      }
    }).catch(err => {
      console.error("Error obteniendo cámaras:", err);
      setError("No se pudieron obtener las cámaras disponibles");
    });
  }, []);

  useEffect(() => {
    if (isActive && selectedCamera && !isScanning) {
      startScanning();
    } else if (!isActive && isScanning) {
      stopScanning();
    }

    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isActive, selectedCamera]);

  const startScanning = async () => {
    if (!scannerRef.current || isScanning) return;

    try {
      setError("");
      setIsScanning(true);
      
      html5QrCodeRef.current = new Html5Qrcode("barcode-scanner");
        const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCodeRef.current.start(
        selectedCamera,
        config,
        (decodedText) => {
          console.log("Código escaneado:", decodedText);
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Errores de escaneo silenciosos (normales durante el proceso)
          if (onScanError) {
            onScanError(errorMessage);
          }
        }
      );
    } catch (err: any) {
      console.error("Error iniciando escáner:", err);
      setError(`Error al iniciar el escáner: ${err.message}`);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error deteniendo escáner:", err);
      }
    }
  };

  const handleCameraChange = (cameraId: string) => {
    setSelectedCamera(cameraId);
    if (isScanning) {
      stopScanning();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Selector de cámara */}
      {cameras.length > 1 && (
        <div className="mb-4 w-full">
          <label className="block text-green-400 mb-2 text-sm">
            Seleccionar Cámara:
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => handleCameraChange(e.target.value)}
            className="w-full px-3 py-2 rounded bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Cámara ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Área del escáner */}
      <div className="relative">
        <div
          id="barcode-scanner"
          ref={scannerRef}
          className="w-full max-w-md rounded-lg overflow-hidden border-2 border-green-400"
          style={{ minHeight: '300px' }}
        />
        
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
            <span className="text-white text-lg">
              Presiona "Iniciar Escáner" para comenzar
            </span>
          </div>
        )}
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isScanning && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Escaneando... Apunta la cámara hacia el código de barras
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-4 text-sm text-gray-600 text-center max-w-md">        <p>• Mantén el código de barras dentro del cuadro</p>
        <p>• Asegúrate de que haya buena iluminación</p>
        <p>• El escaneo se detendrá automáticamente al detectar un código</p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
