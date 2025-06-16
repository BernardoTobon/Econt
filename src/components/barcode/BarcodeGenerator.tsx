'use client';
import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  format?: string;
  className?: string;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  width = 2,
  height = 100,
  displayValue = true,
  fontSize = 20,
  format = "CODE128",
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          textAlign: "center",
          textPosition: "bottom",
          textMargin: 2,
          font: "monospace",
          fontOptions: "",
          background: "#ffffff",
          lineColor: "#000000",
          margin: 10,
          marginTop: 10,
          marginBottom: 10,
          marginLeft: 10,
          marginRight: 10,
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [value, width, height, displayValue, fontSize, format]);

  if (!value) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded">
        <span className="text-gray-500">No hay código para generar</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <canvas 
        ref={canvasRef}
        className="border border-gray-300 bg-white rounded"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="mt-2 text-sm text-gray-600 font-mono">
        {value}
      </div>
    </div>
  );
};

export default BarcodeGenerator;
