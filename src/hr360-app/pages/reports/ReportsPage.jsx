import { useState, useEffect } from 'react';
import { FileBarChart, Download, Eye, FileText, Table } from 'lucide-react';
import { motion } from 'framer-motion';
import PageContainer from '@/hr360-app/components/shared/layout/PageContainer';
import Card from '@/hr360-app/components/shared/ui/Card';
import Button from '@/hr360-app/components/shared/ui/Button';
import StatusBadge from '@/hr360-app/components/shared/ui/StatusBadge';
import EmptyState from '@/hr360-app/components/shared/ui/EmptyState';
import { SkeletonTable } from '@/hr360-app/components/shared/ui/Skeleton';
import { formatDate, formatDuration } from '@/hr360-app/utils/formatters';
import { DEPARTMENTS } from '@/hr360-app/utils/constants';
import { fetchReportData } from '@/hr360-app/services/reportsService';
import { getEmployees } from '@/hr360-app/services/employeeService';
import { generateCSV, generatePDF } from '@/hr360-app/utils/reportGenerators';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  // Builder form state
  const [scope, setScope] = useState('Organization');
  const [employeeId, setEmployeeId] = useState('');
  const [format, setFormat] = useState('PDF');
  const [dateRange, setDateRange] = useState('Last 30 days');

  useEffect(() => {
    async function loadEmployees() {
      const data = await getEmployees();
      setEmployees(data);
      if (data && data.length > 0) {
        setEmployeeId(data[0].id);
      }
    }
    loadEmployees();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await fetchReportData({ scope, dateRange, employeeId });
      
      let title = `${scope === 'Individual' ? employees.find(e => e.id === employeeId)?.name : scope} Report — ${dateRange}`;
      
      setPreviewData(data);
      setPreviewTitle(title);

      const newReport = {
        id: `rpt-${Date.now()}`,
        title,
        scope,
        dateRange,
        createdAt: new Date().toISOString(),
        format,
        data // Store data in memory for easy re-downloading
      };
      
      setReports(prev => [newReport, ...prev]);

      if (format === 'CSV') {
        generateCSV(data, title);
      } else {
        generatePDF(data, title);
      }
      
      toast.success('Report generated and downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report: ' + err.message);
    }
    setIsGenerating(false);
  };

  const handleDownload = (report) => {
    if (report.format === 'CSV') {
      generateCSV(report.data, report.title);
    } else {
      generatePDF(report.data, report.title);
    }
    toast.success(`Downloaded ${report.format}`);
  };

  const handlePreview = (report) => {
    setPreviewData(report.data);
    setPreviewTitle(report.title);
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
          {/* Report builder */}
          <Card>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileBarChart size={20} style={{ color: 'var(--color-brand)' }} />
              Generate Report
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Scope</label>
                <select value={scope} onChange={(e) => setScope(e.target.value)} style={selectStyle}>
                  <option>Organization</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  <option>Individual</option>
                </select>
              </div>

              {scope === 'Individual' && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Select Employee</label>
                  <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={selectStyle}>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Date Range</label>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={selectStyle}>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>This Quarter</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Format</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['PDF', 'CSV'].map(f => (
                    <Button
                      key={f}
                      size="sm"
                      variant={format === f ? 'primary' : 'secondary'}
                      onClick={() => setFormat(f)}
                      icon={f === 'PDF' ? <FileText size={14} /> : <Table size={14} />}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Button onClick={handleGenerate} disabled={isGenerating} icon={<FileBarChart size={16} />}>
                  {isGenerating ? 'Generating…' : 'Generate & Download'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Preview placeholder */}
          <Card>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={20} style={{ color: 'var(--color-brand)' }} />
              Preview: {previewTitle || 'None'}
            </h3>
            
            {!previewData ? (
              <EmptyState
                title="Report preview"
                description="Generate a report to see a preview before downloading."
                style={{ padding: '40px 0' }}
              />
            ) : previewData.length === 0 ? (
              <EmptyState title="No data" description="No data found for the selected criteria." style={{ padding: '40px 0' }} />
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      <th style={{ padding: '8px 0', fontWeight: 500 }}>Employee</th>
                      <th style={{ padding: '8px 0', fontWeight: 500 }}>Score</th>
                      <th style={{ padding: '8px 0', fontWeight: 500 }}>Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map(row => (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <td style={{ padding: '12px 0', fontWeight: 500 }}>{row.name}</td>
                        <td style={{ padding: '12px 0' }}>{row.score}</td>
                        <td style={{ padding: '12px 0' }}>{row.totalHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Report history */}
        <Card>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Recent Session Reports</h3>
          {isLoading ? (
            <SkeletonTable rows={4} cols={4} />
          ) : reports.length === 0 ? (
            <EmptyState title="No reports yet" description="Generate your first report using the builder above." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <FileText size={20} style={{ color: 'var(--color-brand)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{report.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {report.scope} · {report.dateRange} · {formatDate(report.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status="success" label={report.format} size="sm" />
                  <Button size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => handlePreview(report)}>
                    Preview
                  </Button>
                  <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={() => handleDownload(report)}>
                    Download
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}

const selectStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  fontSize: '14px',
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-text-primary)',
};
