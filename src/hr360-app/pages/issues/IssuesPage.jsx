import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, CheckCircle } from 'lucide-react';
import PageContainer from '@/hr360-app/components/shared/layout/PageContainer';
import Card from '@/hr360-app/components/shared/ui/Card';
import Button from '@/hr360-app/components/shared/ui/Button';
import { SkeletonTable } from '@/hr360-app/components/shared/ui/Skeleton';
import EmptyState from '@/hr360-app/components/shared/ui/EmptyState';
import { formatTimeAgo } from '@/hr360-app/utils/formatters';
import { getNotifications, markAsRead } from '@/hr360-app/services/notificationsService';

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIssueId, setExpandedIssueId] = useState(null);

  useEffect(() => {
    async function fetchIssues() {
      const data = await getNotifications();
      // Filter only those that are 'Issue Reported' (which use the 'warning' type)
      const issueNotifications = data.filter(n => n.title.includes('Issue Reported') || n.type === 'warning');
      setIssues(issueNotifications);
      setIsLoading(false);
    }
    fetchIssues();
    
    // Poll for new issues every 5 seconds so it updates instantly
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkResolved = async (id) => {
    // Optimistic update
    setIssues(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await markAsRead(id);
  };

  const unresolvedCount = issues.filter(n => !n.read).length;

  return (
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '24px' }}>
          {/* Header area, reserved for future actions or title if needed */}
        </div>

        {isLoading ? (
          <SkeletonTable rows={5} cols={1} />
        ) : issues.length === 0 ? (
          <EmptyState title="No reported issues" description="There are no reported issues from employees at this time." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {issues.map((n, i) => {
              const isResolved = n.read;
              const isExpanded = expandedIssueId === n.id;
              const empMatch = n.message.match(/Employee (.*?) reported/);
              const empName = empMatch ? empMatch[1] : 'Unknown';
              
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    padding="16px 20px"
                    onClick={() => setExpandedIssueId(isExpanded ? null : n.id)}
                    style={{
                      opacity: isResolved ? 0.65 : 1,
                      borderLeft: isResolved ? '4px solid var(--color-success)' : '4px solid var(--color-warning)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                        background: isResolved ? 'var(--color-success-soft)' : 'var(--color-warning-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isResolved ? 'var(--color-success)' : 'var(--color-warning)', flexShrink: 0,
                      }}>
                        {isResolved ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {n.title}
                          </h4>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                            {formatTimeAgo(n.timestamp)}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          Employee {empName} reported an issue.
                        </p>
                        
                        {isExpanded && (
                          <div style={{ 
                            marginTop: '12px', 
                            paddingTop: '12px', 
                            borderTop: '1px solid var(--color-border)',
                            fontSize: '13px',
                            color: 'var(--color-text)',
                            lineHeight: '20px'
                          }}>
                            <strong>Description:</strong><br/>
                            {n.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
