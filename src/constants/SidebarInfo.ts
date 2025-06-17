import { bankIcon, contactIcon, homeIcon, incomeIcon, inventaryIcon, purchaseIcon } from "@/icons/Icons";


export const SideBarInfo = [
    {
        section: "Inicio",
        icon: homeIcon,
        label: "Dashboard",        links: [
            {label: "Inicio", href: "/dashboard"},
        ]
    },
    {
        section: "Contactos",
        icon: contactIcon,
        label: "CRM",
        links: [
            {label: "Clientes", href: "/client-list"},
            {label: "Proveedores", href: "/supplier-list"},
            {label: "Empleados", href: "/employee"},
        ]
    },
    {
        section: "Ingresos",
        icon: incomeIcon,
        label: "Ingresos",
        links: [
            {label: "Factura de ventas", href: "/invoice"},
            {label: "Pagos recibidos", href:"#"},
            {label: "Cotizaciones", href:"#"},
            {label: "Resimiones", href:"#"},
            {label: "Historial de Ventas", href: "/sales-history"},
        ]
    },
    {
        section: "Compras",
        icon: purchaseIcon,
        label: "Compras",
        links: [
            {label: "Factura de compras", href: "/purchase-invoice"},
            {label: "Pagos realizados", href:"#"},
            {label: "Historial de Compras", href: "/purchase-history"},
            {label: "Gastos", href: "/expenses"},
        ]
    },
    {
        section: "bancos",
        icon: bankIcon,
        label: "Bancos",
        links: [
            {label: "Cuentas bancarias", href: "/account"},
        ]
    },
    {
        section: "inventario",
        icon: inventaryIcon,
        label: "Inventario",        links: [
            {label: "Registrar Productos", href: "/register-products"},
            {label: "Inventario", href: "/inventory"},
            {label: "Bodega", href: "/cellars"},
            {label: "Escáner de Códigos", href: "/barcode-scanner"},
        ]
    }
]