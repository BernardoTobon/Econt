"use client";
import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { app } from "../../firebase/Index";
import { formatCurrencyInput, parseCurrencyInput } from "../../utils/formatCurrency";
import ExpensesList from "./ExpensesList";

const expenseTypes = [
    { value: "operativos", label: "Gastos operativos" },
    { value: "administrativos", label: "Gastos administrativos" },
    { value: "ventas", label: "Gastos de ventas" },
    { value: "financieros", label: "Gastos financieros" },
    { value: "otros", label: "Otros gastos" },
];

interface Account {
    id: string;
    accountName: string;
}

interface ExpensesProps {
    onRegistered?: (data: any) => void;
}

export default function Expenses({ onRegistered }: ExpensesProps) {
    // Estado para disparar la actualización de la lista
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Obtener fecha actual en formato YYYY-MM-DD
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };const [form, setForm] = useState({
        date: getCurrentDate(),
        expenseType: "operativos",
        concept: "",
        amount: "",
        bankAccount: "",
    });

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(true);

    // Función para cargar las cuentas desde Firebase
    const fetchAccounts = async () => {
        try {
            setLoadingAccounts(true);
            const db = getFirestore(app);
            const querySnapshot = await getDocs(collection(db, "account")); const accountsData: Account[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                accountName: doc.data().accountName || "",
            }));
            setAccounts(accountsData);
        } catch (err) {
            console.error("Error al cargar las cuentas:", err);
            setError("Error al cargar las cuentas bancarias.");
        } finally {
            setLoadingAccounts(false);
        }
    };

    // useEffect para cargar las cuentas al montar el componente
    useEffect(() => {
        fetchAccounts();
    }, []);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'amount') {
            // Para el campo amount, formateamos el valor
            const formattedValue = formatCurrencyInput(value);
            setForm({
                ...form,
                [name]: formattedValue,
            });
        } else {
            setForm({
                ...form,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);    // Validaciones
        if (!form.date || !form.expenseType || !form.concept || !form.amount || !form.bankAccount) {
            setError("Por favor completa todos los campos obligatorios.");
            setLoading(false);
            return;
        }    // Validar que el amount sea un número válido
        const amountNumber = parseCurrencyInput(form.amount);
        if (amountNumber <= 0) {
            setError("Por favor ingresa un valor válido mayor a 0.");
            setLoading(false);
            return;
        }        try {
            const db = getFirestore(app);
            
            // Verificar saldo suficiente en la cuenta bancaria
            const accountsQuery = query(
                collection(db, "account"), 
                where("accountName", "==", form.bankAccount)
            );
            const accountSnapshot = await getDocs(accountsQuery);
            
            if (accountSnapshot.empty) {
                setError("No se encontró la cuenta bancaria seleccionada.");
                setLoading(false);
                return;
            }
            
            const accountDoc = accountSnapshot.docs[0];
            const accountData = accountDoc.data();
            const currentAmount = accountData.initialAmount || 0;
            
            // Verificar que hay saldo suficiente
            if (currentAmount < amountNumber) {
                setError(`Saldo insuficiente. Saldo actual: ${formatCurrencyInput(currentAmount)}, Gasto: ${form.amount}`);
                setLoading(false);
                return;
            }
            
            // Obtener el label del tipo de gasto
            const expenseTypeLabel = expenseTypes.find(type => type.value === form.expenseType)?.label || form.expenseType;
            const dataToSave = {
                ...form,
                expenseType: expenseTypeLabel,
                amount: amountNumber,
                createdAt: new Date(),
            };
            
            // Registrar el gasto
            await addDoc(collection(db, "expenses"), dataToSave);
            
            // Actualizar el saldo de la cuenta bancaria
            const newAmount = currentAmount - amountNumber;
            await updateDoc(doc(db, "account", accountDoc.id), {
                initialAmount: newAmount,
                updatedAt: new Date()
            });
            
            console.log(`Saldo actualizado: ${currentAmount} - ${amountNumber} = ${newAmount}`);
              setSuccess("¡Gasto registrado exitosamente!");

            // Disparar actualización de la lista
            setRefreshTrigger(prev => prev + 1);

            // Limpiar formulario
            setForm({
                date: getCurrentDate(),
                expenseType: "operativos",
                concept: "",
                amount: "",
                bankAccount: "",
            });

            if (onRegistered) onRegistered(dataToSave);
        } catch (err) {
            setError("Error al registrar el gasto. Intenta de nuevo.");
            console.error("Error:", err);
        }
        setLoading(false);
    };    // Función para obtener clases CSS de inputs
    const getInputClasses = () => {
        return "w-full px-3 py-2 rounded-lg bg-white text-green-800 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-sm";
    };

    const getLabelClasses = () => {
        return "block text-green-400 mb-1 text-md font-medium";
    };    return (
        <div className="flex flex-col items-center px-2 sm:px-4 min-h-screen w-full bg-green-100">
            <form
                onSubmit={handleSubmit}
                className="bg-green-950 bg-opacity-80 p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-6xl border border-green-500 flex flex-col items-center mt-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-6 text-center">
                    Registrar Gasto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 w-full">
                    {/* Campo de Fecha */}
                    <div className="w-full">
                        <label className={getLabelClasses()} htmlFor="date">
                            Fecha
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className={getInputClasses()}
                            required
                        />
                    </div>                    {/* Campo de Tipo de Gasto */}
                    <div className="w-full">
                        <label className={getLabelClasses()} htmlFor="expenseType">
                            Tipo de Gasto
                        </label>
                        <select
                            id="expenseType"
                            name="expenseType"
                            value={form.expenseType}
                            onChange={handleChange}
                            className={getInputClasses()}
                            required
                        >
                            {expenseTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Campo de Concepto */}
                    <div className="w-full">
                        <label className={getLabelClasses()} htmlFor="concept">
                            Concepto
                        </label>
                        <input
                            type="text"
                            id="concept"
                            name="concept"
                            value={form.concept}
                            onChange={handleChange}
                            placeholder="Describe el concepto del gasto"
                            className={getInputClasses()}
                            required
                        />
                    </div>          {/* Campo de Valor */}
                    <div className="w-full">
                        <label className={getLabelClasses()} htmlFor="amount">
                            Valor
                        </label>
                        <input
                            type="text"
                            id="amount"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            placeholder="$0"
                            className={getInputClasses()}
                            required
                        />
                    </div>                    {/* Campo de Cuenta Bancaria */}
                    <div className="w-full">
                        <label className={getLabelClasses()} htmlFor="bankAccount">
                            Cuenta Bancaria
                        </label><select
                            id="bankAccount"
                            name="bankAccount"
                            value={form.bankAccount}
                            onChange={handleChange}
                            className={getInputClasses()}
                            required
                            disabled={loadingAccounts}            >
                            {loadingAccounts ? (
                                <option value="">Cargando cuentas...</option>
                            ) : accounts.length === 0 ? (
                                <option value="">No hay cuentas disponibles</option>
                            ) : (
                                <>
                                    <option value="">Seleccione una cuenta</option>
                                    {accounts.map((account: Account) => (
                                        <option key={account.id} value={account.accountName}>
                                            {account.accountName}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {/* Mensajes de error y éxito */}
                {error && (
                    <div className="mt-4 text-red-400 text-center text-sm w-full bg-red-900 bg-opacity-20 p-2 rounded-lg border border-red-400">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mt-4 text-green-400 text-center text-sm w-full bg-green-900 bg-opacity-20 p-2 rounded-lg border border-green-400">
                        {success}
                    </div>
                )}                <button
                    type="submit"
                    disabled={loading}
                    className="w-full max-w-sm py-3 rounded-lg bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-green-950 font-bold hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 text-base sm:text-lg mt-6"
                >
                    {loading ? "Registrando..." : "Registrar Gasto"}
                </button>
            </form>
              {/* Lista de Gastos */}
            <div className="w-full max-w-6xl mt-8">
                <ExpensesList refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
}
