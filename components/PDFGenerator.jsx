'use client';
import { useState } from 'react';
import { jsPDF } from 'jspdf';

export default function PDFGenerator({ topic, history, criticResults, userVote }) {
  const [loading, setLoading] = useState(false);

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/debate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, history, criticResults, userVote })
      });
      
      if (!res.ok) throw new Error('Summary Generation Failed');
      const data = await res.json();
      
      const doc = new jsPDF();
      
      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("MULTI-MIND SIMULATOR OFFICIAL TRANSCRIPT", 14, 22);
      
      // Topic
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      const splitTopic = doc.splitTextToSize(`Directive: ${topic}`, 180);
      doc.text(splitTopic, 14, 32);
      
      // Body
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(data.text, 180);
      
      // A safe way to handle page breaks for long text in jsPDF
      let yPos = 45;
      for (let i = 0; i < splitText.length; i++) {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(splitText[i], 14, yPos);
        yPos += 5;
      }
      
      doc.save('Multi-Mind-Simulation-Report.pdf');
    } catch(e) {
      console.error("PDF generation error: ", e);
      alert("Error generating PDF summary. Check API limits.");
    }
    setLoading(false);
  };

  return (
    <button className="btn btn-primary" 
      style={{ 
        width: '100%', 
        marginTop: '1rem', 
        padding: '1rem', 
        background: 'linear-gradient(90deg, #ffb700, #ff5e00)', 
        borderColor: '#ffb700', 
        color: '#000',
        fontWeight: 'bold',
        letterSpacing: '0.1em'
      }} 
      onClick={downloadPDF} 
      disabled={loading}
    >
      {loading ? "COMPILING REPORT DATA..." : "DOWNLOAD PDF REPORT"}
    </button>
  );
}
