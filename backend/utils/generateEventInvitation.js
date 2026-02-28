const PDFDocument = require('pdfkit');

const generateEventInvitationPDF = (event, recipientType = null) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 0, bottom: 0, left: 0, right: 0 } 
    });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // --- BRAND PALETTE ---
    const colors = {
      deepNavy: '#0F172A',
      accentGold: '#B8977E', // Muted champagne gold
      softWhite: '#F8FAFC',
      textMain: '#1E293B',
      textMuted: '#64748B'
    };

    // 1. DYNAMIC BACKGROUND
    // Gradient Sidebar
    const grad = doc.linearGradient(0, 0, 250, 841);
    grad.stop(0, colors.deepNavy).stop(1, '#1E293B');
    doc.rect(0, 0, 240, 841.89).fill(grad);

    // Abstract Slanted Shape for Modern Feel
    doc.save()
       .moveTo(240, 0)
       .lineTo(320, 0)
       .lineTo(240, 400)
       .fillColor(colors.deepNavy)
       .fillOpacity(0.05)
       .fill();
    doc.restore();

    // 2. LOGO SECTION
    doc.fillColor(colors.accentGold)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('NATIVE', 45, 60, { characterSpacing: 2 })
       .fillColor('#FFFFFF')
       .text('NEST', 45, 88, { characterSpacing: 8 });
    
    doc.path('M 45 125 L 100 125').lineWidth(1).stroke(colors.accentGold);

    // 3. HERO IMAGE WITH BORDER
    const imgX = 280, imgY = 60, imgW = 280, imgH = 350;
    if (event.banner_image) {
      doc.image(event.banner_image, imgX, imgY, { width: imgW, height: imgH, cover: [imgW, imgH] });
    } else {
      doc.rect(imgX, imgY, imgW, imgH).fill('#E2E8F0');
      doc.fillColor(colors.textMuted).fontSize(10).text('PREMIUM PROPERTY VIEW', imgX + 80, imgY + 160);
    }
    // Decorative Gold Frame Offset
    doc.rect(imgX + 15, imgY + 15, imgW, imgH).lineWidth(1).stroke(colors.accentGold);

    // 4. MAIN CONTENT
    doc.fillColor(colors.deepNavy)
       .fontSize(32)
       .font('Helvetica-Bold')
       .text(event.event_name || 'EXCLUSIVE REAL ESTATE EXPO', 45, 480, { width: 400 });

    // Date/Time Badge
    const date = new Date(event.start_date || Date.now());
    const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    
    doc.rect(45, 570, 160, 35).fill(colors.accentGold);
    doc.fillColor('#FFFFFF')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(dateStr.toUpperCase(), 60, 582, { characterSpacing: 1 });

    // 5. SIDEBAR HIGHLIGHTS
    doc.fillColor(colors.accentGold)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('EVENT PRIVILEGES', 45, 200);

    const perks = ['Private Tours', 'Direct Builder Access', 'VIP Pricing', 'Market Insights'];
    perks.forEach((perk, i) => {
      let yPos = 230 + (i * 35);
      // Small decorative dash
      doc.path(`M 45 ${yPos + 7} L 55 ${yPos + 7}`).lineWidth(2).stroke(colors.accentGold);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica').text(perk, 65, yPos);
    });

    // 6. DESCRIPTION & CTA
    doc.fillColor(colors.textMain)
       .fontSize(11)
       .font('Helvetica')
       .text(event.description || 'Join us for an unparalleled journey through the finest architectural masterpieces. Experience luxury redefined.', 230, 630, { width: 320, lineGap: 6, align: 'left' });

    // Registration Box
    doc.roundedRect(230, 710, 330, 80, 5).fill(colors.softWhite);
    
    let ctaText = 'Scan to Register';
    let ctaLink = `http://localhost:5173/events`;
    if (recipientType === 'builder') ctaText = 'RESERVE EXHIBITOR SPACE';
    if (recipientType === 'buyer') ctaText = 'GET YOUR VISITOR PASS';

    doc.fillColor(colors.deepNavy).font('Helvetica-Bold').fontSize(10).text(ctaText.toUpperCase(), 250, 730);
    doc.fillColor('#2563EB').fontSize(9).text('Click here to open registration portal', 250, 750, { link: ctaLink, underline: true });

    // 7. LOCATION BLOCK (Bottom Left)
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text('WHERE', 45, 730);
    doc.fillColor('#CBD5E1').font('Helvetica').fontSize(9)
       .text(event.event_location || 'Grand Plaza Mall', 45, 745)
       .text(`${event.city || 'Dubai'}, ${event.state || 'UAE'}`, 45, 758);

    // 8. MINIMAL FOOTER
    doc.rect(0, 820, 595.28, 22).fill(colors.deepNavy);
    doc.fillColor('#475569').fontSize(7).text('INVITATION ONLY • NATIVE NEST 2026', 0, 828, { align: 'center', characterSpacing: 2 });

    doc.end();
  });
};

module.exports = { generateEventInvitationPDF };