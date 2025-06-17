# INSTRUCCIONES PARA IMPORTACIÓN MASIVA DE PRODUCTOS

## Archivo Excel Creado: `ejemplo_productos_importacion.xlsx`

### 📋 ESTRUCTURA REQUERIDA DEL ARCHIVO EXCEL:

**COLUMNAS OBLIGATORIAS** (deben tener estos nombres exactos):
1. **Código** - Identificador único del producto (ej: PRD001)
2. **Nombre** - Nombre descriptivo del producto
3. **Valor Total Compra** - Valor total pagado por el lote completo
4. **Cantidad** - Número de unidades compradas
5. **Valor Unitario Venta** - Precio al que se venderá cada unidad
6. **Stock** - Cantidad disponible en inventario
7. **Bodega** - Nombre de la bodega donde se almacenará

**COLUMNAS OPCIONALES:**
- **Gramaje Total** - Peso total del lote (si aplica)

### 🔧 CÁLCULOS AUTOMÁTICOS:

La aplicación calculará automáticamente:
- **Valor Unitario Compra** = Valor Total Compra ÷ Cantidad
- **Gramaje por Unidad** = Gramaje Total ÷ Cantidad (si se proporciona gramaje)
- **Código de Barras** = Se genera automáticamente usando el código del producto

### 📝 EJEMPLO DE DATOS:

| Código | Nombre | Valor Total Compra | Cantidad | Gramaje Total | Valor Unitario Venta | Stock | Bodega |
|--------|--------|-------------------|----------|---------------|---------------------|--------|--------|
| PRD001 | Arroz Diana 500g | 25000 | 50 | 25000 | 600 | 50 | Almacén Principal |
| PRD002 | Aceite Girasol 1L | 45000 | 30 | 30000 | 1800 | 30 | Almacén Principal |

### ⚠️ IMPORTANTE:

1. **No incluir** las columnas "Valor Unitario Compra" ni "Gramaje por Unidad" en el Excel
2. **Asegurar** que los nombres de las bodegas existan en el sistema
3. **Verificar** que los códigos de productos sean únicos
4. **Revisar** que todos los valores numéricos estén correctos

### 🚀 CÓMO USAR:

1. Abrir el archivo `ejemplo_productos_importacion.xlsx`
2. Modificar los datos según tus productos
3. Guardar el archivo
4. En la aplicación, hacer clic en "Importar desde Excel"
5. Seleccionar tu archivo Excel
6. Revisar la previsualización
7. Confirmar la importación

### 📊 VALIDACIONES:

La aplicación verificará:
- ✅ Que todas las columnas obligatorias estén presentes
- ✅ Que los códigos no estén duplicados
- ✅ Que las bodegas existan en el sistema
- ✅ Que los valores numéricos sean válidos

### 🔍 RESULTADO:

Por cada producto importado se creará:
- ✅ Registro en la base de datos de productos
- ✅ Código de barras único
- ✅ Entrada en la bodega correspondiente
- ✅ Cálculos automáticos aplicados

¡Listo para probar la importación masiva!
