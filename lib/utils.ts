export const generateUniquePayment = (baseAmount: number = 100000) => {
  const now = new Date();
  const seconds = now.getSeconds(); // 0-59
  const milliseconds = Math.floor(now.getMilliseconds() / 10); // 0-99
  
  // Gabungkan detik dan mili sebagai kode unik (3 digit)
  const uniqueCode = parseInt(`${seconds}${milliseconds}`.slice(-3)); 
  const totalAmount = baseAmount + uniqueCode;

  return { totalAmount, uniqueCode };
};
