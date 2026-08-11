/**
 * Employee data service.
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';

export async function getEmployees(filters = {}) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('employees').select('*').neq('role', 'Admin');
      
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        const q = `%${filters.search}%`;
        query = query.or(`name.ilike.${q},email.ilike.${q},department.ilike.${q},role.ilike.${q}`);
      }

      const { data: employees, error } = await query;
      if (error) throw error;

      if (employees) {
        // Calculate current week date boundary (Monday to today) for weekly hours
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const dayOfWeek = now.getDay();
        const offsetToMon = dayOfWeek === 0 ? -6 : (1 - dayOfWeek);
        const monThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetToMon);
        const startOfWeekStr = monThisWeek.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        // Fetch hours worked strictly within this week's date boundary
        const { data: summaries, error: sumError } = await supabase
          .from('screentime_daily_summary')
          .select('employee_id, total_minutes')
          .gte('date', startOfWeekStr)
          .lte('date', todayStr);
        
        if (sumError) throw sumError;

        const hoursByEmployee = {};
        summaries?.forEach(s => {
          hoursByEmployee[s.employee_id] = (hoursByEmployee[s.employee_id] || 0) + s.total_minutes;
        });

        // Fetch latest ping from raw logs to determine active status (last 30 seconds)
        const { data: latestLogs } = await supabase
          .from('screentime_raw_logs')
          .select('employee_id, timestamp')
          .gte('timestamp', new Date(Date.now() - 30 * 1000).toISOString());

        const activeEmployees = new Set(latestLogs?.map(l => l.employee_id) || []);

        const results = employees.map(emp => {
          const totalMins = hoursByEmployee[emp.id] || 0;
          const hoursWorked = Math.round((totalMins / 60) * 10) / 10;
          const score = hoursWorked > 0 ? Math.min(100, Math.round((60 + (hoursWorked / 40) * 35) * 10) / 10) : 0;
          return {
            ...emp,
            status: activeEmployees.has(emp.id) ? 'active' : 'inactive',
            hoursWorked: hoursWorked || 0,
            hoursAllotted: 40,
            score,
          };
        });

        return results.sort((a, b) => {
          if (a.status === 'active' && b.status !== 'active') return -1;
          if (a.status !== 'active' && b.status === 'active') return 1;
          return (a.name || '').localeCompare(b.name || '');
        });
      }
    } catch (err) {
      console.error('[Supabase] Error fetching employees:', err);
    }
  }

  return [];
}

export async function getEmployeeById(id) {
  if (isSupabaseConfigured) {
    try {
      const { data: emp, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (emp) {
        // Fetch summaries
        const { data: summaries, error: sumError } = await supabase
          .from('screentime_daily_summary')
          .select('app_name, category, total_minutes, date')
          .eq('employee_id', id);

        if (sumError) throw sumError;

        const { data: attendance, error: attError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('employee_id', id)
          .order('date', { ascending: false });

        if (attError) throw attError;

        // Top apps
        const appMins = {};
        const appCategories = {};
        summaries?.forEach(s => {
          appMins[s.app_name] = (appMins[s.app_name] || 0) + s.total_minutes;
          appCategories[s.app_name] = s.category;
        });
        const topApps = Object.entries(appMins)
          .map(([app, minutes]) => ({
            app,
            minutes,
            category: appCategories[app],
          }))
          .sort((a, b) => b.minutes - a.minutes)
          .slice(0, 5);

        // Weekly hours (current calendar week Monday to Saturday with automatic weekly refresh)
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon, 6 is Sat
        const offsetToMon = dayOfWeek === 0 ? -6 : (1 - dayOfWeek);
        const monThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetToMon);
        const startOfWeekStr = monThisWeek.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayMinsByDate = {};
        summaries?.forEach(s => {
          if (s.date >= startOfWeekStr && s.date <= todayStr) {
            dayMinsByDate[s.date] = (dayMinsByDate[s.date] || 0) + s.total_minutes;
          }
        });

        const weeklyHours = daysOfWeek.map((day, i) => {
          const d = new Date(monThisWeek.getFullYear(), monThisWeek.getMonth(), monThisWeek.getDate() + i);
          const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
          
          let mins = dayMinsByDate[dateStr] || 0;
          let hours = Math.round((mins / 60) * 10) / 10;

          // STRICT REFRESH RULE: Any date after today is in the future and MUST be 0 hours!
          if (dateStr > todayStr) {
            hours = 0;
          }

          return { day, hours, date: dateStr };
        });

        // Ensure Hours This Week exactly equals the sum of the weekly bar chart!
        const hoursWorked = Math.round(weeklyHours.reduce((sum, item) => sum + item.hours, 0) * 10) / 10;
        const totalMins = hoursWorked * 60;

        const formatIST = (timeStr) => {
          if (!timeStr) return null;
          try {
            const date = new Date(`1970-01-01T${timeStr}Z`);
            if (isNaN(date.getTime())) return timeStr.split('.')[0];
            return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', hour12: false });
          } catch {
            return timeStr.split('.')[0];
          }
        };

        // Build historical activity details & ensure rich month-to-date working attendance
        const historyMap = {};
        attendance?.forEach(rec => {
          historyMap[rec.date] = {
            id: rec.id || rec.date,
            date: rec.date,
            status: rec.status || 'present',
            checkIn: formatIST(rec.check_in) || '—',
            checkOut: formatIST(rec.check_out) || '—',
            totalMinutes: 0,
            productiveMinutes: 0,
          };
        });

        summaries?.forEach(s => {
          const d = s.date;
          if (!historyMap[d]) {
            historyMap[d] = {
              id: d,
              date: d,
              status: 'present',
              checkIn: '—',
              checkOut: '—',
              totalMinutes: 0,
              productiveMinutes: 0,
            };
          }
          historyMap[d].totalMinutes += s.total_minutes || 0;
          if (s.category === 'productive') {
            historyMap[d].productiveMinutes += s.total_minutes || 0;
          }
        });

        const history = Object.values(historyMap)
          .map(h => {
            const hours = Math.round((h.totalMinutes / 60) * 10) / 10;
            const prodRatio = h.totalMinutes > 0 ? Math.round((h.productiveMinutes / h.totalMinutes) * 100) : (h.status === 'absent' ? 0 : 100);
            return {
              ...h,
              hours,
              prodRatio,
            };
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        // Attendance summary strictly computed from ACTUAL recorded database activity in the current month!
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const monthlyRecords = history.filter(h => {
          const d = new Date(h.date);
          return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const attSummary = {
          present: monthlyRecords.filter(r => r.status === 'present').length,
          late: monthlyRecords.filter(r => r.status === 'late').length,
          absent: monthlyRecords.filter(r => r.status === 'absent').length,
          wfh: monthlyRecords.filter(r => r.status === 'wfh').length,
          onLeave: monthlyRecords.filter(r => r.status === 'on_leave' || r.status === 'half_day').length,
          total: monthlyRecords.length,
        };

        // Calculate actual Score Breakdown metrics without altering the master score
        const hoursScore = Math.min(100, Math.round((hoursWorked / 40) * 100)) || 0;
        const prodSumMins = summaries?.filter(s => s.category === 'productive').reduce((sum, s) => sum + s.total_minutes, 0) || 0;
        const appsScore = totalMins > 0 ? Math.round((prodSumMins / totalMins) * 100) : (hoursWorked > 0 ? 85 : 0);
        const attScore = attSummary.total > 0 ? Math.min(100, Math.round(((attSummary.present + attSummary.wfh + attSummary.late * 0.7) / attSummary.total) * 100)) : (hoursWorked > 0 ? 95 : 0);

        const breakdown = {
          hours: hoursWorked > 0 ? Math.max(40, hoursScore) : 0,
          apps: hoursWorked > 0 ? Math.max(60, appsScore) : 0,
          attendance: hoursWorked > 0 ? Math.max(70, attScore) : 0,
        };

        // Check if currently active (ping in last 30 seconds)
        const { data: latestLog } = await supabase
          .from('screentime_raw_logs')
          .select('timestamp')
          .eq('employee_id', id)
          .gte('timestamp', new Date(Date.now() - 30 * 1000).toISOString())
          .limit(1);
          
        const isActive = latestLog && latestLog.length > 0;
        
        // Exact same master score calculation as getEmployees table view!
        const score = hoursWorked > 0 ? Math.min(100, Math.round((60 + (hoursWorked / 40) * 35) * 10) / 10) : 0;

        // Calculate Daily Application Usage from actual logs (today's activity, or latest recorded active day if none today)
        const todaySummaries = summaries?.filter(s => s.date === todayStr) || [];
        let activeDailySummaries = todaySummaries;
        if (activeDailySummaries.length === 0 && summaries && summaries.length > 0) {
          const sortedDates = [...summaries].sort((a, b) => b.date.localeCompare(a.date));
          const latestDate = sortedDates[0].date;
          activeDailySummaries = summaries.filter(s => s.date === latestDate);
        }

        const dailyAppMins = {};
        const dailyAppCats = {};
        activeDailySummaries.forEach(s => {
          dailyAppMins[s.app_name] = (dailyAppMins[s.app_name] || 0) + (s.total_minutes || 0);
          dailyAppCats[s.app_name] = s.category || 'productive';
        });

        const dailyTotalMins = Object.values(dailyAppMins).reduce((a, b) => a + b, 0) || 1;
        const dailyApps = Object.entries(dailyAppMins)
          .map(([app, minutes]) => ({
            app,
            minutes,
            category: dailyAppCats[app],
            percentage: Math.round((minutes / dailyTotalMins) * 100) || 0,
          }))
          .sort((a, b) => b.minutes - a.minutes)
          .slice(0, 4);

        let dbDocuments = [];
        try {
          const { data: docRecords } = await supabase
            .from('employee_documents')
            .select('*')
            .eq('employee_id', id)
            .order('created_at', { ascending: false });
          if (docRecords) dbDocuments = docRecords;
        } catch (e) {
          console.warn('[Supabase] Document query failed:', e);
        }

        return {
          ...emp,
          status: isActive ? 'active' : 'inactive',
          hoursWorked,
          hoursAllotted: 40,
          score,
          breakdown,
          weeklyHours,
          topApps,
          dailyApps,
          attendanceSummary: attSummary,
          history,
          dbDocuments,
        };
      }
    } catch (err) {
      console.error('[Supabase] Error fetching employee details:', err);
    }
  }

  throw new Error('Employee not found');
}

export async function uploadEmployeeDocument({ employeeId, title, category, fileName, fileType, content }) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('employee_documents')
        .insert([{ employee_id: String(employeeId), title, category, file_name: fileName, file_type: fileType, content }])
        .select()
        .single();
      if (error) {
        console.error('[Supabase] Error inserting into employee_documents table:', error);
        throw error;
      }
      if (data) return data;
    } catch (err) {
      console.error('[Supabase] Could not insert document into Supabase table:', err);
      throw err;
    }
  }
  throw new Error('Supabase not configured or failed to upload.');
}

export async function createEmployee(employeeData) {
  try {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create employee');
    }

    return result;
  } catch (error) {
    console.error('Error creating employee:', error.message);
    throw error;
  }
}

export async function deleteEmployee(employeeId) {
  try {
    const response = await fetch(`/api/employees?id=${employeeId}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to delete employee');
    return result;
  } catch (error) {
    console.error('Error deleting employee:', error.message);
    throw error;
  }
}

export async function updateEmployee(employeeId, updates) {
  try {
    const response = await fetch(`/api/employees`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: employeeId, ...updates }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to update employee');
    return result;
  } catch (error) {
    console.error('Error updating employee:', error.message);
    throw error;
  }
}

export async function getAdmins() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'Admin')
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[Supabase] Error fetching admins:', err);
    }
  }
  return [];
}
