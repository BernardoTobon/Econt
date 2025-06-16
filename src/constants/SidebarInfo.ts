import { bankIcon, contactIcon, homeIcon, incomeIcon, inventaryIcon } from "@/icons/Icons";


export const SideBarInfo = [
    {
        section: "Inicio",
        icon: homeIcon,
        label: "Dashboard",        links: [
            {label: "Inicio", href: "/dashboard"},
            {label: "Ventas", href: "/sales"},
            {label: "Compras", href: "/purchases"},
            {label: "Gastos", href: "#"},
            {label: "Ingresos", href: "#"},
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
            {label: "Resimiones", href:"#"}
        ]
    },
    {
        section: "bancos",
        icon: bankIcon,
        label: "Bancos",
        links: [
            {label: "Cuentas bancarias", href: "/account"},
            {label: "Conciliaciones bancarias", href: "#"},
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