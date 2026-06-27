"use client";

import React, { useEffect, useState, useRef } from "react";

export default function InvoicePage() {
  // Dependencies refs
  const html2canvasRef = useRef<any>(null);
  const html2pdfRef = useRef<any>(null);

  // Form States
  const [invoiceNum, setInvoiceNum] = useState("RAKIBUL-2026-02");
  const [invoiceYear, setInvoiceYear] = useState(2026);
  const [invoiceMonth, setInvoiceMonth] = useState(5); // June
  const [billingCycle, setBillingCycle] = useState("2H");
  const [clientName, setClientName] = useState("ACDX Finance");
  const [clientEmail, setClientEmail] = useState("acdx.finance@gmail.com");
  const [ratePerOrder, setRatePerOrder] = useState(0.50);
  
  // Daily Inputs Quantities state: Keyed by string date "YYYY-MM-DD"
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  // Lazy-load client scripts safely away from SSR
  useEffect(() => {
    import("html2canvas" as any).then((mod) => {
      html2canvasRef.current = mod.default || mod;
    }).catch(() => {});
    
    // @ts-ignore
    import("html2pdf.js").then((mod) => {
      html2pdfRef.current = mod.default || mod;
    }).catch(() => {});
  }, []);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

  // Compute daily input layout configs
  const startDay = 1;
  const endDay = billingCycle === "1H" ? 15 : getDaysInMonth(invoiceYear, invoiceMonth);
  
  const dailyDaysArray = [];
  for (let d = startDay; d <= endDay; d++) {
    dailyDaysArray.push(d);
  }

  const handleQuantityChange = (dateStr: string, val: string) => {
    setQuantities(prev => ({ ...prev, [dateStr]: val }));
  };

  const clearQuantities = () => {
    setQuantities({});
  };

  // Helper date rendering labels
  const currentMonthShort = new Date(invoiceYear, invoiceMonth, 1).toLocaleString("en-US", { month: "short" });
  const lastDayOfCycle = (billingCycle === "1H") ? 15 : getDaysInMonth(invoiceYear, invoiceMonth);
  const invoiceDateString = `${lastDayOfCycle}-${currentMonthShort}-${invoiceYear}`;
  const periodStartString = (billingCycle === "1H") ? `01-${currentMonthShort}-${invoiceYear}` : `16-${currentMonthShort}-${invoiceYear}`;
  const periodEndString = `${lastDayOfCycle}-${currentMonthShort}-${invoiceYear}`;

  // Process data lines
  let totalOrders = 0;
  const activeRows: Array<{ label: string; val: number }> = [];

  dailyDaysArray.forEach((d) => {
    const dateStr = `${invoiceYear}-${String(invoiceMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const labelStr = `${d}-${new Date(invoiceYear, invoiceMonth, d).toLocaleString("en-US", { month: "short" })}-${invoiceYear}`;
    const val = parseInt(quantities[dateStr] || "") || 0;
    
    if (val > 0) {
      totalOrders += val;
      activeRows.push({ label: labelStr, val });
    }
  });

  const grandTotal = totalOrders * ratePerOrder;

  function numberToWords(num: number) {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    let totalCents = Math.round(num * 100);
    let dollars = Math.floor(totalCents / 100);
    let cents = totalCents % 100;
    
    function convertLessThanOneThousand(n: number): string {
      if (n < 20) return a[n];
      let digit = n % 10;
      if (n < 100) return b[Math.floor(n / 10)] + (digit ? "-" + a[digit] : "");
      return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertLessThanOneThousand(n % 100) : "");
    }

    function convert(n: number): string {
      if (n === 0) return "Zero";
      let wordStr = "";
      if (Math.floor(n / 1000) > 0) {
        wordStr += convertLessThanOneThousand(Math.floor(n / 1000)) + " Thousand";
        n = n % 1000;
        if (n > 0) {
          wordStr += (n < 100 ? " and " : " ");
        }
      }
      if (n > 0) {
        wordStr += convertLessThanOneThousand(n);
      }
      return wordStr;
    }
    
    let str = "";
    if (dollars === 0) {
      str = "Zero Dollars";
    } else {
      str = convert(dollars) + " Dollar" + (dollars > 1 ? "s" : "");
    }
    
    if (cents > 0) {
      str += " and " + convertLessThanOneThousand(cents) + " Cent" + (cents > 1 ? "s" : "") + " Only.";
    } else {
      str += " Only.";
    }
    return str;
  }

  const downloadImage = (format: "png" | "jpeg") => {
    const target = document.getElementById("invoice-target");
    if (!target || !html2canvasRef.current) return;

    const options = {
      scale: 3, 
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: "#FFFFFF"
    };

    html2canvasRef.current(target, options).then((canvas: any) => {
      const link = document.createElement("a");
      link.download = `${invoiceNum || "Invoice"}.${format === "jpeg" ? "jpg" : "png"}`;
      link.href = canvas.toDataURL(`image/${format}`, 0.98);
      link.click();
    });
  };

  const downloadPDF = () => {
    const element = document.getElementById("invoice-target");
    if (!element || !html2pdfRef.current) return;

    const initialWrapperStyles = element.parentElement?.getAttribute("style") || "";
    const originalTransform = element.style.transform;
    
    if (element.parentElement) {
      element.parentElement.style.width = "210mm";
      element.parentElement.style.height = "297mm";
      element.parentElement.style.overflow = "hidden";
    }
    element.style.transform = "none";

    const opt = {
      margin: 0,
      filename: `${invoiceNum || "Invoice"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2.5, 
        useCORS: true, 
        allowTaint: false,
        scrollY: 0,
        scrollX: 0,
        logging: false
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all"] }
    };

    html2pdfRef.current().set(opt).from(element).toPdf().get("pdf").then(function(pdf: any) {
      const totalPages = pdf.internal.getNumberOfPages();
      if (totalPages > 1) {
        for (let i = totalPages; i > 1; i--) {
          pdf.deletePage(i);
        }
      }
    }).save().then(() => {
      element.parentElement?.setAttribute("style", initialWrapperStyles);
      element.style.transform = originalTransform;
    }).catch((err: any) => {
      console.error("PDF generation error bypassed safely:", err);
      element.parentElement?.setAttribute("style", initialWrapperStyles);
      element.style.transform = originalTransform;
    });
  };

  return (
    <>
      {/* Structural Web Typography Embed Injection */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,600&display=swap" rel="stylesheet" />

      {/* Styled Embed Injection isolating context from global file pollution */}
      <style jsx global>{`
        :root {
            --navy: #1C241E;
            --sage-light: #DCE5DB;
            --sage-dark: #6C8275;
            --terracotta: #AF7368;
            --bg-sidebar: #F9FAF9;
            --white: #FFFFFF;
            --stripe: #F5F7F5;
        }
        .btn-clear {
            background: #EF4444;
            color: var(--white);
            margin-top: 5px;
            border-radius: 4px;
            font-size: 0.8rem;
        }
        .btn-clear:hover {
            background: #DC2626;
        }
        .app-container-box * { box-sizing: border-box; margin: 0; padding: 0; }
        .app-container-box { font-family: 'Montserrat', sans-serif; background-color: #0F172A; color: #334155; overflow: hidden; display: flex; height: 100vh; width: 100vw; }

        .control-panel { width: 360px; background: var(--white); border-right: 1px solid #E2E8F0; display: flex; flex-direction: column; height: 100%; padding: 15px; overflow-y: auto; }
        .panel-header h2 { font-size: 1rem; margin-bottom: 15px; color: #0F172A; font-weight: 700; }
        .form-section { background: #F8FAFC; padding: 12px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #E2E8F0; }
        .form-section h3 { font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px; color: #64748B; }
        .form-section input, .form-section select { width: 100%; padding: 6px; margin-bottom: 6px; font-size: 0.8rem; border: 1px solid #CBD5E1; border-radius: 4px; color: #334155; background-color: var(--white); }
        .daily-inputs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: 4px; }
        .action-buttons { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
        .btn { padding: 10px; font-size: 0.85rem; font-weight: 600; border: none; border-radius: 4px; cursor: pointer; text-align: center; }
        .btn-primary { background: #ac2ef5; color: var(--white); }
        .btn-secondary { background: #ac2ef5; color: var(--white); }

        .preview-panel { flex: 1; background: #475569; padding: 20px; overflow: auto; display: flex; justify-content: center; align-items: flex-start; }
        .invoice-paper-wrapper { width: 210mm; max-height: 297mm; background: var(--white); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
        .invoice-paper { width: 210mm; height: 297mm; max-height: 297mm; display: flex; background: var(--white); color: var(--navy); overflow: hidden; position: relative; box-sizing: border-box; }

        .sidebar { width: 28%; background: var(--bg-sidebar); border-right: 1px solid #E2EAE2; padding: 35px 20px; display: flex; flex-direction: column; }
        .logo-area { height: 140px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
        .logo-container { position: relative; width: 130px; height: 130px; display: flex; justify-content: center; align-items: center; }
        .splash { position: absolute; mix-blend-mode: multiply; opacity: 0.85; filter: blur(2px); }
        
        .green-1 { width: 85px; height: 82px; background: radial-gradient(circle, rgba(143,165,140,0.9) 0%, rgba(118,141,114,0.7) 70%, rgba(118,141,114,0) 100%); left: 6px; top: 16px; border-radius: 43% 57% 41% 59% / 51% 45% 55% 49%; }
        .green-2 { width: 65px; height: 62px; background: radial-gradient(circle, rgba(162,184,159,0.85) 0%, rgba(135,158,131,0.6) 80%, rgba(135,158,131,0) 100%); left: 16px; top: 42px; border-radius: 55% 45% 52% 48% / 43% 53% 47% 57%; }
        .green-3 { width: 59px; height: 55px; background: radial-gradient(circle, rgba(148,171,145,0.8) 0%, rgba(122,146,118,0.5) 80%, rgba(122,146,118,0) 100%); left: 26px; top: 10px; border-radius: 48% 52% 45% 55% / 55% 42% 58% 45%; }
        .peach-1 { width: 82px; height: 78px; background: radial-gradient(circle, rgba(222,159,141,0.9) 0%, rgba(204,136,116,0.7) 70%, rgba(204,136,116,0) 100%); right: 6px; bottom: 20px; border-radius: 52% 48% 57% 43% / 47% 55% 45% 53%; }
        .peach-2 { width: 68px; height: 68px; background: radial-gradient(circle, rgba(235,178,161,0.85) 0%, rgba(214,151,131,0.6) 80%, rgba(214,151,131,0) 100%); right: 16px; bottom: 40px; border-radius: 45% 55% 48% 52% / 53% 43% 57% 47%; }
        .peach-3 { width: 62px; height: 59px; background: radial-gradient(circle, rgba(227,167,149,0.8) 0%, rgba(209,143,123,0.5) 80%, rgba(209,143,123,0) 100%); right: 23px; bottom: 10px; border-radius: 57% 43% 52% 48% / 42% 56% 44% 58%; }
        
        .text-overlay { position: relative; z-index: 10; color: #ffffff; font-family: 'Times New Roman', Times, Baskerville, Georgia, serif; font-size: 36px; font-weight: 400; letter-spacing: -0.5px; user-select: none; text-shadow: 0px 0px 1.5px rgba(255, 255, 255, 0.45); }
        .main-title { font-size: 2rem; font-weight: 700; letter-spacing: 4px; margin-bottom: 5px; }
        .invoice-id { font-size: 1rem; font-weight: 600; color: var(--terracotta); margin-bottom: 35px; }
        .info-blocks { display: flex; flex-direction: column; gap: 24px; }
        .block { border-bottom: 1px dashed #D2DDD2; padding-bottom: 14px; }
        .block:last-child { border-bottom: none; }
        .block .label { display: block; font-size: 0.72rem; font-weight: 700; color: var(--navy); margin-bottom: 6px; letter-spacing: 0.5px; }
        .val { font-size: 0.82rem; font-weight: 500; color: #424A44; }
        .val-bold { font-size: 0.85rem; font-weight: 700; color: var(--navy); }
        .val-muted { font-size: 0.78rem; color: #5B665E; }
        .val-small { font-size: 0.75rem; word-break: break-all; }
        .val-period { display: flex; flex-direction: column; font-size: 0.82rem; }
        .to-text { font-size: 0.75rem; color: #7A857D; margin: 1px 0 1px 15px; }
        .sidebar-footer { margin-top: auto; text-align: center; padding-top: 10px; }
        .leaf-divider { font-size: 0.9rem; color: var(--sage-dark); border-top: 2px solid #E2EAE2; margin-bottom: 5px; }
        .cursive-thanks { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: 1.15rem; color: var(--sage-dark); }

        .main-content { width: 72%; padding: 45px 30px 30px 35px; display: flex; flex-direction: column; box-sizing: border-box; }
        .main-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .header-left h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 6px; color: var(--navy); }
        .header-left p { font-size: 0.82rem; color: #4F5851; font-weight: 500; }
        .header-right { text-align: right; font-size: 0.82rem; color: #4F5851; font-weight: 500; line-height: 1.4; }
        .table-scroll-container { flex: 1; overflow-y: auto; margin-bottom: 20px; }
        
        @media print { .table-scroll-container { overflow: hidden; } }
        
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .data-table th { background: var(--sage-light); color: var(--navy); font-weight: 700; padding: 10px 12px; letter-spacing: 0.5px; position: sticky; top: 0; z-index: 1; }
        .data-table td { padding: 9px 12px; border-bottom: 1px solid #E4EBE4; font-weight: 500; color: #3A423C; }
        .data-table tbody tr:nth-child(even) { background: var(--stripe); }
        
        .bottom-summary-row { display: flex; justify-content: space-between; gap: 20px; margin-top: auto; padding-top: 15px; margin-bottom: 25px; }
        .words-card { flex: 1; border: 1px solid #C5D0C5; border-radius: 6px; padding: 12px; background: var(--white); }
        .card-label { font-size: 0.68rem; font-weight: 700; display: block; margin-bottom: 6px; color: var(--navy); }
        #view-amount-words { font-size: 0.8rem; font-weight: 500; line-height: 1.4; color: #3A423C; }
        .totals-card { width: 230px; background: #EBF0EB; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
        .totals-card .row { display: flex; justify-content: space-between; font-size: 0.72rem; font-weight: 700; color: #4F5851; }
        .totals-card .due-row { border-top: 1px dashed #AEC0AE; margin-top: 2px; padding-top: 8px; font-size: 0.78rem; color: var(--navy); align-items: center; }
        .due-row :last-child { color: var(--terracotta); font-size: 1.2rem; font-weight: 700; }
        .main-footer { text-align: center; padding-top: 15px; border-top: 2px solid #E2EAE2; margin-top: auto; }
        .main-footer p { font-size: 0.72rem; color: #6B756E; font-weight: 500; }
      `}</style>

      <div className="app-container-box">
        <aside className="control-panel">
          <header className="panel-header">
            <h2>RK Invoice Controls</h2>
          </header>
          <form id="invoice-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-section">
              <h3>Details</h3>
              <input type="text" id="invoice-num" value={invoiceNum} onChange={(e) => setInvoiceNum(e.target.value)} />
              <input type="number" id="invoice-year" value={invoiceYear} onChange={(e) => setInvoiceYear(parseInt(e.target.value) || 2026)} />
              <select id="invoice-month" value={invoiceMonth} onChange={(e) => setInvoiceMonth(parseInt(e.target.value))}>
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </select>
              <select id="billing-cycle" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
                <option value="1H">First Half (1 → 15)</option>
                <option value="2H">Second Half (16 → End)</option>
              </select>
            </div>
            
            <div className="form-section">
              <h3>Client</h3>
              <input type="text" id="client-name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              <input type="email" id="client-email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
            
            <div className="form-section">
              <h3>Rates & Quantities</h3>
              <input type="number" id="rate-per-order" step="0.01" value={ratePerOrder} onChange={(e) => setRatePerOrder(parseFloat(e.target.value) || 0)} />
              <div id="daily-inputs-container" class="daily-inputs-grid">
                {dailyDaysArray.map((d) => {
                  const dateStr = `${invoiceYear}-${String(invoiceMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  return (
                    <div key={d} className="input-item">
                      <label style={{ fontSize: "0.65rem", display: "block", textAlign: "center", fontWeight: 600, marginBottom: "2px" }}>{d}</label>
                      <input 
                        type="number" 
                        min="0" 
                        value={quantities[dateStr] || ""} 
                        onChange={(e) => handleQuantityChange(dateStr, e.target.value)}
                        style={{ width: "100%", textAlign: "center", padding: "2px", margin: 0 }} 
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="action-buttons">
              <button type="button" onClick={() => downloadImage("png")} className="btn btn-primary">PNG</button>
              <button type="button" onClick={() => downloadImage("jpeg")} className="btn btn-secondary">JPG</button>
              <button type="button" onClick={downloadPDF} className="btn btn-secondary">PDF</button>
              <button type="button" onClick={clearQuantities} className="btn btn-clear">Clear</button>
            </div>
          </form>
        </aside>

        <main className="preview-panel">
          <div className="invoice-paper-wrapper">
            <div id="invoice-target" className="invoice-paper">
              
              <div className="sidebar">
                <div className="logo-area">
                  <div className="logo-container">
                    <div className="splash green-1"></div>
                    <div className="splash green-2"></div>
                    <div className="splash green-3"></div>
                    <div className="splash peach-1"></div>
                    <div className="splash peach-2"></div>
                    <div className="splash peach-3"></div>
                    <div className="text-overlay">RK</div>
                  </div>
                </div>
                <div className="meta-area">
                  <h1 className="main-title">INVOICE</h1>
                  <div id="view-invoice-num" className="invoice-id">{invoiceNum}</div>
                </div>
                <div className="info-blocks">
                  <div className="block">
                    <span className="label">CLIENT</span>
                    <div id="view-client-name" className="val-bold">{clientName}</div>
                    <div id="view-client-email" className="val-muted">{clientEmail}</div>
                  </div>
                  <div className="block">
                    <span className="label">INVOICE DATE</span>
                    <div id="view-invoice-date" className="val">{invoiceDateString}</div>
                  </div>
                  <div className="block">
                    <span className="label">BILLING PERIOD</span>
                    <div className="val-period">
                      <span id="view-period-start">{periodStartString}</span>
                      <span className="to-text">to</span>
                      <span id="view-period-end">{periodEndString}</span>
                    </div>
                  </div>
                  <div className="block">
                    <span className="label">PAYMENT METHOD</span>
                    <div id="view-payment-method" className="val">Payoneer</div>
                  </div>
                  <div className="block">
                    <span className="label">PAYONEER ID</span>
                    <div id="view-payoneer-id" className="val-small">mtmony02@gmail.com</div>
                  </div>
                </div>
                <div className="sidebar-footer">
                  <div className="leaf-divider"></div>
                  <p className="cursive-thanks">Thank you for your business!</p>
                </div>
              </div>

              <div className="main-content">
                <header className="main-header">
                  <div className="header-left">
                    <h2 id="view-free-name">SYED RAKIBUL HALIM MONY</h2>
                    <p id="view-free-line1">Gouripur, Mymensingh</p>
                    <p id="view-free-line2">Bangladesh</p>
                  </div>
                  <div className="header-right">
                    <p id="view-free-email">mtmony02@gmail.com</p>
                    <p id="view-free-phone">+880 1710 402307</p>
                  </div>
                </header>

                <div className="table-scroll-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", paddingLeft: "15px" }}>DATE</th>
                        <th style={{ textAlign: "center" }}>ORDERS</th>
                        <th style={{ textAlign: "right" }}>RATE (USD)</th>
                        <th style={{ textAlign: "right", paddingRight: "15px" }}>AMOUNT (USD)</th>
                      </tr>
                    </thead>
                    <tbody id="invoice-table-body">
                      {activeRows.map((row, index) => (
                        <tr key={index}>
                          <td style={{ paddingLeft: "15px" }}>{row.label}</td>
                          <td style={{ textAlign: "center" }}>{row.val}</td>
                          <td style={{ textAlign: "right" }}>${ratePerOrder.toFixed(2)}</td>
                          <td style={{ textAlign: "right", paddingRight: "15px" }}>${(row.val * ratePerOrder).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bottom-summary-row">
                  <div className="words-card">
                    <span className="card-label">AMOUNT IN WORDS</span>
                    <p id="view-amount-words">{numberToWords(grandTotal)}</p>
                  </div>
                  <div className="totals-card">
                    <div className="row"><span>TOTAL ORDERS</span><span id="view-total-orders">{totalOrders}</span></div>
                    <div className="row"><span>RATE PER ORDER</span><span id="view-rate-per-order">${ratePerOrder.toFixed(2)}</span></div>
                    <div className="row due-row"><span>TOTAL DUE (USD)</span><span id="view-total-due">${grandTotal.toFixed(2)}</span></div>
                  </div>
                </div>

                <footer className="main-footer">
                  <p>I appreciate your business and look forward to working with you again.</p>
                </footer>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
