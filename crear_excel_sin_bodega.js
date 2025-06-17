const XLSX = require('xlsx');

// Datos de ejemplo para productos (sin columna Bodega)
const productos = [
  {
    'Código': 'PROD001',
    'Nombre': 'Arroz Premium 1kg',
    'Valor Total Compra': 25000,
    'Cantidad': 50,
    'Valor Unitario Venta': 800,
    'Stock': 45,
    'Gramaje Total': 50000
  },
  {
    'Código': 'PROD002', 
    'Nombre': 'Aceite Girasol 500ml',
    'Valor Total Compra': 84000,
    'Cantidad': 30,
    'Valor Unitario Venta': 3500,
    'Stock': 28,
    'Gramaje Total': 15000
  },
  {
    'Código': 'PROD003',
    'Nombre': 'Pasta Espagueti 500g',
    'Valor Total Compra': 36000,
    'Cantidad': 40,
    'Valor Unitario Venta': 1200,
    'Stock': 35,
    'Gramaje Total': 20000
  },
  {
    'Código': 'PROD004',
    'Nombre': 'Leche Entera 1L',
    'Valor Total Compra': 45000,
    'Cantidad': 25,
    'Valor Unitario Venta': 2200,
    'Stock': 22,
    'Gramaje Total': 25000
  },
  {
    'Código': 'PROD005',
    'Nombre': 'Pan Integral 600g',
    'Valor Total Compra': 32000,
    'Cantidad': 20,
    'Valor Unitario Venta': 2000,
    'Stock': 18,
    'Gramaje Total': 12000
  }
];

// Crear nuevo libro de trabajo
const workbook = XLSX.utils.book_new();

// Crear hoja de trabajo con los datos
const worksheet = XLSX.utils.json_to_sheet(productos);

// Agregar la hoja al libro
XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

// Guardar el archivo
XLSX.writeFile(workbook, 'ejemplo_productos_sin_bodega.xlsx');

console.log('Archivo Excel creado: ejemplo_productos_sin_bodega.xlsx');
console.log('Columnas incluidas:');
console.log('- Código: Identificador único del producto');
console.log('- Nombre: Nombre descriptivo del producto');
console.log('- Valor Total Compra: Costo total de la compra');
console.log('- Cantidad: Número de unidades del producto');
console.log('- Valor Unitario Venta: Precio de venta por unidad');
console.log('- Stock: Cantidad disponible en inventario');
console.log('- Gramaje Total: Peso total del producto en gramos');
console.log('');
console.log('NOTA: La asignación de bodegas se realiza en la interfaz web');
console.log('después de subir el archivo Excel.');
