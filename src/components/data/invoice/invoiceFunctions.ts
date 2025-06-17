'use client';

import { db } from "../../../firebase/Index";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

// Define the ProductInvoice interface locally to avoid dependency issues
interface ProductInvoice {
  id: string;
  nombreDelProducto: string;
  cantidad: number;
  gramajePorUnidad: number;
  gramajeTotal: number;
  precioDeVenta: number;
  iva: number;
  total: number;
}

// Cambiar el tipo de `setCompanyData` para que sea más explícito y evitar el uso de `any`
interface CompanyData {
  companyName: string;
  nit: string;
  address: string;
  city: string;
  email: string;
  phone: string;
}

// Asegurar que fetchCompanyData esté correctamente exportada
export const fetchCompanyData = async (setCompanyData: (data: CompanyData) => void) => {
  try {
    const companyCollection = collection(db, "company");
    const querySnapshot = await getDocs(companyCollection);

    if (!querySnapshot.empty) {
      const companyDoc = querySnapshot.docs[0];
      const data = companyDoc.data();

      setCompanyData({
        companyName: data.companyName || "SKY MOTION S.A.S",
        nit: data.nit || "901.119.460-6",
        address: data.address || "CRA 48 #17A SUR - 47 LC 101 ED. PORTUGAL",
        city: data.city || "Medellín - Colombia",
        email: data.email || "skymotion@skymotion.com.co",
        phone: data.phone || "(571) 3562097",
      });
    }
  } catch (error) {
    console.error("Error al obtener datos de la empresa:", error);
  }
};

export const descontarProductos = async (
  productos: { id: string; cantidad: number; nombreDelProducto: string; bodega: string | undefined }[]
) => {
  try {
    for (const producto of productos) {
      if (!producto.bodega) {
        console.error(`No se seleccionó una bodega para el producto ${producto.nombreDelProducto}`);
        continue;
      }

      const bodegaId = producto.bodega;
      const codigoProducto = producto.id;
      const cantidadADescontar = producto.cantidad;

      if (!codigoProducto || cantidadADescontar <= 0) {
        console.error(`Datos inválidos para el producto ${producto.nombreDelProducto}`);
        continue;
      }

      const productLocRef = collection(db, `cellars/${bodegaId}/productLoc`);
      const productLocSnapshot = await getDocs(productLocRef);

      const productDoc = productLocSnapshot.docs.find(
        (doc) => doc.data().codigoProducto === codigoProducto
      );

      if (productDoc) {
        const productData = productDoc.data();
        const nuevaCantidad = (productData.cantidad || 0) - cantidadADescontar;

        if (nuevaCantidad < 0) {
          console.error(`Cantidad insuficiente en la bodega ${bodegaId} para el producto ${producto.nombreDelProducto}`);
          continue;
        }

        const productDocRef = doc(db, `cellars/${bodegaId}/productLoc`, productDoc.id);
        await updateDoc(productDocRef, { cantidad: nuevaCantidad });
        console.log(`Cantidad actualizada para el producto ${producto.nombreDelProducto} en la bodega ${bodegaId}`);
      } else {
        console.error(`Producto ${producto.nombreDelProducto} no encontrado en la bodega ${bodegaId}`);
      }
    }
  } catch (error) {
    console.error("Error al descontar productos:", error);
  }
};

// Asegurar que calculateCost esté correctamente exportada
export const calculateCost = async (
  productos: { id: string; cantidad: number; nombreDelProducto: string }[]
) => {
  let totalCost = 0;

  try {
    const productCollection = collection(db, "products");
    const costSaleCollection = collection(db, "costSale");
    const querySnapshot = await getDocs(productCollection);
    const costSaleSnapshot = await getDocs(costSaleCollection);

    for (const producto of productos) {
      const productDoc = querySnapshot.docs.find(
        (doc) => doc.data().codigo === producto.id
      );

      if (productDoc) {
        const productData = productDoc.data();
        const valorUnitarioCompra = productData.valorUnitarioCompra || 0;
        const costoProducto = valorUnitarioCompra * producto.cantidad;
        totalCost += costoProducto;

        // Verificar si el registro ya existe en la colección "costSale"
        const existingCostDoc = costSaleSnapshot.docs.find(
          (doc) => doc.data().codigo === producto.id
        );

        if (existingCostDoc) {
          // Actualizar el registro existente en "costSale"
          const costDocRef = doc(db, "costSale", existingCostDoc.id);
          const existingData = existingCostDoc.data();
          await updateDoc(costDocRef, {
            cantidad: (existingData.cantidad || 0) + producto.cantidad,
            costo: (existingData.costo || 0) + costoProducto,
          });
        } else {
          // Crear un nuevo registro si no existe
          await addDoc(costSaleCollection, {
            fecha: new Date().toISOString(),
            codigo: producto.id,
            descripcion: producto.nombreDelProducto,
            cantidad: producto.cantidad,
            costo: costoProducto,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error al calcular y registrar el costo de la venta:", error);
  }

  return totalCost;
};

export const registerSales = async (
  productos: { id: string; nombreDelProducto: string; cantidad: number; precioDeVenta: number }[]
) => {
  try {
    const salesCollection = collection(db, "salesInfo");
    const querySnapshot = await getDocs(salesCollection);

    for (const producto of productos) {
      const existingDoc = querySnapshot.docs.find(
        (doc) => doc.data().codigo === producto.id
      );

      const valorTotalVenta = producto.cantidad * producto.precioDeVenta;

      if (existingDoc) {
        // Actualizar el registro existente
        const salesDocRef = doc(db, "salesInfo", existingDoc.id);
        const existingData = existingDoc.data();
        await updateDoc(salesDocRef, {
          cantidad: (existingData.cantidad || 0) + producto.cantidad,
          valorUnitarioVenta: (existingData.valorUnitarioVenta || 0) + valorTotalVenta,
        });
      } else {
        // Crear un nuevo registro si no existe
        await addDoc(salesCollection, {
          fecha: new Date().toISOString(),
          codigo: producto.id,
          descripcion: producto.nombreDelProducto,
          cantidad: producto.cantidad,
          valorUnitarioVenta: valorTotalVenta,
        });
      }
    }
    console.log("Ventas registradas/actualizadas exitosamente en la colección salesInfo.");
  } catch (error) {
    console.error("Error al registrar/actualizar las ventas en salesInfo:", error);
  }
};

export const registerSaleWithDetails = async (
  productos: { 
    id: string; 
    nombreDelProducto: string; 
    cantidad: number; 
    gramajePorUnidad: number;
    gramajeTotal: number;
    precioDeVenta: number; 
    iva: number; 
  }[],
  totalVenta: number
) => {
  try {
    // Crear un nuevo documento en la colección `sales`
    const saleDocRef = await addDoc(collection(db, "sales"), {
      fecha: new Date().toISOString(),
      total: totalVenta,
      imagen: "", // Campo para la imagen, actualmente vacío
    });

    // Agregar los detalles de los productos vendidos como una subcolección
    for (const producto of productos) {
      const totalProducto = producto.cantidad * producto.precioDeVenta;
      await addDoc(collection(saleDocRef, "detalle"), {
        codigo: producto.id,
        nombreProducto: producto.nombreDelProducto,
        gramajePorUnidad: producto.gramajePorUnidad,
        gramajeTotal: producto.gramajeTotal,
        valorUnitarioVenta: producto.precioDeVenta,
        iva: producto.iva,
        cantidad: producto.cantidad,
        total: totalProducto,
      });
    }

    console.log("Venta registrada exitosamente en la colección sales.");
  } catch (error) {
    console.error("Error al registrar la venta en sales:", error);
  }
};

export const applyGlobalStyleFix = () => {
  const style = document.createElement("style");
  style.id = "global-oklch-fix";
  style.innerHTML = `
    * {
      color: initial !important;
      background-color: initial !important;
      border-color: initial !important;
    }
  `;
  document.head.appendChild(style);
};

export const removeGlobalStyleFix = () => {
  const style = document.getElementById("global-oklch-fix");
  if (style) {
    document.head.removeChild(style);
  }
};

export const replaceInputsWithStaticContent = (element: HTMLElement) => {
  const inputs = element.querySelectorAll("input, textarea, select");
  inputs.forEach((input) => {
    const parent = input.parentElement;
    if (parent) {
      const staticElement = document.createElement("div");
      staticElement.textContent = (input as HTMLInputElement).value || "";

      // Copiar estilos relevantes del input
      const computedStyle = window.getComputedStyle(input);
      staticElement.style.cssText = computedStyle.cssText;
      staticElement.style.whiteSpace = "pre-wrap"; // Asegurar que los saltos de línea se respeten
      staticElement.style.backgroundColor = "transparent"; // Fondo transparente
      staticElement.style.border = "none"; // Sin bordes
      staticElement.style.outline = "none"; // Sin contorno
      staticElement.style.boxShadow = "none"; // Sin sombra

      parent.replaceChild(staticElement, input);
    }
  });
};

export const copyComputedStyles = (source: HTMLElement, target: HTMLElement) => {
  const computed = window.getComputedStyle(source);
  for (const prop of computed) {
    target.style.setProperty(prop, computed.getPropertyValue(prop));
  }

  const sourceChildren = source.children;
  const targetChildren = target.children;
  for (let i = 0; i < sourceChildren.length; i++) {
    copyComputedStyles(
      sourceChildren[i] as HTMLElement,
      targetChildren[i] as HTMLElement
    );
  }
};

export const hideInteractiveElements = (element: HTMLElement) => {
  const buttons = element.querySelectorAll("button");
  buttons.forEach((button) => {
    if (
      button.textContent?.includes("Agregar producto") ||
      button.textContent?.includes("Exportar a PDF")
    ) {
      (button as HTMLElement).style.visibility = "hidden";
    }
  });

  const inputs = element.querySelectorAll("input, textarea, select");
  inputs.forEach((input) => {
    if (!input.closest("table")) {
      (input as HTMLElement).style.border = "none";
      (input as HTMLElement).style.outline = "none";
      (input as HTMLElement).style.boxShadow = "none";
    }
  });
};

export const hideBodegaAndAccionColumns = () => {
  const bodegaHeaders = document.querySelectorAll(
    "th:nth-child(6), td:nth-child(6)"
  );
  const accionHeaders = document.querySelectorAll(
    "th:nth-child(10), td:nth-child(10)"
  );

  bodegaHeaders.forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });

  accionHeaders.forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });
};

export const showBodegaAndAccionColumns = () => {
  const bodegaHeaders = document.querySelectorAll(
    "th:nth-child(6), td:nth-child(6)"
  );
  const accionHeaders = document.querySelectorAll(
    "th:nth-child(10), td:nth-child(10)"
  );

  bodegaHeaders.forEach((el) => {
    (el as HTMLElement).style.display = "table-cell";
  });

  accionHeaders.forEach((el) => {
    (el as HTMLElement).style.display = "table-cell";
  });
};

export const fetchClients = async (setAllClients: (clients: any[]) => void) => {
  try {
    const querySnapshot = await getDocs(collection(db, "clients"));
    const clients = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllClients(clients);
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  }
};

export const fetchSuppliers = async (setAllSuppliers: (suppliers: any[]) => void) => {
  try {
    const querySnapshot = await getDocs(collection(db, "suppliers"));
    const suppliers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllSuppliers(suppliers);
  } catch (error) {
    console.error("Error al obtener los proveedores:", error);
  }
};

export const fetchProducts = async (setAllProducts: (products: any[]) => void) => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllProducts(products);
  } catch (error) {
    console.error("Error al obtener los productos:", error);
  }
};

export const initializeProduct = (): ProductInvoice => ({
  id: "",
  nombreDelProducto: "",
  cantidad: 1,
  gramajePorUnidad: 0,
  gramajeTotal: 0,
  precioDeVenta: 0,
  iva: 19,
  total: 0,
});

export const descontarGramajeProductos = async (
  productos: { id: string; cantidad: number; gramajePorUnidad: number; nombreDelProducto: string }[]
) => {
  try {
    for (const producto of productos) {
      const codigoProducto = producto.id;
      const gramajeADescontar = producto.cantidad * producto.gramajePorUnidad;

      if (!codigoProducto || gramajeADescontar <= 0) {
        console.error(`Datos inválidos para descontar gramaje del producto ${producto.nombreDelProducto}`);
        continue;
      }

      // Buscar el producto en la colección products
      const productCollection = collection(db, "products");
      const querySnapshot = await getDocs(productCollection);
      
      const productDoc = querySnapshot.docs.find(
        (doc) => doc.data().codigo === codigoProducto
      );

      if (productDoc) {
        const productData = productDoc.data();
        const gramajeActual = parseFloat(productData.gramaje) || 0;
        const nuevoGramaje = gramajeActual - gramajeADescontar;

        if (nuevoGramaje < 0) {
          console.warn(`Gramaje insuficiente para el producto ${producto.nombreDelProducto}. Gramaje actual: ${gramajeActual}, a descontar: ${gramajeADescontar}`);
          // Decidir si continuar o establecer en 0
          const gramajeDescontado = Math.max(0, nuevoGramaje);
          
          const productDocRef = doc(db, "products", productDoc.id);
          await updateDoc(productDocRef, { gramaje: gramajeDescontado.toString() });
          console.log(`Gramaje actualizado para el producto ${producto.nombreDelProducto}: ${gramajeDescontado}`);
        } else {
          const productDocRef = doc(db, "products", productDoc.id);
          await updateDoc(productDocRef, { gramaje: nuevoGramaje.toString() });
          console.log(`Gramaje actualizado para el producto ${producto.nombreDelProducto}: ${nuevoGramaje}`);
        }
      } else {
        console.error(`Producto ${producto.nombreDelProducto} no encontrado en la colección products`);
      }
    }
  } catch (error) {
    console.error("Error al descontar gramaje de productos:", error);
  }
};

export const actualizarCuentaSeleccionada = async (
  nombreCuenta: string,
  montoAAgregar: number
) => {
  try {
    if (!nombreCuenta || montoAAgregar <= 0) {
      console.error("Datos inválidos para actualizar la cuenta", { nombreCuenta, montoAAgregar });
      return;
    }

    // Buscar la cuenta en la colección account
    const accountCollection = collection(db, "account");
    const querySnapshot = await getDocs(accountCollection);
    
    const accountDoc = querySnapshot.docs.find(
      (doc) => doc.data().accountName === nombreCuenta
    );

    if (accountDoc) {
      const accountData = accountDoc.data();
      const montoActual = accountData.initialAmount || 0;
      const nuevoMonto = montoActual + montoAAgregar;

      const accountDocRef = doc(db, "account", accountDoc.id);
      await updateDoc(accountDocRef, { initialAmount: nuevoMonto });
      
      console.log(`Cuenta actualizada: ${nombreCuenta}. Monto anterior: ${montoActual}, Monto agregado: ${montoAAgregar}, Nuevo monto: ${nuevoMonto}`);
    } else {
      console.error(`Cuenta no encontrada: ${nombreCuenta}`);
    }
  } catch (error) {
    console.error("Error al actualizar la cuenta seleccionada:", error);
  }
};

// ===== FUNCIONES PARA COMPRAS =====

// Función para calcular el costo total de la compra (igual que calculateCost pero con nombres más claros)
export const calculatePurchaseCost = async (productos: any[]) => {
  return await calculateCost(productos); // Reutiliza la función existente
};

// Función para aumentar productos en el inventario (opuesto a descontarProductos)
export const aumentarProductos = async (productosComprados: any[]) => {
  try {
    for (const producto of productosComprados) {
      const codigoProducto = producto.id;
      const cantidadAAgregar = producto.cantidad;
      const bodegaId = producto.bodega;

      if (!codigoProducto || !cantidadAAgregar || !bodegaId) {
        console.warn("Datos incompletos para aumentar producto:", producto);
        continue;
      }

      // Buscar el producto en la subcolección productLoc de la bodega
      const productLocCollection = collection(db, `cellars/${bodegaId}/productLoc`);
      const querySnapshot = await getDocs(productLocCollection);
      
      const productDoc = querySnapshot.docs.find(
        (doc) => doc.data().codigoProducto === codigoProducto
      );

      if (productDoc) {
        // Si el producto existe, aumentar la cantidad
        const currentData = productDoc.data();
        const cantidadActual = currentData.cantidad || 0;
        const nuevaCantidad = cantidadActual + cantidadAAgregar;

        const productDocRef = doc(db, `cellars/${bodegaId}/productLoc`, productDoc.id);
        await updateDoc(productDocRef, { cantidad: nuevaCantidad });
        
        console.log(`Cantidad aumentada para ${producto.nombreDelProducto} en bodega ${bodegaId}: ${cantidadActual} -> ${nuevaCantidad}`);
      } else {
        // Si el producto no existe en la bodega, crearlo
        await addDoc(productLocCollection, {
          codigoProducto: codigoProducto,
          cantidad: cantidadAAgregar,
          nombreProducto: producto.nombreDelProducto
        });
        
        console.log(`Producto ${producto.nombreDelProducto} agregado a bodega ${bodegaId} con cantidad: ${cantidadAAgregar}`);
      }
    }
  } catch (error) {
    console.error("Error al aumentar productos en el inventario:", error);
  }
};

// Función para registrar la compra en la colección purchases
export const registerPurchaseWithDetails = async (productos: any[], totalCompra: number) => {
  try {
    // Crear un nuevo documento en la colección `purchases`
    const purchaseDocRef = await addDoc(collection(db, "purchases"), {
      fecha: new Date().toISOString(),
      total: totalCompra,
      imagen: "", // Campo para la imagen, actualmente vacío
    });

    // Agregar los detalles de los productos comprados como una subcolección
    for (const producto of productos) {
      const totalProducto = producto.cantidad * producto.precioDeVenta;
      await addDoc(collection(purchaseDocRef, "detalle"), {
        codigo: producto.id,
        nombreProducto: producto.nombreDelProducto,
        valorUnitarioCompra: producto.precioDeVenta,
        iva: producto.iva,
        cantidad: producto.cantidad,
        total: totalProducto,
        gramajePorUnidad: producto.gramajePorUnidad,
        gramajeTotal: producto.gramajeTotal,
        bodega: producto.bodega,
      });
    }

    console.log("Compra registrada exitosamente en la colección purchases.");
  } catch (error) {
    console.error("Error al registrar la compra en purchases:", error);
  }
};

// Función para aumentar gramaje de los productos (opuesto a descontarGramajeProductos)
export const aumentarGramajeProductos = async (productos: any[]) => {
  try {
    for (const producto of productos) {
      const codigoProducto = producto.id;
      const gramajeAAgregar = producto.cantidad * producto.gramajePorUnidad;

      if (!codigoProducto || gramajeAAgregar <= 0) {
        console.warn("Datos inválidos para aumentar gramaje", { producto, gramajeAAgregar });
        continue;
      }

      // Buscar el producto en la colección products
      const productCollection = collection(db, "products");
      const querySnapshot = await getDocs(productCollection);
      
      const productDoc = querySnapshot.docs.find(
        (doc) => doc.data().codigo === codigoProducto
      );

      if (productDoc) {
        const productData = productDoc.data();
        const gramajeActual = parseFloat(productData.gramaje) || 0;
        const nuevoGramaje = gramajeActual + gramajeAAgregar;

        const productDocRef = doc(db, "products", productDoc.id);
        await updateDoc(productDocRef, { gramaje: nuevoGramaje.toString() });
        console.log(`Gramaje aumentado para el producto ${producto.nombreDelProducto}: ${gramajeActual} -> ${nuevoGramaje}`);
      } else {
        console.error(`Producto ${producto.nombreDelProducto} no encontrado en la colección products`);
      }
    }
  } catch (error) {
    console.error("Error al aumentar gramaje de productos:", error);
  }
};

// Función para descontar el monto de la cuenta seleccionada (opuesto a actualizarCuentaSeleccionada)
export const descontarCuentaSeleccionada = async (
  nombreCuenta: string,
  montoADescontar: number
) => {
  try {
    if (!nombreCuenta || montoADescontar <= 0) {
      console.error("Datos inválidos para descontar de la cuenta", { nombreCuenta, montoADescontar });
      return;
    }

    // Buscar la cuenta en la colección account
    const accountCollection = collection(db, "account");
    const querySnapshot = await getDocs(accountCollection);
    
    const accountDoc = querySnapshot.docs.find(
      (doc) => doc.data().accountName === nombreCuenta
    );

    if (accountDoc) {
      const accountData = accountDoc.data();
      const montoActual = accountData.initialAmount || 0;
      const nuevoMonto = Math.max(0, montoActual - montoADescontar); // No permitir valores negativos

      const accountDocRef = doc(db, "account", accountDoc.id);
      await updateDoc(accountDocRef, { initialAmount: nuevoMonto });
      
      console.log(`Cuenta descontada: ${nombreCuenta}. Monto anterior: ${montoActual}, Monto descontado: ${montoADescontar}, Nuevo monto: ${nuevoMonto}`);
      
      if (montoActual < montoADescontar) {
        console.warn(`El monto a descontar (${montoADescontar}) es mayor que el saldo actual (${montoActual}). El saldo se estableció en 0.`);
      }
    } else {
      console.error(`Cuenta no encontrada: ${nombreCuenta}`);
    }
  } catch (error) {
    console.error("Error al descontar de la cuenta seleccionada:", error);
  }
};
