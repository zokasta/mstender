// utils/currencyFormatter.js

export const currencyFormatter = (
    amount,
    {
      currency = "INR",
      locale = "en-IN", // default Indian format
      decimals = 2,
    } = {}
  ) => {
    if (amount === null || amount === undefined || isNaN(amount))
      return "₹0.00";
  
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Number(amount));
  };