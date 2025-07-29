import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QRCodeData {
  id: string;
  qrCode: string;
  url?: string;
}

interface BatchData {
  id: string;
  description: string;
  outboundFacility: { name: string };
  inboundFacility: { name: string };
  createdAt: string;
  referrals: QRCodeData[];
}

export const generatePDF = async (batch: BatchData): Promise<void> => {
  // Create a temporary container for the PDF content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm'; // A4 width
  container.style.backgroundColor = 'white';
  container.style.padding = '20mm';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '12px';
  container.style.lineHeight = '1.4';
  
  // Create header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '20mm';
  header.style.borderBottom = '2px solid #333';
  header.style.paddingBottom = '10mm';
  
  header.innerHTML = `
    <h1 style="margin: 0 0 10mm 0; font-size: 24px; color: #333;">Referral QR Codes</h1>
    <div style="color: #666; font-size: 14px;">
      <p style="margin: 5px 0;"><strong>Batch ID:</strong> ${batch.id}</p>
      ${batch.description ? `<p style="margin: 5px 0;"><strong>Description:</strong> ${batch.description}</p>` : ''}
      <p style="margin: 5px 0;"><strong>Route:</strong> ${batch.outboundFacility?.name || 'Unknown'} → ${batch.inboundFacility?.name || 'Unknown'}</p>
      <p style="margin: 5px 0;"><strong>Generated:</strong> ${batch.createdAt ? new Date(batch.createdAt).toLocaleString() : 'Unknown'}</p>
    </div>
  `;
  
  container.appendChild(header);
  
  // Create QR codes grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
  grid.style.gap = '8mm';
  grid.style.marginBottom = '20mm';
  
  // Calculate QR code size to fit 6 per row
  const pageWidth = 210 - 40; // A4 width minus margins
  const qrSize = (pageWidth - 50) / 6; // 50mm for gaps between 6 columns
  
  batch.referrals.forEach((referral) => {
    const qrItem = document.createElement('div');
    qrItem.style.border = '1px solid #ddd';
    qrItem.style.borderRadius = '2px';
    qrItem.style.padding = '2mm';
    qrItem.style.textAlign = 'center';
    qrItem.style.backgroundColor = 'white';
    qrItem.style.pageBreakInside = 'avoid';
    
    // Create QR code container
    const qrContainer = document.createElement('div');
    qrContainer.style.width = `${qrSize}mm`;
    qrContainer.style.height = `${qrSize}mm`;
    qrContainer.style.margin = '0 auto';
    qrContainer.style.display = 'flex';
    qrContainer.style.alignItems = 'center';
    qrContainer.style.justifyContent = 'center';
    qrContainer.style.backgroundColor = '#ffffff';
    qrContainer.style.borderRadius = '1px';
    qrContainer.style.padding = '0.5mm';
    
    // Insert QR code SVG
    qrContainer.innerHTML = referral.qrCode;
    
    qrItem.appendChild(qrContainer);
    grid.appendChild(qrItem);
  });
  
  container.appendChild(grid);
  
  // Create footer
  const footer = document.createElement('div');
  footer.style.textAlign = 'center';
  footer.style.fontSize = '10px';
  footer.style.color = '#999';
  footer.style.borderTop = '1px solid #ddd';
  footer.style.paddingTop = '5mm';
  footer.innerHTML = `
    <p>Generated on ${new Date().toLocaleString()} | Total QR Codes: ${batch.referrals.length}</p>
  `;
  
  container.appendChild(footer);
  
  // Add to document temporarily
  document.body.appendChild(container);
  
  try {
    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 210 * 2.83465, // Convert mm to pixels (1mm = 2.83465px)
      height: 297 * 2.83465, // A4 height
    });
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Calculate how many pages we need
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(`QR-Codes-${batch.id}-${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};

 