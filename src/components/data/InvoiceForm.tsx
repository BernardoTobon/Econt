"use client";

import React, { useState, useEffect } from "react";
import { db } from "../../firebase/Index";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import AddClient from "./AddClient";
import RegisterProduct from "./RegisterProduct";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatCurrencyToWords } from "../../utils/formatCurrency";
import * as invoiceFunctions from "./invoice/invoiceFunctions";
import ClientDetails from "./invoice/ClientDetails";
import {
  registerSales,
  registerSaleWithDetails,
} from "./invoice/invoiceFunctions";

// Estructura de producto para la factura
interface ProductInvoice {
  id: string;
  nombreDelProducto: string;
  cantidad: number;
  precioDeVenta: number;
  iva: number;
  total: number;
  bodega?: string; // Added optional bodega property
  bodegas?: { id: string; nombre: string }[]; // Added bodegas property to store bodega names
}

interface CompanyData {
  companyName: string;
  nit: string;
  address: string;
  city: string;
  email: string;
  phone: string;
}

// Estado para los datos del cliente
export const InvoiceForm: React.FC = () => {
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: "",
    nit: "",
    address: "",
    city: "",
    email: "",
    phone: "",
  });

  const [cliente, setCliente] = useState({
    razonSocialONombreCompleto: "",
    numeroDeIdentificacion: "",
    celular: "",
    direccion: "",
    municipiosDepartamentos: "",
  });
  const [search, setSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const handleAddClientClick = () => {
    setShowAddClientModal(true);
    setShowDropdown(false); // Ocultar el dropdown al abrir el modal
  };

  const closeAddClientModal = () => {
    setShowAddClientModal(false);
  };

  // Cargar datos de la empresa
  useEffect(() => {
    invoiceFunctions.fetchCompanyData(setCompanyData);
  }, []);

  const handleClientCreated = (newClient: any) => {
    setCliente({
      razonSocialONombreCompleto: newClient.fullName,
      numeroDeIdentificacion: newClient.idNumber,
      celular: newClient.celular,
      direccion: newClient.address,
      municipiosDepartamentos: newClient.city,
    });
    setSearch(newClient.fullName);
    setAllClients((prevClients) => [...prevClients, newClient]); // Agregar el nuevo cliente a la lista
    setShowAddClientModal(false); // Cerrar el modal después de crear el cliente
  };

  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clients"));
      const clients = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllClients(clients);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (search.length === 0) {
      setFilteredClients(allClients.slice(-3)); // Mostrar solo los últimos 3 registros
    } else {
      setFilteredClients(
        allClients
          .filter((client) =>
            client.fullName.toLowerCase().includes(search.toLowerCase())
          )
          .slice(-3) // Filtrar y limitar a los últimos 3
      );
    }
  }, [search, allClients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#nombreCompletoDropdown")) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleClientSelect = (client: any) => {
    setCliente({
      razonSocialONombreCompleto: client.fullName,
      numeroDeIdentificacion: client.idNumber,
      celular: client.celular,
      direccion: client.address,
      municipiosDepartamentos: client.city,
    });
    setSearch(client.fullName);
    setShowDropdown(false);
  };

  // Estado para los productos
  const [productos, setProductos] = useState<ProductInvoice[]>([
    {
      id: "",
      nombreDelProducto: "",
      cantidad: 1,
      precioDeVenta: 0,
      iva: 19,
      total: 0,
    },
  ]);

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<{
    index: number;
    field: "id" | "nombreDelProducto";
  } | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const handleAddProductClick = () => {
    setShowAddProductModal(true);
    setShowProductDropdown(false); // Ocultar el dropdown al abrir el modal
  };

  const closeAddProductModal = () => {
    setShowAddProductModal(false);
  };

  const handleProductCreated = (newProduct: any) => {
    const nuevosProductos = [...productos];
    nuevosProductos[0] = {
      ...nuevosProductos[0],
      id: newProduct.codigo,
      nombreDelProducto: newProduct.nombre,
    };
    setProductos(nuevosProductos);
    setAllProducts((prevProducts) => [...prevProducts, newProduct]); // Agregar el nuevo producto a la lista
    setShowAddProductModal(false); // Cerrar el modal después de crear el producto
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllProducts(products);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchProduct.length === 0) {
      setFilteredProducts(allProducts.slice(-3)); // Mostrar solo los últimos 3 registros
    } else {
      setFilteredProducts(
        allProducts
          .filter(
            (product) =>
              product.codigo
                .toLowerCase()
                .includes(searchProduct.toLowerCase()) ||
              product.nombre.toLowerCase().includes(searchProduct.toLowerCase())
          )
          .slice(-3) // Filtrar y limitar a los últimos 3
      );
    }
  }, [searchProduct, allProducts]);

  // Función para inicializar una fila de producto
  const inicializarProducto = (): ProductInvoice => ({
    id: "",
    nombreDelProducto: "",
    cantidad: 1,
    precioDeVenta: 0,
    iva: 19,
    total: 0,
  });

  // Actualizar la función handleProductSelect para calcular y formatear el valor total
const handleProductSelect = async (index: number, product: any) => {
  console.log("handleProductSelect - Inicio", { index, product });

  const targetIndex = activeDropdown ? activeDropdown.index : index;

  setProductos((prevProductos) => {
    const nuevosProductos = [...prevProductos];

    while (nuevosProductos.length <= targetIndex) {
      nuevosProductos.push(inicializarProducto());
    }

    const valorUnitario = product.valorUnitarioVenta;
    const cantidad = nuevosProductos[targetIndex].cantidad || 1;
    const valorTotal = cantidad * valorUnitario;

    nuevosProductos[targetIndex] = {
      ...nuevosProductos[targetIndex],
      id: product.codigo,
      nombreDelProducto: product.nombre,
      precioDeVenta: valorUnitario,
      cantidad,
      total: valorTotal,
    };

    return nuevosProductos;
  });

  try {
    const bodegasSnapshot = await getDocs(
      collection(db, `products/${product.codigo}/bodegas`)
    );
    const bodegas = bodegasSnapshot.docs.map((doc) => ({
      id: doc.id,
      nombre: doc.data().nombre || "Sin nombre",
    }));

    setProductos((prevProductos) => {
      const nuevosProductos = [...prevProductos];
      nuevosProductos[targetIndex].bodegas = bodegas;
      return nuevosProductos;
    });
  } catch (error) {
    console.error("Error al obtener las bodegas:", error);
  }

  setSearchProduct("");
  setActiveDropdown(null);
  console.log("handleProductSelect - Fin");
};

  const handleProductoInputChange = (
    index: number,
    field: string,
    value: string
  ) => {
    console.log("handleProductoInputChange - Inicio", { index, field, value });

    // Actualizar el producto correspondiente
    setProductos((prevProductos) => {
      const nuevosProductos = [...prevProductos];

      // Asegurar que la fila existe antes de modificarla
      if (index >= nuevosProductos.length) {
        console.error("Índice fuera de rango", { index, nuevosProductos });
        return prevProductos; // No modificar si el índice es inválido
      }

      nuevosProductos[index] = {
        ...nuevosProductos[index],
        [field]:
          field === "cantidad" || field === "precioDeVenta" || field === "iva"
            ? Number(value)
            : value,
      };

      // Recalcular el total del producto
      if (field === "cantidad" || field === "precioDeVenta") {
        nuevosProductos[index].total =
          nuevosProductos[index].cantidad *
            nuevosProductos[index].precioDeVenta || 0;
      }

      return nuevosProductos;
    });

    // Solo actualizar la búsqueda y mostrar el dropdown para los campos de código y nombre
    if (field === "id" || field === "nombreDelProducto") {
      setSearchProduct(value);
      setActiveDropdown({ index, field: field as "id" | "nombreDelProducto" });
    }

    console.log("handleProductoInputChange - Fin");
  };

  const handleProductoInputFocus = (
    index: number,
    field: "id" | "nombreDelProducto"
  ) => {
    // Obtener el valor actual para usarlo como búsqueda inicial
    const currentValue = productos[index]
      ? field === "id"
        ? productos[index].id
        : productos[index].nombreDelProducto
      : "";

    setActiveDropdown({ index, field });
    setSearchProduct(currentValue);
  };

  const handleProductoInputBlur = () => {
    // Usar un setTimeout para permitir que el clic en el dropdown se procese antes de cerrarlo
    setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  // Nueva función para manejar el cambio de bodega y buscar en productLoc
  const [bodegaCantidad, setBodegaCantidad] = useState<{ [key: number]: number | "" }>({});

  const handleBodegaChange = async (index: number, bodegaId: string) => {
    try {
      // Actualizar la bodega seleccionada
      setProductos((prevProductos) => {
        const nuevosProductos = [...prevProductos];
        nuevosProductos[index].bodega = bodegaId;
        return nuevosProductos;
      });

      // Obtener el código del producto seleccionado
      const codigoProducto = productos[index]?.id;
      if (!codigoProducto) return;

      // Buscar en la subcolección productLoc de la bodega seleccionada
      const productLocSnapshot = await getDocs(
        collection(db, `cellars/${bodegaId}/productLoc`)
      );

      const productData = productLocSnapshot.docs.find(
        (doc) => doc.data().codigoProducto === codigoProducto
      );

      // Asegurar que el valor 0 se establezca correctamente en el estado
      if (productData) {
        const cantidad = productData.data().cantidad;
        setBodegaCantidad((prev) => ({ ...prev, [index]: cantidad }));
      } else {
        setBodegaCantidad((prev) => ({ ...prev, [index]: 0 })); // Establecer 0 si no hay cantidad
      }
    } catch (error) {
      console.error("Error al buscar en productLoc:", error);
    }
  };

  // Estado para totales y otros campos
  const [totalIVA, setTotalIVA] = useState(0);
  const [totalDescuento, setTotalDescuento] = useState(0);
  const [totalVenta, setTotalVenta] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [guia, setGuia] = useState("");
  const [referenciaPago, setReferenciaPago] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(""); // Estado inicial vacío para el dropdown

  // Estado para vista previa y exportación a PDF
  const [showPreview, setShowPreview] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  const applyGlobalStyleFix = () => {
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

  const removeGlobalStyleFix = () => {
    const style = document.getElementById("global-oklch-fix");
    if (style) {
      document.head.removeChild(style);
    }
  };

  const replaceInputsWithStaticContent = (element: HTMLElement) => {
    const inputs = element.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      const parent = input.parentElement;
      if (parent) {
        const staticElement = document.createElement("div");
        staticElement.textContent = (input as HTMLInputElement).value || "";
        staticElement.style.cssText = window.getComputedStyle(input).cssText;
        staticElement.style.whiteSpace = "pre-wrap"; // Asegurar que los saltos de línea se respeten
        parent.replaceChild(staticElement, input);
      }
    });
  };

  const copyComputedStyles = (source: HTMLElement, target: HTMLElement) => {
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

  const hideInteractiveElements = (element: HTMLElement) => {
    // Hacer invisibles los botones de agregar producto y exportar a PDF
    const buttons = element.querySelectorAll("button");
    buttons.forEach((button) => {
      if (
        button.textContent?.includes("Agregar producto") ||
        button.textContent?.includes("Exportar a PDF")
      ) {
        (button as HTMLElement).style.visibility = "hidden";
      }
    });

    // Eliminar bordes de los inputs
    const inputs = element.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      (input as HTMLElement).style.border = "none";
      (input as HTMLElement).style.outline = "none";
      (input as HTMLElement).style.boxShadow = "none";
    });
  };

  const generatePdfAndDownload = async () => {
    const invoiceElement = document.querySelector(".max-w-4xl") as HTMLElement;
    if (!invoiceElement) {
      alert("No se encontró la factura para exportar.");
      return;
    }

    try {
      applyGlobalStyleFix(); // Aplicar estilo global para evitar colores no compatibles

      // Clonar el nodo original para evitar modificar el DOM real
      const clone = invoiceElement.cloneNode(true) as HTMLElement;

      // SOLUCIÓN: Mejorar el reemplazo de inputs
      const allInputs = clone.querySelectorAll("input, textarea, select");
      allInputs.forEach((input) => {
        const inputElement = input as HTMLInputElement;
        const parent = inputElement.parentElement;

        if (parent) {
          // Crear un elemento de texto estático para reemplazar el input

          const staticElement = document.createElement("div");

          // Configurar el contenido basado en el tipo de input
          if (inputElement.type === "number" && inputElement.value) {
            // Para inputs numéricos, formatear como moneda si es un valor monetario
            if (
              inputElement.className.includes("text-right") ||
              parent.className.includes("text-right")
            ) {
              staticElement.textContent = Number(
                inputElement.value
              ).toLocaleString("es-CO");
            } else {
              staticElement.textContent = inputElement.value;
            }
          } else {
            staticElement.textContent = inputElement.value || "";
          }

          // Copiar los estilos relevantes del input
          const computedStyle = window.getComputedStyle(inputElement);
          staticElement.style.width = computedStyle.width;
          staticElement.style.padding = computedStyle.padding;
          staticElement.style.textAlign = computedStyle.textAlign;
          staticElement.style.fontSize = computedStyle.fontSize;
          staticElement.style.fontFamily = computedStyle.fontFamily;
          staticElement.style.color = computedStyle.color;
          staticElement.style.backgroundColor = "transparent";
          staticElement.style.border = "none";
          staticElement.style.outline = "none";
          staticElement.style.boxShadow = "none";
          staticElement.style.whiteSpace = "pre-wrap";

          // Realizar el reemplazo
          parent.replaceChild(staticElement, inputElement);
        }
      });

      // Eliminar completamente los botones de acción
      const actionButtons = clone.querySelectorAll("button");
      actionButtons.forEach((button) => {
        if (
          button.textContent?.includes("Agregar producto") ||
          button.textContent?.includes("Exportar a PDF") ||
          button.textContent?.includes("X")
        ) {
          if (button.parentElement) {
            button.parentElement.removeChild(button);
          }
        }
      });

      // Eliminar los dropdowns y elementos interactivos
      const dropdowns = clone.querySelectorAll("ul");
      dropdowns.forEach((dropdown) => {
        if (dropdown.parentElement) {
          dropdown.parentElement.removeChild(dropdown);
        }
      });

      // Agregar el clon a un contenedor oculto en el DOM
      const hiddenContainer = document.createElement("div");
      hiddenContainer.style.position = "fixed";
      hiddenContainer.style.top = "-10000px";
      hiddenContainer.style.left = "-10000px";
      hiddenContainer.style.width = "100vw";
      hiddenContainer.style.height = "100vh";
      hiddenContainer.style.overflow = "hidden";
      hiddenContainer.style.opacity = "0";
      hiddenContainer.style.zIndex = "-1";

      hiddenContainer.appendChild(clone);
      document.body.appendChild(hiddenContainer);

      await new Promise((res) => setTimeout(res, 300)); // Asegurar renderizado

      const canvas = await html2canvas(clone, {
        scale: 2, // Aumentar la escala para mayor calidad
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(hiddenContainer); // Limpiar el DOM
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // Ancho de la página A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantener proporción

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("Factura.pdf");

      alert("Factura exportada como PDF con éxito!");

      // Calcular el costo de la venta
      const costoVenta = await invoiceFunctions.calculateCost(productos);
      console.log("Costo total de la venta:", costoVenta);

      // Descontar productos después de generar el PDF
      await invoiceFunctions.descontarProductos(productos);

      // Registrar las ventas en la colección salesInfo
      await registerSales(productos);

      // Registrar la venta con detalles en la colección sales
      await registerSaleWithDetails(productos, totalVenta);
    } catch (error) {
      console.error("Error al exportar la factura:", error);
      alert("Hubo un error al exportar la factura: " + error);
    } finally {
      removeGlobalStyleFix(); // Eliminar el estilo global después de la captura
    }
  };

  const exportPdf = () => {
    if (pdfDataUrl) {
      const link = document.createElement("a");
      link.href = pdfDataUrl;
      link.download = "Factura.pdf";
      link.click();
    }
  };

  // Función para renderizar los inputs de productos
  const handleProductoChange = (index: number, field: string, value: any) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      [field]:
        field === "cantidad" || field === "precioDeVenta" || field === "iva"
          ? Number(value)
          : value,
    };
    // Calcular total del producto
    nuevosProductos[index].total =
      nuevosProductos[index].cantidad * nuevosProductos[index].precioDeVenta ||
      0;
    setProductos(nuevosProductos);
  };

  // Función para agregar un producto
  const agregarProducto = () => {
    console.log("agregarProducto - Inicio");
    debugger; // Punto de depuración para verificar el estado antes de agregar una fila
    setProductos((prevProductos) => {
      const nuevosProductos = [...prevProductos, inicializarProducto()];
      console.log("agregarProducto - Después de agregar", nuevosProductos);
      return nuevosProductos;
    });
    debugger; // Punto de depuración para verificar el estado después de agregar una fila
    console.log("agregarProducto - Fin");
  };

  // Función para eliminar un producto
  const eliminarProducto = (index: number) => {
    const nuevosProductos = productos.filter((_, i) => i !== index);
    setProductos(nuevosProductos);
  };

  // Calcular totales
  React.useEffect(() => {
    const totalBruto = productos.reduce(
      (acc, p) => acc + p.cantidad * p.precioDeVenta,
      0
    );
    const iva = productos.reduce(
      (acc, p) => acc + p.cantidad * p.precioDeVenta * (p.iva / 100),
      0
    );
    setTotalIVA(Math.round(iva));
    setTotalVenta(Math.round(totalBruto + iva - totalDescuento));
  }, [productos, totalDescuento]);

  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(collection(db, "account"));
      const accountsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(accountsData);
    };
    fetchAccounts();
  }, []);

  const [bodegas, setBodegas] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    const fetchBodegas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cellars"));
        // Actualizar el mapeo para usar el campo cellarName
        const bodegasData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.cellarName || `Bodega ${doc.id}`,
          };
        });
        console.log("Datos de bodegas obtenidos:", bodegasData);
        setBodegas(bodegasData);
      } catch (error) {
        console.error("Error al obtener las bodegas:", error);
      }
    };
    fetchBodegas();
  }, []);

  return (
    <>
      <div className="bg-green-100">
        <div className="w-full max-w-7xl mx-auto p-6 border border-gray-400 shadow-md text-sm font-sans bg-white rounded-lg ">
          {/* CABECERA DE LA FACTURA */}
          <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-4">
            {/* DATOS EMPRESA */}
            <div>
              <h2 className="font-bold text-lg">{companyData.companyName}</h2>
              <p>
                <span className="font-bold">NIT</span> {companyData.nit}
              </p>
              <p>{companyData.address}</p>
              <p>{companyData.city}</p>
              <p>
                <span className="font-bold">Email: </span>
                {companyData.email}
              </p>
              <p>
                <span className="font-bold">Tel: </span>
                {companyData.phone}
              </p>
            </div>
            {/* QR Y FACTURA */}
            <div className="text-right">
              <div className="w-24 h-24 bg-gray-200 mb-2"></div>{" "}
              {/* QR Placeholder */}
              <h2 className="text-lg font-bold">
                Factura electrónica de venta
              </h2>
              <p className="font-bold">No. SKYM 10429</p>
              <p className="text-xs text-gray-600">Fecha y hora Factura</p>
              <p>
                <strong>Generación:</strong>{" "}
                {new Date().toLocaleString("es-CO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                <strong>Expedición:</strong>{" "}
                {new Date().toLocaleString("es-CO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                <strong>Vencimiento:</strong>{" "}
                {new Date().toLocaleString("es-CO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-green-700">
            Factura de Venta
          </h2>
          {/* DATOS DEL CLIENTE */}
          <ClientDetails
            cliente={cliente}
            search={search}
            setSearch={setSearch}
            filteredClients={filteredClients}
            handleClientSelect={handleClientSelect}
            handleAddClientClick={handleAddClientClick}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            showAddClientModal={showAddClientModal}
            closeAddClientModal={closeAddClientModal}
            AddClient={AddClient}
            handleClientCreated={handleClientCreated}
          />

          {/* TABLA DE PRODUCTOS */}
          <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-1 py-1 w-6">#</th>
                <th className="border px-1 py-1 w-14">Código</th>
                <th className="border px-1 py-1 w-32">Descripción</th>
                <th className="border px-1 py-1 w-10">Cant.</th>
                <th className="border px-1 py-1 w-32">Bodega</th>
                <th className="border px-1 py-1 w-14">Vr. Unit.</th>
                <th className="border px-1 py-1 w-14">IVA %</th>
                <th className="border px-1 py-1 w-14">Vr. Total</th>
                <th className="border px-1 py-1 w-10">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => (
                <tr key={index}>
                  <td className="border px-1 py-1 text-center">{index + 1}</td>
                  <td className="border px-1 py-1 relative">
                    <input
                      className="w-full border rounded px-1 py-0.5"
                      value={producto.id}
                      onChange={(e) =>
                        handleProductoInputChange(index, "id", e.target.value)
                      }
                      onFocus={() => handleProductoInputFocus(index, "id")}
                      onBlur={() => handleProductoInputBlur()}
                      placeholder="Código"
                    />
                    {activeDropdown &&
                      activeDropdown.index === index &&
                      activeDropdown.field === "id" && (
                        <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full max-h-40 overflow-y-auto">
                          {filteredProducts.map((product, productIndex) => (
                            <li
                              key={`product-code-${product.id}-${productIndex}`}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() =>
                                handleProductSelect(index, product)
                              }
                            >
                              {product.codigo} - {product.nombre}
                            </li>
                          ))}
                          <li
                            key="add-product"
                            className="p-2 text-blue-500 hover:underline cursor-pointer"
                            onClick={handleAddProductClick}
                          >
                            Crear nuevo producto
                          </li>
                        </ul>
                      )}
                  </td>
                  <td className="border px-1 py-1 relative">
                    <input
                      className="w-full border rounded px-1 py-0.5"
                      value={producto.nombreDelProducto}
                      onChange={(e) =>
                        handleProductoInputChange(
                          index,
                          "nombreDelProducto",
                          e.target.value
                        )
                      }
                      onFocus={() =>
                        handleProductoInputFocus(index, "nombreDelProducto")
                      }
                      onBlur={() => handleProductoInputBlur()}
                      placeholder="Descripción"
                    />
                    {activeDropdown &&
                      activeDropdown.index === index &&
                      activeDropdown.field === "nombreDelProducto" && (
                        <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full max-h-40 overflow-y-auto">
                          {filteredProducts.map((product, index) => (
                            <li
                              key={`product-${product.id}-${index}`}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() =>
                                handleProductSelect(index, product)
                              }
                            >
                              {product.nombre}
                            </li>
                          ))}
                        </ul>
                      )}
                  </td>
                  <td className="border px-1 py-1">
                    <input
                      type="number"
                      min={1}
                      className="w-14 border rounded px-1 py-0.5 text-center"
                      value={producto.cantidad}
                      onChange={(e) =>
                        handleProductoChange(index, "cantidad", e.target.value)
                      }
                    />
                  </td>
                  <td className="flex border px-1 py-1 relative">
                    <select
                      className="w-full border rounded px-1 py-0.5"
                      value={producto.bodega || ""}
                      onChange={(e) => handleBodegaChange(index, e.target.value)}
                    >
                      <option value="">Seleccione una bodega</option>
                      {bodegas.length > 0 ? (
                        bodegas.map((bodega) => (
                          <option key={bodega.id} value={bodega.id}>
                            {bodega.nombre || `Bodega ${bodega.id}`}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Cargando bodegas...
                        </option>
                      )}
                    </select>
                    <input 
                      type="text"
                      placeholder="Cant."
                      className=" border-1 rounded px-1 py-0.5 w-12 ml-2"
                      value={bodegaCantidad[index] !== undefined ? bodegaCantidad[index] : 0}
                      readOnly
                    />
                  </td>
                  <td className="border px-1 py-1 text-right">
                    {producto.precioDeVenta?.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    }) || "$0"}
                  </td>
                  <td className="border px-1 py-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-14 border rounded px-1 py-0.5 text-center"
                      value={producto.iva}
                      onChange={(e) =>
                        handleProductoChange(index, "iva", e.target.value)
                      }
                    />
                  </td>
                  <td className="border px-1 py-1 text-right">
                    {producto.total?.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    }) || "$0"}
                  </td>
                  <td className="border px-1 py-1 text-center">
                    <button
                      type="button"
                      className="text-red-500 font-bold"
                      onClick={() => eliminarProducto(index)}
                      disabled={productos.length === 1}
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="mb-4 mr-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={agregarProducto}
          >
            + Agregar producto
          </button>

          <button
            type="button"
            className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={generatePdfAndDownload}
          >
            Guardar y Exportar a PDF
          </button>

          <div className="mt-4">
            <label className="font-bold">Valor en letras:</label>
            <span className="ml-2">{formatCurrencyToWords(totalVenta)}</span>
          </div>

          <div className="mt-4">
            <label
              className="block text-green-400 mb-2 text-base sm:text-lg"
              htmlFor="accountDropdown"
            >
              Forma de pago
            </label>
            <select
              id="accountDropdown"
              name="accountDropdown"
              className="w-64 px-4 py-2 rounded-xl bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base sm:text-lg"
              value={selectedAccount} // Usar el estado para controlar el valor
              onChange={(e) => setSelectedAccount(e.target.value)} // Actualizar el estado al cambiar
            >
              <option value="">Seleccione una cuenta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.accountName}>
                  {account.accountName || "Sin nombre"}
                </option>
              ))}
            </select>
          </div>

          {/* TOTALES Y OTROS CAMPOS */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
            <div className="w-full md:w-1/2 border border-gray-300 p-4 text-sm mb-4 md:mb-0">
              <label className="font-bold">Referencia de Pago</label>
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Referencia de Pago"
                value={referenciaPago}
                onChange={(e) => setReferenciaPago(e.target.value)}
              />
              <label className="font-bold">Guía</label>
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Guía"
                value={guia}
                onChange={(e) => setGuia(e.target.value)}
              />
              <label className="font-bold">Observaciones</label>
              <textarea
                className="border p-2 rounded w-full"
                placeholder="Observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
            <table className="w-full md:w-1/2 border-collapse border border-gray-300 text-sm">
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-bold text-right">
                    Total IVA:
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    ${totalIVA.toLocaleString("es-CO")}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-bold text-right">
                    Descuento:
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      className="w-24 border rounded px-1 py-0.5 text-right"
                      value={totalDescuento}
                      onChange={(e) =>
                        setTotalDescuento(Number(e.target.value))
                      }
                    />
                  </td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 font-bold text-right">
                    Total a Pagar:
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-lg font-bold">
                    ${totalVenta.toLocaleString("es-CO")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {showAddProductModal && (
          <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg w-1/2">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={closeAddProductModal}
              >
                X
              </button>
              <RegisterProduct
                onCloseModal={closeAddProductModal}
                onProductRegistered={handleProductCreated}
              />
            </div>
          </div>
        )}
        {showPreview && pdfDataUrl && (
          <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg w-3/4 h-3/4 overflow-auto">
              <iframe
                src={pdfDataUrl}
                className="w-full h-full"
                title="Vista Previa PDF"
              ></iframe>
              <button
                type="button"
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={exportPdf}
              >
                Exportar a PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InvoiceForm;
