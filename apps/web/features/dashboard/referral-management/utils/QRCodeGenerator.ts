export const generateQRCode = (text: string): string => {
  const size = 256;
  const modules = 25;
  const moduleSize = size / modules;
  const padding = moduleSize * 2;
  const innerSize = size - (padding * 2);
  const innerModuleSize = innerSize / modules;
  
  const pattern: boolean[][] = Array(modules).fill(null).map(() => Array(modules).fill(false));
  
  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      const charCode = text.charCodeAt((i * modules + j) % text.length);
      pattern[i][j] = (charCode * (i + 1) * (j + 1)) % 2 === 0;
    }
  }
  
  const addMarker = (row: number, col: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          pattern[row + i][col + j] = true;
        } else {
          pattern[row + i][col + j] = false;
        }
      }
    }
  };
  
  addMarker(0, 0);
  addMarker(0, modules - 7);
  addMarker(modules - 7, 0);
  
  let svg = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add gradient definitions
  svg += `<defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
    </filter>
  </defs>`;
  
  // Background with gradient
  svg += `<rect width="${size}" height="${size}" fill="url(#bgGradient)" rx="16"/>`;
  
  // White inner background
  svg += `<rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" fill="white" rx="8" filter="url(#shadow)"/>`;
  
  // QR pattern
  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      if (pattern[i][j]) {
        svg += `<rect x="${padding + j * innerModuleSize}" y="${padding + i * innerModuleSize}" width="${innerModuleSize}" height="${innerModuleSize}" fill="#1e293b" rx="1"/>`;
      }
    }
  }
  
  svg += '</svg>';
  return svg;
};

export const generateBatchId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `BATCH-${timestamp}-${random}`.toUpperCase();
};

export const generateSlug = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `REF-${timestamp}-${random}`.toUpperCase();
}; 