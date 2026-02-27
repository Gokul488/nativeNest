// Modified generateEventInvitation.js
const PDFDocument = require('pdfkit');

// Added recipientType param: 'builder', 'buyer', 'admin' (or null for admin/no link)
const generateEventInvitationPDF = (event, recipientType = null) => {
  return new Promise((resolve, reject) => {
    // Standard A4 is 595.28 x 841.89 points
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 0, bottom: 0, left: 0, right: 0 } // Manual margins for full-bleed feel
    });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    // --- COLORS ---
    const primaryNavy = '#1A237E';
    const accentGold = '#C5A059';
    const lightGray = '#F5F5F5';
    const textGray = '#444444';

    // 1. BACKGROUND DESIGN
    // Left Sidebar Accent
    doc.rect(0, 0, 200, 841.89).fill(primaryNavy);
    // Main Body Background
    doc.rect(200, 0, 395.28, 841.89).fill('#FFFFFF');

    // 2. HEADER / LOGO (Inside Sidebar)
    doc.fillColor('#FFFFFF')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('NATIVE', 40, 60)
       .text('NEST', 40, 85)
       .rect(40, 115, 30, 3).fill(accentGold); // Elegant gold underline

    doc.fillColor('#FFFFFF')
       .fontSize(10)
       .font('Helvetica')
       .text('PROPERTY EXHIBITION', 40, 130, { characterSpacing: 1 });

    // 3. MAIN BANNER IMAGE
    // If no image, we create a placeholder box to maintain layout
    if (event.banner_image) {
      doc.image(event.banner_image, 230, 50, { width: 330, height: 220, cover: [330, 220] });
    } else {
      doc.rect(230, 50, 330, 220).fill(lightGray);
      doc.fillColor('#CCCCCC').fontSize(12).text('Property Preview Image', 330, 150);
    }

    // 4. TITLES & DATE
    doc.fillColor(primaryNavy)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text((event.event_name || 'LUXURY PROPERTY FAIR').toUpperCase(), 230, 290, { width: 330 });

    const date = new Date(event.start_date);
    const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    
    doc.fillColor(accentGold)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(dateStr.toUpperCase(), 230, 350);

    // 5. DESCRIPTION
    doc.fillColor(textGray)
       .fontSize(11)
       .font('Helvetica')
       .text(event.description || 'Discover an exquisite collection of premium properties. Experience architecture and lifestyle excellence in one exclusive event.', 230, 380, { width: 330, lineGap: 5 });

    // 6. FEATURES / "WHAT YOU'LL GAIN" (In the Navy Sidebar)
    doc.fillColor(accentGold)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('EVENT HIGHLIGHTS', 40, 450);

    const benefits = [
      'Expert Consultations',
      'Virtual Site Tours',
      'Exclusive Pricing',
      'Market Analytics',
      'Networking'
    ];

    let listY = 480;
    benefits.forEach((item) => {
      doc.circle(45, listY + 5, 3).fill(accentGold);
      doc.fillColor('#FFFFFF')
         .fontSize(10)
         .font('Helvetica')
         .text(item, 60, listY);
      listY += 25;
    });

    // 7. CALL TO ACTION & BADGE
    // Circular Badge on the right
    doc.circle(500, 450, 45).lineWidth(2).stroke(accentGold);
    doc.fillColor(primaryNavy)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('ENTRY', 480, 438)
       .fontSize(16)
       .text('FREE', 478, 452);

    // 8. REGISTRATION & CONTACT
    doc.rect(230, 580, 330, 150).fill(lightGray); // Contact Box
    
    doc.fillColor(primaryNavy)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('SECURE YOUR SPOT:', 250, 600);

    let ctaText = '';
    let ctaLink = '';
    if (recipientType === 'builder') {
      ctaText = 'Book your stalls';
      ctaLink = `http://localhost:5173/builder-dashboard/events`;
    } else if (recipientType === 'buyer') {
      ctaText = 'Register for the event';
      ctaLink = `http://localhost:5173/buyer-dashboard/events`;
    } // For 'admin' or null, no link/text

    if (ctaText && ctaLink) {
      doc.fillColor('#0000FF')
         .fontSize(10)
         .font('Helvetica')
         .text(ctaText, 250, 620, {
           link: ctaLink,
           underline: true
         });
    }

    doc.fillColor(textGray)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('LOCATION:', 250, 655)
       .font('Helvetica')
       .text(`${event.event_location || 'Grand Convention Hall'}`, 250, 670)
       .text(`${event.city || 'Downtown'}, ${event.state || ''}`, 250, 685);

    doc.fillColor(textGray)
       .fontSize(10)
       .text(`Inquiries: ${event.contact_phone || '+1 234 567 890'}`, 250, 705);

    // 9. FOOTER
    doc.rect(0, 800, 595.28, 41.89).fill(primaryNavy);
    doc.fillColor('#FFFFFF')
       .fontSize(8)
       .text('© 2026 NATIVE NEST PROPERTY EXHIBITION PLATFORM', 0, 815, { align: 'center' });

    doc.end();
  });
};

module.exports = { generateEventInvitationPDF };