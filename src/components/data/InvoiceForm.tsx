"use client";

import React, { useState, useEffect } from "react";
import { db } from "../../firebase/Index";
import { collection, getDocs } from "firebase/firestore";
import AddClient from "./AddClient";
import RegisterProduct from "./RegisterProduct";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Estructura de producto para la factura
interface ProductInvoice {
  id: string;
  nombreDelProducto: string;
  cantidad: number;
  precioDeVenta: number;
  iva: number;
  total: number;
}

// Estado para los datos del cliente
export const InvoiceForm: React.FC = () => {
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

  const handleProductSelect = (index: number, product: any) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      id: product.codigo, // Usar el campo 'codigo' registrado por el cliente
      nombreDelProducto: product.nombre,
    };
    setProductos(nuevosProductos);
    setSearchProduct("");
    setActiveDropdown(null);
  };

  const handleProductoInputChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      [field]: value,
    };
    setProductos(nuevosProductos);
    setSearchProduct(value);
    setShowProductDropdown(true);
  };

  const handleProductoInputFocus = (
    index: number,
    field: "id" | "nombreDelProducto"
  ) => {
    setActiveDropdown({ index, field });
    setSearchProduct(
      field === "id" ? productos[index].id : productos[index].nombreDelProducto
    );
  };

  const handleProductoInputBlur = (
    index: number,
    field: "id" | "nombreDelProducto"
  ) => {
    setTimeout(() => {
      if (
        activeDropdown &&
        activeDropdown.index === index &&
        activeDropdown.field === field
      ) {
        setActiveDropdown(null);
      }
    }, 200); // Retraso para permitir seleccionar un elemento del dropdown
  };

  // Estado para totales y otros campos
  const [totalIVA, setTotalIVA] = useState(0);
  const [totalDescuento, setTotalDescuento] = useState(0);
  const [totalVenta, setTotalVenta] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [guia, setGuia] = useState("");
  const [referenciaPago, setReferenciaPago] = useState("");

  // Estado para vista previa y exportación a PDF
  const [showPreview, setShowPreview] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

const cleanOklchColors = (element: HTMLElement) => {
  const elements = element.querySelectorAll("*");
  elements.forEach((el) => {
    const computedStyle = window.getComputedStyle(el);
    ["color", "backgroundColor", "borderColor"].forEach((property) => {
      const value = computedStyle.getPropertyValue(property);
      if (value.includes("oklch")) {
        (el as HTMLElement).style.setProperty(property, "#000000", "important");
      }
    });
  });
};

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

const fixInputStyles = (element: HTMLElement) => {
  const inputs = element.querySelectorAll("input, textarea, select");
  inputs.forEach((input) => {
    const computedStyle = window.getComputedStyle(input);
    const stylesToCopy = [
      "boxSizing",
      "height",
      "padding",
      "border",
      "font",
      "lineHeight",
      "letterSpacing",
      "textAlign",
      "color",
      "backgroundColor",
      "borderRadius",
    ];

    stylesToCopy.forEach((style) => {
      (input as HTMLElement).style.setProperty(
        style,
        computedStyle.getPropertyValue(style),
        "important"
      );
    });
  });
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

const generatePdfAndDownload = async () => {
  const invoiceElement = document.querySelector(".max-w-4xl") as HTMLElement;
  if (!invoiceElement) {
    alert("No se encontró la factura para exportar.");
    return;
  }

  try {
    // Aplicar estilo global para evitar colores no compatibles
    applyGlobalStyleFix();

    // Clonar el nodo original para evitar modificar el DOM real
    const clone = invoiceElement.cloneNode(true) as HTMLElement;

    // Reemplazar inputs con contenido estático en el clon
    replaceInputsWithStaticContent(clone);

    // Agregar el clon a un contenedor oculto en el DOM
    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "fixed";
    hiddenContainer.style.top = "0";
    hiddenContainer.style.left = "0";
    hiddenContainer.style.width = "100vw";
    hiddenContainer.style.height = "100vh";
    hiddenContainer.style.overflow = "hidden";
    hiddenContainer.style.opacity = "0";
    hiddenContainer.style.zIndex = "-1";
    hiddenContainer.appendChild(clone);
    document.body.appendChild(hiddenContainer);

    await new Promise((res) => setTimeout(res, 300)); // Asegurar renderizado

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    document.body.removeChild(hiddenContainer); // Limpiar el DOM

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("Factura.pdf");

    alert("Factura exportada como PDF con éxito!");
  } catch (error) {
    console.error("Error al exportar la factura:", error);
    alert("Hubo un error al exportar la factura.");
  } finally {
    // Eliminar el estilo global después de la captura
    removeGlobalStyleFix();
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
      nuevosProductos[index].cantidad * nuevosProductos[index].precioDeVenta;
    setProductos(nuevosProductos);
  };

  // Función para agregar un producto
  const agregarProducto = () => {
    setProductos([
      ...productos,
      {
        id: "",
        nombreDelProducto: "",
        cantidad: 1,
        precioDeVenta: 0,
        iva: 19,
        total: 0,
      },
    ]);
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

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-6 border border-gray-400 shadow-md text-sm font-sans bg-white rounded-lg mt-6">
        {/* CABECERA DE LA FACTURA */}
        <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-4">
          {/* DATOS EMPRESA */}
          <div>
            <h2 className="font-bold text-lg">SKY MOTION S.A.S</h2>
            <p>NIT 901.119.460-6</p>
            <p>CRA 48 #17A SUR - 47 LC 101 ED. PORTUGAL</p>
            <p>Medellín - Colombia</p>
            <p>Email: skymotion@skymotion.com.co</p>
            <p>Tel: (571) 3562097</p>
          </div>
          {/* QR Y FACTURA */}
          <div className="text-right">
            <div className="w-24 h-24 bg-gray-200 mb-2"></div>{" "}
            {/* QR Placeholder */}
            <h2 className="text-lg font-bold">Factura electrónica de venta</h2>
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
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative" id="nombreCompletoDropdown">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="nombreCompleto"
            >
              Nombre Completo / Razón Social
            </label>
            <input
              id="nombreCompleto"
              className="border p-2 rounded w-full"
              placeholder="Nombre completo o razón social"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full max-h-40 overflow-y-auto">
                {filteredClients.map((client, index) => (
                  <li
                    key={`client-${client.id}-${index}`}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleClientSelect(client)}
                  >
                    {client.fullName}
                  </li>
                ))}
                <li
                  key="add-client"
                  className="p-2 text-blue-500 hover:underline cursor-pointer"
                  onClick={handleAddClientClick}
                >
                  Agregar un nuevo cliente
                </li>
              </ul>
            )}
            {showAddClientModal && (
              <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded shadow-lg w-1/2">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={closeAddClientModal}
                  >
                    X
                  </button>
                  <AddClient
                    onCloseModal={closeAddClientModal}
                    onRegistered={handleClientCreated}
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="numeroIdentificacion"
            >
              Número de Identificación
            </label>
            <input
              id="numeroIdentificacion"
              className="border p-2 rounded"
              placeholder="Número de identificación"
              value={cliente.numeroDeIdentificacion}
              readOnly
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="telefono"
            >
              Teléfono
            </label>
            <input
              id="telefono"
              className="border p-2 rounded"
              placeholder="Teléfono"
              value={cliente.celular}
              readOnly
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="direccion"
            >
              Dirección
            </label>
            <input
              id="direccion"
              className="border p-2 rounded"
              placeholder="Dirección"
              value={cliente.direccion}
              readOnly
            />
          </div>
          <div className="col-span-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="ciudad"
            >
              Ciudad
            </label>
            <input
              id="ciudad"
              className="border p-2 rounded w-full"
              placeholder="Ciudad"
              value={cliente.municipiosDepartamentos}
              readOnly
            />
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-1 py-1 w-6">#</th>
              <th className="border px-1 py-1 w-14">Código</th>
              <th className="border px-1 py-1 w-32">Descripción</th>
              <th className="border px-1 py-1 w-10">Cant.</th>
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
                    onBlur={() => handleProductoInputBlur(index, "id")}
                    placeholder="Código"
                  />
                  {activeDropdown &&
                    activeDropdown.index === index &&
                    activeDropdown.field === "id" && (
                      <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full max-h-40 overflow-y-auto">
                        {filteredProducts.map((product, index) => (
                          <li
                            key={`product-${product.id}-${index}`}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleProductSelect(index, product)}
                          >
                            {product.codigo}
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
                    onBlur={() =>
                      handleProductoInputBlur(index, "nombreDelProducto")
                    }
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
                            onClick={() => handleProductSelect(index, product)}
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
                <td className="border px-1 py-1">
                  <input
                    type="number"
                    min={0}
                    className="w-20 border rounded px-1 py-0.5 text-right"
                    value={producto.precioDeVenta}
                    onChange={(e) =>
                      handleProductoChange(
                        index,
                        "precioDeVenta",
                        e.target.value
                      )
                    }
                  />
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
                  ${producto.total.toLocaleString("es-CO")}
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
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={agregarProducto}
        >
          + Agregar producto
        </button>

        <button
          type="button"
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={generatePdfAndDownload}
        >
          Exportar a PDF
        </button>

        {/* TOTALES Y OTROS CAMPOS */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
          <div className="w-full md:w-1/2 border border-gray-300 p-4 text-sm mb-4 md:mb-0">
            <input
              className="border p-2 rounded w-full mb-2"
              placeholder="Referencia de Pago"
              value={referenciaPago}
              onChange={(e) => setReferenciaPago(e.target.value)}
            />
            <input
              className="border p-2 rounded w-full mb-2"
              placeholder="Guía"
              value={guia}
              onChange={(e) => setGuia(e.target.value)}
            />
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
                    onChange={(e) => setTotalDescuento(Number(e.target.value))}
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
    </>
  );
};

export default InvoiceForm;
