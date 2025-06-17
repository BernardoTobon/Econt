const XLSX = require('xlsx');

// Datos de ejemplo para productos (sin columna Bodega)
const productos = [
  {
    'Código': '3',
    'Nombre': 'Anillo de Oro 18K',
    'Valor Total Compra': 10000000,
    'Cantidad': 10,
    'Gramaje Total': 500,
    'Valor Unitario Venta': 1500000,
    'Stock': 2,

  },
  {
    'Código': '4',
    'Nombre': 'Anillo de plata 925',
    'Valor Total Compra': 100000000,
    'Cantidad': 20,
    'Gramaje Total': 1000,
    'Valor Unitario Venta': 600000,
    'Stock': 3,
  },
  {
    'Código': '5',
    'Nombre': 'Anillo de acero inoxidable',
    'Valor Total Compra': 5000000,
    'Cantidad': 40,
    'Gramaje Total': 1500,
    'Valor Unitario Venta': 150000,
    'Stock': 5,
  },
  {
    'Código': '6',
    'Nombre': 'Anillo de titanio',
    'Valor Total Compra': 6000000 ,
    'Cantidad': 50,
    'Gramaje Total': 1700,
    'Valor Unitario Venta': 180000,
    'Stock': 10,
  },
  {
    'Código': '7',
    'Nombre': 'Anillo de tungsteno',
    'Valor Total Compra': 3000000,
    'Cantidad': 35,
    'Gramaje Total': 800,
    'Valor Unitario Venta': 100000,
    'Stock': 5,
  },
  {
    'Código': '8',
    'Nombre': 'Cadena de oro 18K',
    'Valor Total Compra': 20000000 ,
    'Cantidad': 7,
    'Gramaje Total': 850,
    'Valor Unitario Venta': 3000000,
    'Stock': 1,
  },
  {
    'Código': '9',
    'Nombre': 'Cadena de plata 925',
    'Valor Total Compra': 15000000,
    'Cantidad': 15,
    'Gramaje Total': 1900,
    'Valor Unitario Venta': 1100000,
    'Stock': 3,
  },
  {
    'Código': '10',
    'Nombre': 'Cadena de acero inoxidable',
    'Valor Total Compra': 5250000,
    'Cantidad': 25,
    'Gramaje Total': 2000,
    'Valor Unitario Venta': 260000,
    'Stock': 5,
  },
  {
    'Código': '11',
    'Nombre': 'Cadena de titanio',
    'Valor Total Compra': 7500000,
    'Cantidad': 15,
    'Gramaje Total': 1800,
    'Valor Unitario Venta': 600000,
    'Stock': 5,
  },
  {
    'Código': '12',
    'Nombre': 'Cadena de tungsteno',
    'Valor Total Compra': 3600000,
    'Cantidad': 45,
    'Gramaje Total': 4600,
    'Valor Unitario Venta': 100000,
    'Stock': 10,
  },
  {
    'Código': '13',
    'Nombre': 'Pendiente de oro 18K',
    'Valor Total Compra': 8000000,
    'Cantidad': 5,
    'Gramaje Total': 100,
    'Valor Unitario Venta': 2000000,
    'Stock': 1,
  },
  {
    'Código': '14',
    'Nombre': 'Pendiente de plata 925',
    'Valor Total Compra': 5000000,
    'Cantidad': 15,
    'Gramaje Total': 1020,
    'Valor Unitario Venta': 400000,
    'Stock': 5,
  },
  {
    'Código': '15',
    'Nombre': 'Pendiente de acero inoxidable',
    'Valor Total Compra': 1500000,
    'Cantidad': 30,
    'Gramaje Total': 350,
    'Valor Unitario Venta': 80000,
    'Stock': 5,
  },
  {
    'Código': '16',
    'Nombre': 'Pendiente de titanio',
    'Valor Total Compra': 2200000,
    'Cantidad': 25,
    'Gramaje Total': 300,
    'Valor Unitario Venta': 120000,
    'Stock': 3,
  },
  {
    'Código': '17',
    'Nombre': 'Pendiente de tungsteno',
    'Valor Total Compra': 1500000,
    'Cantidad': 100,
    'Gramaje Total': 1500,
    'Valor Unitario Venta': 30000,
    'Stock': 100,
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
