import { useState, useEffect } from 'react';
import PageContainer from '@/hr360-app/components/shared/layout/PageContainer';
import KpiSummaryRow from './components/KpiSummaryRow';
import AppCategoryDonut from './components/AppCategoryDonut';
import HoursTrendChart from './components/HoursTrendChart';
import DepartmentBarChart from './components/DepartmentBarChart';
import useDashboardData from './hooks/useDashboardData';
import { generateSystemAlerts } from '@/hr360-app/services/notificationsService';

export default function DashboardPage() {
  const { data, isLoading: loading, error } = useDashboardData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    generateSystemAlerts();
  }, []);

  if (error) {
    return (
      <PageContainer>
        <div style={{ color: 'var(--color-danger)', padding: '20px' }}>
          Error loading dashboard data: {error.message}
        </div>
      </PageContainer>
    );
  }

  if (!mounted || loading) {
    return (
      <PageContainer>
        <div style={{ padding: '20px', color: 'var(--color-text-secondary)' }}>
          Loading dashboard metrics...
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Floating Header Card */}
          <div style={{ 
            background: '#FFFFFF', 
            padding: '24px 32px', 
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>⊞</span> / HR 360 Dashboard
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px', marginTop: 0 }}>Welcome back,</h2>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.5px' }}>Admin</h1>
          </div>

        {/* Grid Layout matching reference UI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Row: KPIs and Donut Chart */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            <div style={{ flex: '2', minWidth: '60%' }}>
              <KpiSummaryRow kpis={data.kpis} />
            </div>
            <div style={{ flex: '1', minWidth: '30%' }}>
              <AppCategoryDonut data={data.appCategorySplit} />
            </div>
          </div>

          {/* Bottom Row: Charts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            <div style={{ flex: '2', minWidth: '60%' }}>
              <HoursTrendChart data={data.hoursTrend} />
            </div>
            <div style={{ flex: '1', minWidth: '30%' }}>
              <DepartmentBarChart data={data.departmentComparison} />
            </div>
          </div>
          
        </div>
        </div>
      </PageContainer>
    </>
  );
}
