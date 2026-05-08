
export const numberFormatter = (value, decimals = 0) => {
    if (value === null || value === undefined || isNaN(value)) return "0";
  
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Number(value));
  };