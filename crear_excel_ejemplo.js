const XLSX = require('xlsx');
const path = require('path');

// Datos de ejemplo para el archivo Excel
const productosEjemplo = [
  {
    'Código': 'PRD001',
    'Nombre': 'Arroz Diana 500g',
    'Valor Total Compra': 25000,
    'Cantidad': 50,
    'Gramaje Total': 25000,
    'Valor Unitario Venta': 600,
    'Stock': 50,
    'Bodega': 'Almacén Principal'
  },
  {
    'Código': 'PRD002',
    'Nombre': 'Aceite Girasol 1L',
    'Valor Total Compra': 45000,
    'Cantidad': 30,
    'Gramaje Total': 30000,
    'Valor Unitario Venta': 1800,
    'Stock': 30,
    'Bodega': 'Almacén Principal'
  },
  {
    'Código': 'PRD003',
    'Nombre': 'Azúcar Blanca 1kg',
    'Valor Total Compra': 18000,
    'Cantidad': 40,
    'Gramaje Total': 40000,
    'Valor Unitario Venta': 500,
    'Stock': 40,
    'Bodega': 'Bodega Secundaria'
  },
  {
    'Código': 'PRD004',
    'Nombre': 'Pasta Espagueti 500g',
    'Valor Total Compra': 35000,
    'Cantidad': 70,
    'Gramaje Total': 35000,
    'Valor Unitario Venta': 550,
    'Stock': 70,
    'Bodega': 'Almacén Principal'
  },
  {
    'Código': 'PRD005',
    'Nombre': 'Leche Entera 1L',
    'Valor Total Compra': 28000,
    'Cantidad': 35,
    'Gramaje Total': 35000,
    'Valor Unitario Venta': 900,
    'Stock': 35,
    'Bodega': 'Refrigerados'
  },
  {
    'Código': 'PRD006',
    'Nombre': 'Pan Integral 400g',
    'Valor Total Compra': 24000,
    'Cantidad': 60,
    'Gramaje Total': 24000,
    'Valor Unitario Venta': 450,
    'Stock': 60,
    'Bodega': 'Panadería'
  },
  {
    'Código': 'PRD007',
    'Nombre': 'Huevos AA x30',
    'Valor Total Compra': 42000,
    'Cantidad': 20,
    'Gramaje Total': 24000,
    'Valor Unitario Venta': 2300,
    'Stock': 20,
    'Bodega': 'Refrigerados'
  },
  {
    'Código': 'PRD008',
    'Nombre': 'Pollo Entero kg',
    'Valor Total Compra': 85000,
    'Cantidad': 25,
    'Gramaje Total': 25000,
    'Valor Unitario Venta': 3800,
    'Stock': 25,
    'Bodega': 'Carnicería'
  },
  {
    'Código': 'PRD009',
    'Nombre': 'Carne Res kg',
    'Valor Total Compra': 120000,
    'Cantidad': 15,
    'Gramaje Total': 15000,
    'Valor Unitario Venta': 8500,
    'Stock': 15,
    'Bodega': 'Carnicería'
  },
  {
    'Código': 'PRD010',
    'Nombre': 'Detergente 500ml',
    'Valor Total Compra': 36000,
    'Cantidad': 45,
    'Gramaje Total': 22500,
    'Valor Unitario Venta': 900,
    'Stock': 45,
    'Bodega': 'Limpieza'
  },
  {
    'Código': 'PRD011',
    'Nombre': 'Jabón Antibacterial',
    'Valor Total Compra': 18000,
    'Cantidad': 60,
    'Gramaje Total': 6000,
    'Valor Unitario Venta': 350,
    'Stock': 60,
    'Bodega': 'Limpieza'
  },
  {
    'Código': 'PRD012',
    'Nombre': 'Papel Higiénico x4',
    'Valor Total Compra': 32000,
    'Cantidad': 40,
    'Gramaje Total': 3200,
    'Valor Unitario Venta': 900,
    'Stock': 40,
    'Bodega': 'Higiene'
  },
  {
    'Código': 'PRD013',
    'Nombre': 'Shampoo 400ml',
    'Valor Total Compra': 48000,
    'Cantidad': 30,
    'Gramaje Total': 12000,
    'Valor Unitario Venta': 1800,
    'Stock': 30,
    'Bodega': 'Higiene'
  },
  {
    'Código': 'PRD014',
    'Nombre': 'Tomate kg',
    'Valor Total Compra': 12000,
    'Cantidad': 80,
    'Gramaje Total': 80000,
    'Valor Unitario Venta': 180,
    'Stock': 80,
    'Bodega': 'Verduras'
  },
  {
    'Código': 'PRD015',
    'Nombre': 'Cebolla kg',
    'Valor Total Compra': 8000,
    'Cantidad': 100,
    'Gramaje Total': 100000,
    'Valor Unitario Venta': 95,
    'Stock': 100,
    'Bodega': 'Verduras'
  }
];

// Crear el libro de trabajo
const workbook = XLSX.utils.book_new();

// Crear la hoja de trabajo
const worksheet = XLSX.utils.json_to_sheet(productosEjemplo);

// Configurar el ancho de las columnas
worksheet['!cols'] = [
  { wch: 12 },  // Código
  { wch: 25 },  // Nombre
  { wch: 18 },  // Valor Total Compra
  { wch: 12 },  // Cantidad
  { wch: 15 },  // Gramaje Total
  { wch: 18 },  // Valor Unitario Venta
  { wch: 10 },  // Stock
  { wch: 20 }   // Bodega
];

// Aplicar estilos a los encabezados
const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'];
headerCells.forEach(cellAddr => {
  if (worksheet[cellAddr]) {
    worksheet[cellAddr].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { patternType: "solid", fgColor: { rgb: "2E8B57" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }
});

// Agregar la hoja al libro
XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

// Escribir el archivo
XLSX.writeFile(workbook, 'ejemplo_productos_importacion.xlsx');

console.log('Archivo Excel creado: ejemplo_productos_importacion.xlsx');
console.log('\nEstructura del archivo:');
console.log('- Código: Identificador único del producto');
console.log('- Nombre: Nombre descriptivo del producto');
console.log('- Valor Total Compra: Valor total pagado por el lote');
console.log('- Cantidad: Número de unidades compradas');
console.log('- Gramaje Total: Peso total del lote (opcional)');
console.log('- Valor Unitario Venta: Precio de venta por unidad');
console.log('- Stock: Cantidad disponible en inventario');
console.log('- Bodega: Nombre de la bodega donde se almacena');
console.log('\nCálculos automáticos que realizará la aplicación:');
console.log('- Valor Unitario Compra = Valor Total Compra ÷ Cantidad');
console.log('- Gramaje por Unidad = Gramaje Total ÷ Cantidad');
console.log('- Código de Barras = Se genera automáticamente');
