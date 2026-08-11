import { useState, useRef, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import ChartTooltip from '@/hr360-app/components/shared/charts/ChartTooltip';
import { MoreHorizontal, ExternalLink, Clock } from 'lucide-react';

const CUSTOM_COLORS = ['#10B981', '#3B82F6', '#EF4444']; 

export default function AppCategoryDonut({ data }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState('minutes'); // 'minutes' | 'hours' | 'percentage'
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

  const totalMinutes = data.reduce((sum, item) => sum + item.value, 0);

  // Determine center text representation
  let mainText = totalMinutes.toLocaleString();
  let subText = "Total Minutes\nThis week";

  if (displayMode === 'hours') {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    mainText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    subText = "Logged Time\nThis week";
  } else if (displayMode === 'percentage') {
    mainText = "100%";
    subText = "Category Share\nBreakdown";
  }

  const handleToggleMode = () => {
    if (displayMode === 'minutes') setDisplayMode('hours');
    else if (displayMode === 'hours') setDisplayMode('percentage');
    else setDisplayMode('minutes');
    setMenuOpen(false);
  };

  return (
    <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', position: 'relative' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          App Information
        </h3>
        
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

          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              width: '190px',
              padding: '6px 0',
              marginTop: '4px'
            }}>
              <button
                onClick={handleToggleMode}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Clock size={16} color="#6B7280" />
                <span>Switch Unit ({displayMode === 'minutes' ? 'Hours' : displayMode === 'hours' ? '%' : 'Minutes'})</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/applications');
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ExternalLink size={16} color="#6B7280" />
                <span>View All Applications</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="75%" 
            outerRadius="90%"
            dataKey="value"
            nameKey="category"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || CUSTOM_COLORS[i % CUSTOM_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend 
            iconType="square" 
            iconSize={10} 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            formatter={(value, entry) => {
              const perc = entry.payload.percentage || Math.round((entry.payload.value / totalMinutes) * 100);
              return (
                <span style={{ color: '#374151', fontWeight: 500, marginRight: '8px' }}>
                  {value} ({perc}%)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Text */}
      <div style={{ position: 'absolute', top: '53%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: '30px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{mainText}</div>
        <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.4, whiteSpace: 'pre-line', fontWeight: 500 }}>{subText}</div>
      </div>
    </div>
  );
}
