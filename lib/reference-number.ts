export function generateReferenceNumber() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const random = Math.floor(100000 + Math.random() * 900000);
  return `R${random}-${mm}${dd}${yy}`;
}
