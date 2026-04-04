'use client';
import { useState } from 'react';
import { jsPDF } from 'jspdf';

export default function PDFGenerator({ topic, history, criticResults, userVote }) {
  const [loading, setLoading] = useState(false);
  const [paperLoading, setPaperLoading] = useState(false);

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
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("MULTI-MIND SIMULATOR OFFICIAL TRANSCRIPT", 14, 22);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      const splitTopic = doc.splitTextToSize(`Directive: ${topic}`, 180);
      doc.text(splitTopic, 14, 32);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(data.text, 180);
      let yPos = 45;
      for (let i = 0; i < splitText.length; i++) {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.text(splitText[i], 14, yPos);
        yPos += 5;
      }
      doc.save('Multi-Mind-Simulation-Report.pdf');
    } catch(e) {
      console.error("PDF generation error: ", e);
      alert("Error generating PDF summary.");
    }
    setLoading(false);
  };

  const downloadIEEEPaper = async () => {
    setPaperLoading(true);
    try {
      const res = await fetch('/api/research-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, history, criticResults, userVote })
      });
      if (!res.ok) throw new Error('Synthesis Failed');
      const data = await res.json();
      const doc = new jsPDF();
      
      // --- IEEE TITLE & AUTHORS ---
      doc.setFont("times", "bold");
      doc.setFontSize(24);
      const titleLines = doc.splitTextToSize(data.title.toUpperCase(), 160);
      doc.text(titleLines, 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.text(data.authors, 105, 45, { align: 'center' });

      // --- ABSTRACT ---
      doc.setFont("times", "bolditalic");
      doc.setFontSize(9);
      doc.text("Abstract—", 20, 60);
      doc.setFont("times", "italic");
      const abstractLines = doc.splitTextToSize(data.abstract, 160);
      doc.text(abstractLines, 35, 60);
      
      let yStart = 60 + (abstractLines.length * 4) + 10;
      
      // --- TWO COLUMN CORE ---
      const colWidth = 90;
      const gutter = 10;
      let currentColumn = 0; // 0 = Left, 1 = Right
      let xPos = [15, 110];
      let yPos = yStart;
      const maxY = 270;

      const renderSection = (title, content) => {
        // Section Header
        if (yPos > maxY - 10) switchColumn();
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.text(title.toUpperCase(), xPos[currentColumn], yPos);
        yPos += 6;

        // Content
        doc.setFont("times", "normal");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(content, colWidth);
        
        for (let line of lines) {
          if (yPos > maxY) switchColumn();
          doc.text(line, xPos[currentColumn], yPos);
          yPos += 4;
        }
        yPos += 8; // Padding after section
      };

      const switchColumn = () => {
        if (currentColumn === 0) {
          currentColumn = 1;
          yPos = yStart > 40 ? yStart : 20; // Handle page start
        } else {
          doc.addPage();
          currentColumn = 0;
          yStart = 20;
          yPos = 20;
        }
      };

      renderSection("I. Introduction", data.introduction);
      renderSection("II. Methodology", data.methodology);
      renderSection("III. Adversarial Analysis", data.analysis);
      renderSection("IV. Results & Final Verdict", data.results);
      renderSection("V. Conclusion", data.conclusion);

      doc.save('Multi-Mind-Research-Paper.pdf');
    } catch(e) {
      console.error("Research paper error:", e);
      alert("Error generating IEEE Paper.");
    }
    setPaperLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
      <button className="btn btn-primary" 
        style={{ width: '100%', padding: '1rem', background: 'linear-gradient(90deg, #ffb700, #ff5e00)', borderColor: '#ffb700', color: '#000', fontWeight: 'bold' }} 
        onClick={downloadPDF} 
        disabled={loading || paperLoading}
      >
        {loading ? "COMPILING REPORT..." : "DOWNLOAD PDF REPORT"}
      </button>

      <button className="btn" 
        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 'bold' }} 
        onClick={downloadIEEEPaper} 
        disabled={loading || paperLoading}
      >
        {paperLoading ? "SYNTHESIZING RESEARCH..." : "EXPORT IEEE RESEARCH PAPER 📄"}
      </button>
    </div>
  );
}
