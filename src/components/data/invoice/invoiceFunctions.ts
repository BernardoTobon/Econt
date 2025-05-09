'use client';

import { db } from "../../../firebase/Index";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

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
  productos: { id: string; cantidad: number; nombreDelProducto: string }[]
) => {
  try {
    for (const producto of productos) {
      const productRef = collection(db, "products");
      const querySnapshot = await getDocs(productRef);

      querySnapshot.forEach(async (docSnapshot) => {
        const data = docSnapshot.data();
        if (data.codigo === producto.id) {
          const nuevaCantidad = (data.cantidad || 0) - producto.cantidad;
          if (nuevaCantidad < 0) {
            console.warn(
              `Cantidad insuficiente para el producto: ${producto.nombreDelProducto}`
            );
          } else {
            const productDocRef = doc(db, "products", docSnapshot.id);
            await updateDoc(productDocRef, { cantidad: nuevaCantidad });
          }
        }
      });
    }
  } catch (error) {
    console.error("Error al descontar productos:", error);
  }
};

// Asegurar que calculateCost esté correctamente exportada
export const calculateCost = async (productos: { id: string; cantidad: number; nombreDelProducto: string }[]) => {
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

        // Actualizar el registro existente en la colección "products"
        const productDocRef = doc(db, "products", productDoc.id);
        await updateDoc(productDocRef, {
          cantidad: (productData.cantidad || 0) - producto.cantidad,
        });

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

export const registerSales = async (productos: { id: string; nombreDelProducto: string; cantidad: number; precioDeVenta: number }[]) => {
  try {
    for (const producto of productos) {
      const salesCollection = collection(db, "salesInfo");
      const querySnapshot = await getDocs(salesCollection);

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
