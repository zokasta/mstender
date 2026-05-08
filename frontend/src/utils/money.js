export function money(value) {
    if (value === null || value === undefined) return '';
  
    // Remove non-numeric characters except dot
    let num = value.toString().replace(/[^0-9.]/g, '');
  
    if (num === '') return '';
  
    const [integerPart, decimalPart] = num.split('.');
  
    let lastThree = integerPart.slice(-3);
    let otherNumbers = integerPart.slice(0, -3);
  
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
  
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
    return decimalPart !== undefined ? `₹${formatted}.${decimalPart}` : `₹${formatted}`;
  }
  
  