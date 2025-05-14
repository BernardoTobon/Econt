// Formatea un número a $X.XXX formato colombiano sin decimales
export function formatCurrencyCOP(value: string | number | undefined): string {
  if (value === undefined || value === null) {
    value = 0;
  }
  let num = typeof value === 'string' ? value.replace(/[^\d]/g, '') : value;
  if (typeof num === 'string') num = parseInt(num, 10) || 0;
  return '$' + num.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

export function formatCurrencyToWords(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) {
    amount = 0; 
  }

  const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
  const decenas = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const centenas = ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

  function convertirNumeroALetras(n: number): string {
    if (n === 0) return "cero";
    if (n < 10) return unidades[n];
    if (n < 100) {
      const decena = Math.floor(n / 10);
      const unidad = n % 10;

      if (decena === 1) {
        const especiales = ["diez", "once", "doce", "trece", "catorce", "quince"];
        return especiales[unidad] || "dieci" + unidades[unidad];
      }

      if (decena === 2) {
        if (unidad === 1) return "veintiún";
        if (unidad > 0) return "veinti" + unidades[unidad];
        return "veinte";
      }

      return decenas[decena] + (unidad ? " y " + unidades[unidad] : "");
    }
    if (n < 1000) {
      const centena = Math.floor(n / 100);
      const resto = n % 100;

      if (centena === 1 && resto > 0) {
        return "ciento" + (resto ? " " + convertirNumeroALetras(resto) : "");
      }

      return centenas[centena] + (resto ? " " + convertirNumeroALetras(resto) : "");
    }

    if (n < 1000000) {
      const miles = Math.floor(n / 1000);
      const resto = n % 1000;

      if (miles === 1) {
        return "mil" + (resto ? " " + convertirNumeroALetras(resto) : "");
      }
      if (miles % 10 === 1 && miles !== 11) {
        return convertirNumeroALetras(miles).replace(/ uno$/, " un") + " mil" + (resto ? " " + convertirNumeroALetras(resto) : "");
      }

      return (miles === 1 ? "mil" : convertirNumeroALetras(miles) + " mil") + (resto ? " " + convertirNumeroALetras(resto) : "");
    }

    if (n >= 1000000) {
      const millones = Math.floor(n / 1000000);
      const resto = n % 1000000;

      if (millones === 101) {
        return "ciento un millones" + (resto ? " " + convertirNumeroALetras(resto) : "");
      }
      if (millones % 100 === 1) {
        return convertirNumeroALetras(millones) + " un millón" + (resto ? " " + convertirNumeroALetras(resto) : "");
      }
      if (millones % 1000 === 1) {
        return convertirNumeroALetras(millones) + " un millón" + (resto ? " " + convertirNumeroALetras(resto) : "");
      }

      return convertirNumeroALetras(millones) + " millón" + (millones > 1 ? "es" : "") + (resto ? " " + convertirNumeroALetras(resto) : "");
    }
    return "Número demasiado grande";
  }

  const palabras = convertirNumeroALetras(amount) || "cero"; // Asegurar que siempre haya un valor válido
  return palabras.charAt(0).toUpperCase() + palabras.slice(1) + " pesos";
}
