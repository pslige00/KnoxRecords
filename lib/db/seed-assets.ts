export function generateLicenseSvg({
  name,
  dob,
  licenseNumber,
  address,
}: {
  name: string;
  dob: string;
  licenseNumber: string;
  address: string;
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" rx="16" fill="#1e3a5f"/>
    <rect x="12" y="12" width="576" height="356" rx="10" fill="#f4f1e6"/>
    <text x="32" y="50" font-family="Arial" font-size="20" font-weight="700" fill="#1e3a5f">TENNESSEE</text>
    <text x="32" y="74" font-family="Arial" font-size="13" fill="#1e3a5f">DRIVER LICENSE (SYNTHETIC / DEMO ONLY)</text>
    <rect x="32" y="96" width="130" height="150" rx="6" fill="#c9c2a8"/>
    <text x="97" y="176" font-family="Arial" font-size="12" fill="#5a5137" text-anchor="middle">PHOTO</text>
    <text x="180" y="120" font-family="Arial" font-size="12" fill="#555">NAME</text>
    <text x="180" y="140" font-family="Arial" font-size="18" font-weight="600" fill="#111">${name}</text>
    <text x="180" y="166" font-family="Arial" font-size="12" fill="#555">DOB</text>
    <text x="180" y="184" font-family="Arial" font-size="15" fill="#111">${dob}</text>
    <text x="180" y="210" font-family="Arial" font-size="12" fill="#555">ADDRESS</text>
    <text x="180" y="228" font-family="Arial" font-size="14" fill="#111">${address}</text>
    <text x="32" y="270" font-family="Arial" font-size="12" fill="#555">LICENSE NO.</text>
    <text x="32" y="290" font-family="Arial" font-size="15" fill="#111">${licenseNumber}</text>
    <text x="32" y="340" font-family="Arial" font-size="10" fill="#8a8267">Synthetic demo asset — not a real government document.</text>
  </svg>`;
}

export function generateRecordPdfPlaceholder(title: string) {
  return `Synthetic demo document\n\n${title}\n\nThis file is a placeholder generated for demo/seed data. It does not contain real public records.`;
}
