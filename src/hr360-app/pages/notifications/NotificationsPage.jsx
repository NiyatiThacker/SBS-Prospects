import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, Check } from 'lucide-react';
import PageContainer from '@/hr360-app/components/shared/layout/PageContainer';
import Card from '@/hr360-app/components/shared/ui/Card';
import Button from '@/hr360-app/components/shared/ui/Button';
import { SkeletonTable } from '@/hr360-app/components/shared/ui/Skeleton';
import EmptyState from '@/hr360-app/components/shared/ui/EmptyState';
import { formatTimeAgo } from '@/hr360-app/utils/formatters';
import { getNotifications, markAsRead, markAllAsRead } from '@/hr360-app/services/notificationsService';

const TYPE_STYLES = {
  warning: { icon: <AlertTriangle size={18} />, bg: 'var(--color-warning-soft)', color: 'var(--color-warning)' },
  info: { icon: <Info size={18} />, bg: 'var(--color-info-soft)', color: 'var(--color-info)' },
  success: { icon: <CheckCircle size={18} />, bg: 'var(--color-success-soft)', color: 'var(--color-success)' },
  danger: { icon: <XCircle size={18} />, bg: 'var(--color-danger-soft)', color: 'var(--color-danger)' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      const data = await getNotifications();
      setNotifications(data);
      setIsLoading(false);
    }
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await markAllAsRead();
  };

  const handleMarkRead = async (id) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await markAsRead(id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" icon={<Check size={14} />} onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <SkeletonTable rows={5} cols={1} />
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications" description="You're all caught up! System alerts will appear here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map((n, i) => {
              const s = TYPE_STYLES[n.type] || TYPE_STYLES.info;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    padding="16px 20px"
                    style={{
                      opacity: n.read ? 0.65 : 1,
                      borderLeft: `4px solid ${s.color}`,
                      cursor: n.read ? 'default' : 'pointer',
                    }}
                    onClick={!n.read ? () => handleMarkRead(n.id) : undefined}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                        background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: s.color, flexShrink: 0,
                      }}>
                        {s.icon}
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
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '20px', marginTop: '4px' }}>
                          {n.message}
                        </p>
                      </div>
                      {!n.read && (
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: s.color, flexShrink: 0, marginTop: '6px',
                        }} />
                      )}
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
