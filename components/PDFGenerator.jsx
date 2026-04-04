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

  const generateLocalPaper = (doc) => {
    console.log("Entering Local Synthesis Fallback...");
    // --- LOCAL FALLBACK DATA ---
    const localData = {
      title: `Adversarial Neural Deliberation: ${topic}`,
      authors: "Multi-Mind Neural Council (Local Simulation)",
      abstract: `This paper documents a high-fidelity adversarial simulation on the topic: "${topic}". Due to neural link constraints, this report was synthesized using the local simulation engine.`,
      introduction: `The objective of this deliberation was to explore the multifaceted implications of ${topic}. The simulation utilized a four-agent council to stress-test various logical perspectives and identify potential systemic risks.`,
      methodology: "A multi-agent agentic framework was deployed, featuring Oopsinator (Optimist), Professor Doom (Skeptic), Sarcastron (Satirist), and Glitchy (Analyst). Every agent utilized a local Chain-of-Thought reasoning pass before interjecting.",
      analysis: history.map(h => `${h.persona?.name}: ${h.text.substring(0, 150)}...`).join('\n\n'),
      results: `The final judicial verdict was delivered by VERDICTLORD based on the cumulative logical weight of 5 rounds of adversarial conflict. Audience vote distribution: ${userVote || 'Pending'}.`,
      conclusion: "The simulation demonstrated that adversarial deliberation reveals hidden logical fallacies that are otherwise obscured in single-agent environments. Further research into multi-mind alignment is recommended."
    };

    renderPaper(doc, localData, "Local-Simulation-Paper.pdf");
  };

  const renderPaper = (doc, data, filename) => {
      // --- IEEE TITLE & AUTHORS ---
      doc.setFont("times", "bold");
      doc.setFontSize(22);
      const paperTitle = (data.title || `RESEARCH_PAPER: ${topic}`).toUpperCase();
      const titleLines = doc.splitTextToSize(paperTitle, 160);
      doc.text(titleLines, 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.text(data.authors || "The Neural Council", 105, 45, { align: 'center' });

      // --- ABSTRACT ---
      doc.setFont("times", "bolditalic");
      doc.setFontSize(9);
      doc.text("Abstract—", 20, 60);
      doc.setFont("times", "italic");
      const abstractContent = data.abstract || "Deliberation summary pending.";
      const abstractLines = doc.splitTextToSize(abstractContent, 160);
      doc.text(abstractLines, 35, 60);
      
      let yStart = 60 + (abstractLines.length * 4) + 12;
      
      // --- TWO COLUMN CORE ---
      const colWidth = 90;
      let currentColumn = 0; // 0 = Left, 1 = Right
      let xPos = [15, 110];
      let yPos = yStart;
      const maxY = 275;

      const switchColumn = () => {
        if (currentColumn === 0) {
          currentColumn = 1;
          yPos = yStart > 40 ? yStart : 25; 
        } else {
          doc.addPage();
          currentColumn = 0;
          yStart = 25;
          yPos = 25;
        }
      };

      const renderSection = (title, content) => {
        if (!content) return;
        if (yPos > maxY - 15) switchColumn();
        
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.text(title.toUpperCase(), xPos[currentColumn], yPos);
        yPos += 7;

        doc.setFont("times", "normal");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(content, colWidth);
        
        for (let line of lines) {
          if (yPos > maxY) switchColumn();
          doc.text(line, xPos[currentColumn], yPos);
          yPos += 4.5;
        }
        yPos += 10; // Section spacer
      };

      renderSection("I. Introduction", data.introduction);
      renderSection("II. Methodology", data.methodology);
      renderSection("III. Adversarial Analysis", data.analysis);
      renderSection("IV. Results & Verdict", data.results);
      renderSection("V. Conclusion", data.conclusion);

      doc.save(filename || 'Multi-Mind-Research.pdf');
  };

  const downloadIEEEPaper = async () => {
    setPaperLoading(true);
    const doc = new jsPDF();
    try {
      const res = await fetch('/api/research-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, history, criticResults, userVote })
      });
      
      if (!res.ok) throw new Error('Neural Synthesis API Timeout/Error');
      
      const data = await res.json();
      if (!data || data.error) throw new Error(data.details || "Invalid Data Block");

      renderPaper(doc, data, "Multi-Mind-AI-Synthesis.pdf");
      
    } catch(e) {
      console.warn("Neural Synthesis Failed, falling back to Local Engine:", e.message);
      // Fallback to local generation if API fails
      generateLocalPaper(doc);
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
