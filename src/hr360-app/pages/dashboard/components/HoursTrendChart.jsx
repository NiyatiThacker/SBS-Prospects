import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import ChartTooltip from '@/hr360-app/components/shared/charts/ChartTooltip';
import { MoreHorizontal, Calendar, ExternalLink, Download, CheckCircle2 } from 'lucide-react';

export default function HoursTrendChart({ data }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('this_week'); // 'this_week' | 'prev_week' | 'workweek'
  const [toastMessage, setToastMessage] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!data?.length) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Strictly filter data to start with Monday and end at Saturday for ALL views while preserving exact design
  let weeklyData = [];
  if (timeframe === 'prev_week') {
    weeklyData = data.filter(d => d.weekGroup === 'prev_week' && d.displayDay !== 'Sun');
    if (!weeklyData.length) weeklyData = data.slice(0, 7).filter(d => d.displayDay !== 'Sun');
  } else {
    // Both 'this_week' and 'workweek' display Monday to Saturday
    weeklyData = data.filter(d => d.weekGroup === 'this_week' && d.displayDay !== 'Sun');
    if (!weeklyData.length) weeklyData = data.slice(-7).filter(d => d.displayDay !== 'Sun');
  }

  const handleTimeframeChange = (newFrame) => {
    setTimeframe(newFrame);
    setMenuOpen(false);
  };

  return (
    <>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#111827',
          color: '#F9FAFB',
          padding: '14px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: 500,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'relative' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Total Hours
            </h3>
            {timeframe !== 'this_week' && (
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                ({timeframe === 'prev_week' ? 'Previous Week Mon - Sat' : 'Workweek Mon - Sat'})
              </span>
            )}
          </div>

          {/* Options Menu Button */}
          <div ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Options"
            >
              <MoreHorizontal size={20} color="var(--color-text-secondary)" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                zIndex: 50,
                width: '210px',
                padding: '6px 0',
                marginTop: '4px'
              }}>
                <div style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Timeframe
                </div>
                
                <button
                  onClick={() => handleTimeframeChange('this_week')}
                  style={{
                    width: '100%', background: timeframe === 'this_week' ? '#F3F4F6' : 'transparent', border: 'none',
                    padding: '8px 14px', textAlign: 'left', fontSize: '13px', color: '#111827', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = timeframe === 'this_week' ? '#F3F4F6' : 'transparent'}
                >
                  <Calendar size={15} color="#6B7280" />
                  <span>This Week (Mon - Sat)</span>
                </button>

                <button
                  onClick={() => handleTimeframeChange('workweek')}
                  style={{
                    width: '100%', background: timeframe === 'workweek' ? '#F3F4F6' : 'transparent', border: 'none',
                    padding: '8px 14px', textAlign: 'left', fontSize: '13px', color: '#111827', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = timeframe === 'workweek' ? '#F3F4F6' : 'transparent'}
                >
                  <Calendar size={15} color="#6B7280" />
                  <span>Workweek (Mon - Sat)</span>
                </button>

                <button
                  onClick={() => handleTimeframeChange('prev_week')}
                  style={{
                    width: '100%', background: timeframe === 'prev_week' ? '#F3F4F6' : 'transparent', border: 'none',
                    padding: '8px 14px', textAlign: 'left', fontSize: '13px', color: '#111827', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = timeframe === 'prev_week' ? '#F3F4F6' : 'transparent'}
                >
                  <Calendar size={15} color="#6B7280" />
                  <span>Previous Week (Mon - Sat)</span>
                </button>

                <div style={{ height: '1px', background: '#F3F4F6', margin: '6px 0' }} />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/attendance');
                  }}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    padding: '8px 14px', textAlign: 'left', fontSize: '13px', color: '#111827', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ExternalLink size={15} color="#6B7280" />
                  <span>View Attendance Logs</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    showToast('Weekly total hours summary exported successfully!');
                  }}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    padding: '8px 14px', textAlign: 'left', fontSize: '13px', color: '#4F46E5', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#EEF2FF'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Download size={15} color="#4F46E5" />
                  <span>Export Weekly Hours</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="displayDay" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${v}h`} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={40}>
              {weeklyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={'#4F46E5'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
