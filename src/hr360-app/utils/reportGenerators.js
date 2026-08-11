import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDuration } from './formatters';

export function generateCSV(data, title) {
  if (!data || data.length === 0) return;

  const headers = ['Employee', 'Department', 'Total Hours', 'Productive Hours', 'Productivity Score', 'Days Present', 'Days Absent'];
  
  const csvRows = [
    headers.join(','),
    ...data.map(row => [
      `"${row.name}"`,
      `"${row.department}"`,
      row.totalHours,
      row.productiveHours,
      row.score,
      row.present,
      row.absent
    ].join(','))
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePDF(data, title) {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, 22);
  
  // Add generated date
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 30);

  const tableColumn = ['Employee', 'Department', 'Total Time', 'Productive Time', 'Score', 'Present', 'Absent'];
  const tableRows = [];

  data.forEach(row => {
    const rowData = [
      row.name,
      row.department,
      formatDuration(Math.round(row.totalHours * 60)),
      formatDuration(Math.round(row.productiveHours * 60)),
      `${row.score}`,
      row.present.toString(),
      row.absent.toString()
    ];
    tableRows.push(rowData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 38,
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [79, 70, 229], // brand color
      textColor: 255,
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // light slate
    }
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}
