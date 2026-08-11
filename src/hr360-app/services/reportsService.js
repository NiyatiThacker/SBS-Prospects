import { supabase, isSupabaseConfigured } from './supabaseClient';

export async function fetchReportData({ scope, dateRange, employeeId }) {
  if (!isSupabaseConfigured) return [];

  try {
    // 1. Calculate Date Range
    const endDate = new Date();
    const startDate = new Date();
    
    if (dateRange === 'Last 7 days') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (dateRange === 'Last 30 days') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (dateRange === 'This Quarter') {
      const quarter = Math.floor(endDate.getMonth() / 3);
      startDate.setMonth(quarter * 3, 1);
    }
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // 2. Query Employees based on scope (exclude Admins)
    let empQuery = supabase.from('employees').select('id, name, department').neq('role', 'Admin');
    if (scope === 'Individual' && employeeId) {
      empQuery = empQuery.eq('id', employeeId);
    } else if (scope !== 'Organization' && scope !== 'Individual') {
      // It's a specific department
      empQuery = empQuery.eq('department', scope);
    }
    
    const { data: employees, error: empError } = await empQuery;
    if (empError) throw empError;
    if (!employees || employees.length === 0) return [];

    const employeeIds = employees.map(e => e.id);

    // 3. Query Screentime Daily Summary
    const { data: screentime, error: scError } = await supabase
      .from('screentime_daily_summary')
      .select('employee_id, category, total_minutes')
      .in('employee_id', employeeIds)
      .gte('date', startStr)
      .lte('date', endStr);
    
    if (scError) throw scError;

    // 4. Query Attendance Records
    const { data: attendance, error: attError } = await supabase
      .from('attendance_records')
      .select('employee_id, status')
      .in('employee_id', employeeIds)
      .gte('date', startStr)
      .lte('date', endStr);
      
    if (attError) throw attError;

    // 5. Aggregate Data per Employee
    return employees.map(emp => {
      const empScreentime = screentime?.filter(s => s.employee_id === emp.id) || [];
      const empAttendance = attendance?.filter(a => a.employee_id === emp.id) || [];

      let totalMins = 0;
      let productiveMins = 0;
      
      empScreentime.forEach(s => {
        totalMins += s.total_minutes;
        if (s.category === 'productive') {
          productiveMins += s.total_minutes;
        }
      });

      const totalHours = Math.round((totalMins / 60) * 10) / 10;
      const productiveHours = Math.round((productiveMins / 60) * 10) / 10;
      
      // We assume standard 40h/week, if dateRange is 7 days it's 40, if 30 days it's ~160.
      // We'll calculate score based on utilization ratio.
      const score = totalHours > 0 ? Math.round((productiveHours / totalHours) * 100) : 0;

      const present = empAttendance.filter(a => ['present', 'late', 'wfh', 'half_day'].includes(a.status)).length;
      const absent = empAttendance.filter(a => ['absent', 'on_leave'].includes(a.status)).length;

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        totalHours,
        productiveHours,
        score,
        present,
        absent
      };
    }).sort((a, b) => b.score - a.score);

  } catch (err) {
    console.error('[Supabase] Error fetching report data:', err);
    return [];
  }
}

