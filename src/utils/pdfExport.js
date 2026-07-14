import { API_URL } from './config';

/**
 * GramConnect PDF Export Utility
 * Uses native browser printing in a hidden iframe to ensure perfect CSS/styling,
 * responsive scaling, zero bulky dependencies, and high-fidelity output.
 */

// Helper to get status styling for the print output
const getStatusLabelStyle = (status) => {
  switch (status) {
    case 'Pending': return 'color: #dc2626; background-color: #fef2f2; border: 1px solid #fca5a5;';
    case 'In Progress': return 'color: #d97706; background-color: #fffbeb; border: 1px solid #fcd34d;';
    case 'Resolved': return 'color: #059669; background-color: #ecfdf5; border: 1px solid #6ee7b7;';
    default: return 'color: #4b5563; background-color: #f9fafb; border: 1px solid #e5e7eb;';
  }
};

const getPriorityLabelStyle = (priority) => {
  switch (priority) {
    case 'Low': return 'color: #2563eb; background-color: #eff6ff; border: 1px solid #93c5fd;';
    case 'Medium': return 'color: #4b5563; background-color: #f9fafb; border: 1px solid #e5e7eb;';
    case 'High': return 'color: #ea580c; background-color: #fff7ed; border: 1px solid #fdba74; font-weight: bold;';
    case 'Emergency': return 'color: #dc2626; background-color: #fef2f2; border: 1px solid #fca5a5; font-weight: bold; animation: pulse 2s infinite;';
    default: return 'color: #4b5563; background-color: #f9fafb;';
  }
};

/**
 * Exports a single complaint ticket as a beautiful A4 official receipt.
 */
export function exportComplaintToPDF(complaint) {
  if (!complaint) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const printWindow = iframe.contentWindow || iframe.contentDocument;
  const doc = printWindow.document || printWindow;

  const createdDate = new Date(complaint.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const imageUrl = complaint.image_path 
    ? (complaint.image_path.startsWith('http') ? complaint.image_path : `${API_URL}${complaint.image_path}`)
    : null;

  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Receipt_${complaint.id}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1f2937;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #ea580c;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .header-left h1 {
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            color: #ea580c;
            letter-spacing: -0.5px;
          }
          .header-left p {
            font-size: 11px;
            color: #6b7280;
            margin: 4px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .header-right {
            text-align: right;
          }
          .header-right p {
            margin: 0;
            font-size: 12px;
            color: #4b5563;
          }
          .header-right .doc-type {
            font-weight: 800;
            color: #ea580c;
            margin-top: 4px;
            font-size: 13px;
            letter-spacing: 1px;
          }
          
          .ticket-banner {
            background-color: #fcf8f5;
            border: 1px solid #ffedd5;
            border-radius: 12px;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
          }
          .ticket-banner h2 {
            margin: 0;
            font-family: monospace;
            font-size: 26px;
            color: #7c2d12;
            letter-spacing: 1px;
          }
          .badge {
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .grid-item {
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 10px;
          }
          .label {
            font-size: 10px;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .value {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
          }

          .content-section {
            margin-bottom: 25px;
          }
          .content-title {
            font-size: 12px;
            font-weight: 700;
            color: #4b5563;
            text-transform: uppercase;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
            margin-bottom: 10px;
          }
          .content-body {
            font-size: 14px;
            background-color: #f9fafb;
            border: 1px solid #f3f4f6;
            border-radius: 8px;
            padding: 15px;
            white-space: pre-wrap;
          }
          
          .resolution-box {
            background-color: #ecfdf5;
            border: 1px solid #d1fae5;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
          }
          .resolution-title {
            color: #065f46;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .resolution-body {
            color: #065f46;
            font-size: 14px;
            font-weight: 500;
          }

          .photo-container {
            margin-top: 25px;
            text-align: center;
          }
          .photo-container img {
            max-width: 50%;
            max-height: 200px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            object-fit: cover;
          }

          .signatures {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            padding: 0 10px;
          }
          .sig-line {
            width: 200px;
            border-top: 1px solid #9ca3af;
            text-align: center;
            padding-top: 6px;
            font-size: 11px;
            color: #4b5563;
            font-weight: 600;
          }

          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #f3f4f6;
            padding-top: 8px;
            font-size: 9px;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>GramConnect Smart Village</h1>
            <p>Government of Maharashtra &bull; Gram Panchayat Civic Cell</p>
          </div>
          <div class="header-right">
            <p>Printed: ${new Date().toLocaleDateString()}</p>
            <p class="doc-type">OFFICIAL TICKET</p>
          </div>
        </div>

        <div class="ticket-banner">
          <div>
            <div class="label" style="margin-bottom: 2px;">Complaint Reference</div>
            <h2>${complaint.id}</h2>
          </div>
          <span class="badge" style="${getStatusLabelStyle(complaint.status)}">
            ${complaint.status}
          </span>
        </div>

        <div class="grid">
          <div class="grid-item">
            <div class="label">Citizen Name</div>
            <div class="value">${complaint.citizen_name}</div>
          </div>
          <div class="grid-item">
            <div class="label">Village Name</div>
            <div class="value">${complaint.village_name}</div>
          </div>
          <div class="grid-item">
            <div class="label">Category</div>
            <div class="value">${complaint.category}</div>
          </div>
          <div class="grid-item">
            <div class="label">Date Filed</div>
            <div class="value">${createdDate}</div>
          </div>
          <div class="grid-item">
            <div class="label">Contact Number</div>
            <div class="value">${complaint.mobile_number}</div>
          </div>
          <div class="grid-item">
            <div class="label">Priority Level</div>
            <span class="badge" style="${getPriorityLabelStyle(complaint.priority || 'Medium')}">
              ${complaint.priority || 'Medium'}
            </span>
          </div>
        </div>

        <div class="content-section">
          <div class="content-title">Complaint Details</div>
          <div class="value" style="font-size: 15px; margin-bottom: 8px;">${complaint.title}</div>
          <div class="content-body">${complaint.description}</div>
        </div>

        ${complaint.resolution_notes ? `
          <div class="resolution-box">
            <div class="resolution-title">Resolution Notes / Action Taken</div>
            <div class="resolution-body">${complaint.resolution_notes}</div>
          </div>
        ` : ''}

        ${imageUrl ? `
          <div class="photo-container">
            <div class="label" style="text-align: left; margin-bottom: 6px;">Attached Document / Image Preview</div>
            <img src="${imageUrl}" alt="Complaint Attachment" />
          </div>
        ` : ''}

        <div class="signatures">
          <div class="sig-line">Citizen Signature</div>
          <div class="sig-line">Gram Panchayat Authority<br/>(Digital Approver)</div>
        </div>

        <div class="footer">
          <span>GramConnect Grievance Desk Initiative</span>
          <span>Security Verification: System Generated Receipt</span>
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Trigger print after a short delay to ensure rendering completes
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 600);
}

/**
 * Exports a summary list/table of currently filtered complaints for admins.
 */
export function exportComplaintsListToPDF(filteredComplaints, stats) {
  if (!filteredComplaints || filteredComplaints.length === 0) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const printWindow = iframe.contentWindow || iframe.contentDocument;
  const doc = printWindow.document || printWindow;

  const rows = filteredComplaints.map(item => `
    <tr>
      <td style="font-family: monospace; font-weight: bold; color: #ea580c;">${item.id}</td>
      <td>
        <div style="font-weight: 700;">${item.citizen_name}</div>
        <div style="font-size: 10px; color: #6b7280;">${item.village_name}</div>
      </td>
      <td>
        <div style="font-weight: 600; font-size: 12px;">${item.title}</div>
        <span style="font-size: 9px; color: #4b5563; background-color: #f3f4f6; padding: 1px 4px; border-radius: 4px;">${item.category}</span>
      </td>
      <td>
        <span class="badge" style="font-size: 9px; padding: 2px 6px; ${getPriorityLabelStyle(item.priority || 'Medium')}">
          ${item.priority || 'Medium'}
        </span>
      </td>
      <td>
        <span class="badge" style="font-size: 9px; padding: 2px 6px; ${getStatusLabelStyle(item.status)}">
          ${item.status}
        </span>
      </td>
      <td style="font-size: 11px;">${new Date(item.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');

  const resolutionRate = stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(0) : 0;

  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Grievance_Ledger_Report</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1f2937;
            line-height: 1.4;
            margin: 0;
            padding: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #ea580c;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 20px;
            font-weight: 800;
            margin: 0;
            color: #ea580c;
          }
          .header p {
            font-size: 10px;
            color: #6b7280;
            margin: 2px 0 0 0;
            text-transform: uppercase;
          }
          
          .stats-row {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .stats-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            background-color: #f9fafb;
          }
          .stats-card.highlighted {
            background-color: #f0fdf4;
            border-color: #bbf7d0;
          }
          .stats-label {
            font-size: 9px;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .stats-value {
            font-size: 18px;
            font-weight: 800;
            color: #111827;
            margin-top: 2px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 30px;
          }
          th {
            background-color: #f3f4f6;
            color: #4b5563;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            border-bottom: 2px solid #e5e7eb;
            text-align: left;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: middle;
          }
          tr:hover {
            background-color: #f9fafb;
          }
          
          .badge {
            display: inline-block;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #f3f4f6;
            padding-top: 8px;
            font-size: 8px;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>GramConnect Ledger Report</h1>
            <p>Panchayat Grievance Database Control Sheet</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; font-weight: 600;">Date Generated: ${new Date().toLocaleDateString()}</div>
            <div style="font-size: 10px; color: #6b7280;">Filtered Count: ${filteredComplaints.length} Tickets</div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stats-card">
            <div class="stats-label">Total Tickets</div>
            <div class="stats-value">${stats.total}</div>
          </div>
          <div class="stats-card" style="border-left: 3px solid #dc2626;">
            <div class="stats-label">Pending</div>
            <div class="stats-value" style="color: #dc2626;">${stats.pending}</div>
          </div>
          <div class="stats-card" style="border-left: 3px solid #d97706;">
            <div class="stats-label">In Progress</div>
            <div class="stats-value" style="color: #d97706;">${stats.in_progress}</div>
          </div>
          <div class="stats-card" style="border-left: 3px solid #059669;">
            <div class="stats-label">Resolved</div>
            <div class="stats-value" style="color: #059669;">${stats.resolved}</div>
          </div>
          <div class="stats-card highlighted">
            <div class="stats-label" style="color: #166534;">Resolution Rate</div>
            <div class="stats-value" style="color: #166534;">${resolutionRate}%</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Villager & Village</th>
              <th>Title & Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date Filed</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          <span>GramConnect Smart Village Initiative &bull; Confidential Report</span>
          <span>Page 1 of 1</span>
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 600);
}
