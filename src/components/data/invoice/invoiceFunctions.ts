'use client';

import { db } from "../../../firebase/Index";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

// Define the ProductInvoice interface locally to avoid dependency issues
interface ProductInvoice {
  id: string;
  nombreDelProducto: string;
  cantidad: number;
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
  productos: { id: string; nombreDelProducto: string; cantidad: number; precioDeVenta: number; iva: number }[],
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
    "th:nth-child(5), td:nth-child(5)"
  );
  const accionHeaders = document.querySelectorAll(
    "th:nth-child(9), td:nth-child(9)"
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
    "th:nth-child(5), td:nth-child(5)"
  );
  const accionHeaders = document.querySelectorAll(
    "th:nth-child(9), td:nth-child(9)"
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
  precioDeVenta: 0,
  iva: 19,
  total: 0,
});
