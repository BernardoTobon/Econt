import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../../../firebase/Index";

/**
 * Genera un código de barras único para un producto
 * @param productCode - Código del producto
 * @returns Código de barras único
 */
export const generateBarcodeValue = (productCode: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `CONT${productCode}${timestamp}${random}`;
};

/**
 * Valida si un código de barras ya existe en la base de datos
 * @param barcodeValue - Valor del código de barras a validar
 * @returns Promise<boolean> - true si ya existe, false si no existe
 */
export const barcodeExists = async (barcodeValue: string): Promise<boolean> => {
  try {
    const db = getFirestore(app);
    const q = query(collection(db, "products"), where("codigoBarras", "==", barcodeValue));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking barcode existence:", error);
    return false;
  }
};

/**
 * Busca un producto por su código de barras
 * @param barcodeValue - Valor del código de barras
 * @returns Promise<any | null> - Producto encontrado o null
 */
export const findProductByBarcode = async (barcodeValue: string): Promise<any | null> => {
  try {
    const db = getFirestore(app);
    const q = query(collection(db, "products"), where("codigoBarras", "==", barcodeValue));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const productDoc = snapshot.docs[0];
      return { id: productDoc.id, ...productDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error finding product by barcode:", error);
    return null;
  }
};

/**
 * Busca las ubicaciones de un producto en las bodegas
 * @param productCode - Código del producto
 * @returns Promise<any[]> - Array de ubicaciones del producto
 */
export const findProductLocations = async (productCode: string): Promise<any[]> => {
  try {
    const db = getFirestore(app);
    const locations: any[] = [];
    
    // Buscar en todas las bodegas
    const cellarsSnapshot = await getDocs(collection(db, "cellars"));
    
    for (const cellarDoc of cellarsSnapshot.docs) {
      const cellarData = cellarDoc.data();
      const productLocQuery = query(
        collection(db, "cellars", cellarDoc.id, "productLoc"),
        where("codigoProducto", "==", productCode)
      );
      const productLocSnapshot = await getDocs(productLocQuery);
      
      if (!productLocSnapshot.empty) {
        productLocSnapshot.docs.forEach(doc => {
          locations.push({
            cellarName: cellarData.cellarName,
            cellarId: cellarDoc.id,
            ...doc.data()
          });
        });
      }
    }
    
    return locations;
  } catch (error) {
    console.error("Error finding product locations:", error);
    return [];
  }
};

/**
 * Genera un código de barras único que no exista en la base de datos
 * @param productCode - Código del producto
 * @returns Promise<string> - Código de barras único
 */
export const generateUniqueBarcodeValue = async (productCode: string): Promise<string> => {
  let barcodeValue: string;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    barcodeValue = generateBarcodeValue(productCode);
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error("No se pudo generar un código de barras único después de varios intentos");
    }
  } while (await barcodeExists(barcodeValue));
  
  return barcodeValue;
};
