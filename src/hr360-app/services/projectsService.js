import { supabase, isSupabaseConfigured } from './supabaseClient';
import { createNotification } from './notificationsService';

export async function getProjects(employeeId = null) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[Supabase] Error fetching projects:', err);
    }
  }
  return [];
}

export async function assignProject(employeeId, employeeName, name, description, deadline) {
  const newProject = {
    id: 'proj_' + Date.now(),
    employee_id: String(employeeId),
    employee_name: employeeName,
    name,
    description,
    deadline, // ISO string
    status: 'active',
    extensions: [],
    extension_requests: [],
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('projects').insert([newProject]);
      if (error) throw error;
      return newProject;
    } catch (err) {
      console.error('[Supabase] Error assigning project:', err);
    }
  }
  return null;
}

export async function updateProjectStatus(projectId, status) {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('projects').update({ status }).eq('id', projectId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Supabase] Error updating project status:', err);
    }
  }
  return false;
}

export async function extendDeadline(projectId, newDeadline, reason) {
  let project = null;
  
  if (isSupabaseConfigured) {
    try {
      const { data, error: fetchErr } = await supabase.from('projects').select('*').eq('id', projectId).single();
      if (fetchErr) throw fetchErr;
      project = data;
    } catch (err) {
      console.error('[Supabase] Error fetching project for extension:', err);
    }
  }
  
  if (!project) return false;
  
  const extensionRecord = {
    previousDeadline: project.deadline,
    newDeadline,
    reason: reason || 'HR Extension',
    date: new Date().toISOString()
  };
  
  const updatedExtensions = [...(project.extensions || []), extensionRecord];
  
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('projects').update({
        deadline: newDeadline,
        status: 'active',
        extensions: updatedExtensions,
        extension_requests: []
      }).eq('id', projectId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Supabase] Error extending deadline:', err);
    }
  }
  return false;
}

export async function requestExtension(projectId, requestedDeadline, reason) {
  let project = null;
  
  if (isSupabaseConfigured) {
    try {
      const { data, error: fetchErr } = await supabase.from('projects').select('*').eq('id', projectId).single();
      if (fetchErr) throw fetchErr;
      project = data;
    } catch (err) {
      console.error('[Supabase] Error fetching project for request:', err);
    }
  }
  
  if (!project) return false;
  
  const requestRecord = {
    requestedDeadline,
    reason,
    status: 'pending',
    date: new Date().toISOString()
  };
  
  const updatedRequests = [...(project.extension_requests || []), requestRecord];
  
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('projects').update({
        extension_requests: updatedRequests
      }).eq('id', projectId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Supabase] Error requesting extension:', err);
    }
  }
  return false;
}
