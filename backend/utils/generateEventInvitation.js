const PDFDocument = require('pdfkit');

const generateEventInvitationPDF = (event, recipientType = null) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 40, bottom: 40, left: 40, right: 40 } 
    });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // --- BRAND PALETTE ---
    const colors = {
      deepNavy: '#0F172A',
      accentGold: '#B8977E',
      softWhite: '#F8FAFC',
      textMain: '#1E293B',
      textMuted: '#64748B',
      borderLight: '#E2E8F0'
    };

    // 1. BACKGROUND & BORDER
    doc.rect(0, 0, 595.28, 841.89).fill(colors.softWhite);
    
    // Decorative Gold border
    doc.rect(20, 20, 555.28, 801.89).lineWidth(1).stroke(colors.accentGold);
    
    // Corner accents
    const accentSize = 40;
    doc.rect(20, 20, accentSize, 2).fill(colors.deepNavy);
    doc.rect(20, 20, 2, accentSize).fill(colors.deepNavy);
    
    doc.rect(575.28 - accentSize, 20, accentSize, 2).fill(colors.deepNavy);
    doc.rect(575.28, 20, 2, accentSize).fill(colors.deepNavy);
    
    doc.rect(20, 821.89 - accentSize, 2, accentSize).fill(colors.deepNavy);
    doc.rect(20, 821.89, accentSize, 2).fill(colors.deepNavy);
    
    doc.rect(575.28 - accentSize, 821.89, accentSize, 2).fill(colors.deepNavy);
    doc.rect(575.28, 821.89 - accentSize, 2, accentSize).fill(colors.deepNavy);

    // 2. HEADER
    doc.fillColor(colors.deepNavy)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('NATIVE NEST', { align: 'center', characterSpacing: 4 });
    
    doc.fillColor(colors.accentGold)
       .fontSize(10)
       .font('Helvetica')
       .text('PREMIUM REAL ESTATE EXPERIENCES', { align: 'center', characterSpacing: 2 });
    
    doc.moveDown(2);

    // 3. BANNER IMAGE
    const imgWidth = 440;
    const imgHeight = 250;
    const startX = (595.28 - imgWidth) / 2;
    
    if (event.banner_image) {
      try {
        doc.image(event.banner_image, startX, doc.y, { fit: [imgWidth, imgHeight], align: 'center' });
        doc.y += imgHeight + 30;
      } catch (e) {
        doc.rect(startX, doc.y, imgWidth, imgHeight).fill(colors.borderLight);
        doc.fillColor(colors.textMuted).fontSize(10).text('EVENT BANNER', startX, doc.y + 115, { width: imgWidth, align: 'center' });
        doc.y += imgHeight + 30;
      }
    } else {
      doc.rect(startX, doc.y, imgWidth, imgHeight).fill(colors.borderLight);
      doc.fillColor(colors.textMuted).fontSize(12).text(event.event_type || 'PROPERTY EVENT', startX, doc.y + 115, { width: imgWidth, align: 'center' });
      doc.y += imgHeight + 30;
    }

    doc.moveDown(1);

    // 4. EVENT DETAILS
    doc.fillColor(colors.deepNavy)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(event.event_name || '', { align: 'center', width: 515 });

    doc.moveDown(0.5);
    
    if (event.event_type) {
      doc.fillColor(colors.accentGold)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(event.event_type.toUpperCase(), { align: 'center', characterSpacing: 1 });
    }

    doc.moveDown(1.5);

    // Details Grid - Stable Positioning
    const gridY = doc.y;
    const leftColX = 60;
    const rightColX = 305;
    const colWidth = 230;

    // --- LEFT COLUMN: WHEN ---
    doc.fillColor(colors.deepNavy).fontSize(10).font('Helvetica-Bold').text('WHEN', leftColX, gridY);
    doc.rect(leftColX, gridY + 14, 40, 1).fill(colors.accentGold);
    
    let currentY = gridY + 25;
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const dateStr = event.start_date === event.end_date 
      ? formatDate(event.start_date)
      : `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`;
    
    doc.fillColor(colors.textMain).fontSize(11).font('Helvetica-Bold').text(dateStr, leftColX, currentY, { width: colWidth });
    currentY = doc.y + 2;
    
    if (event.start_time) {
      const timeStr = event.end_time ? `${event.start_time} - ${event.end_time}` : event.start_time;
      doc.fillColor(colors.textMuted).fontSize(10).font('Helvetica').text(timeStr, leftColX, currentY, { width: colWidth });
      currentY = doc.y;
    }

    // --- RIGHT COLUMN: WHERE ---
    doc.fillColor(colors.deepNavy).fontSize(10).font('Helvetica-Bold').text('WHERE', rightColX, gridY);
    doc.rect(rightColX, gridY + 14, 40, 1).fill(colors.accentGold);
    
    let rightY = gridY + 25;
    doc.fillColor(colors.textMain).fontSize(11).font('Helvetica-Bold').text(event.event_location || '', rightColX, rightY, { width: colWidth });
    rightY = doc.y + 2;
    
    let addressLines = [];
    if (event.address) addressLines.push(event.address);
    if (event.city || event.pincode) addressLines.push(`${event.city || ''}${event.city && event.pincode ? ' - ' : ''}${event.pincode || ''}`);
    if (event.state) addressLines.push(event.state);
    
    addressLines.forEach(line => {
      doc.fillColor(colors.textMuted).fontSize(10).font('Helvetica').text(line, rightColX, rightY, { width: colWidth });
      rightY = doc.y;
    });

    // Update global doc.y to the bottom of the tallest column
    doc.y = Math.max(currentY, rightY) + 25;

    // 5. DESCRIPTION
    if (event.description) {
      doc.fillColor(colors.deepNavy).fontSize(10).font('Helvetica-Bold').text('ABOUT THE EVENT', leftColX);
      doc.rect(leftColX, doc.y + 4, 40, 1).fill(colors.accentGold);
      doc.moveDown(1.2);
      doc.fillColor(colors.textMain).fontSize(10).font('Helvetica').text(event.description, leftColX, doc.y, { width: 475, lineGap: 3, align: 'justify' });
      doc.moveDown(2);
    }

    // 6. CONTACT
    if (event.contact_name || event.contact_phone) {
      doc.fillColor(colors.deepNavy).fontSize(10).font('Helvetica-Bold').text('RSVP / INQUIRIES', leftColX);
      doc.rect(leftColX, doc.y + 4, 40, 1).fill(colors.accentGold);
      doc.moveDown(1.2);
      
      let contactInfo = [];
      if (event.contact_name) contactInfo.push(event.contact_name);
      if (event.contact_phone) contactInfo.push(event.contact_phone);
      
      doc.fillColor(colors.textMain).fontSize(10).font('Helvetica-Bold').text(contactInfo.join('  |  '), leftColX);
    }

    // 7. FOOTER
    const footerY = 780;
    doc.fillColor(colors.textMuted)
       .fontSize(8)
       .font('Helvetica')
       .text('This is an official invitation from Native Nest.', 0, footerY, { align: 'center' });
    
    doc.fillColor(colors.deepNavy)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('www.nativenest.in', 0, footerY + 15, { align: 'center', characterSpacing: 1 });

    doc.end();
  });
};

module.exports = { generateEventInvitationPDF };