
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/api';

import './Notifications.css';

function formatNotificationDate(dateValue) {
  if (!dateValue) return '';

  const date = new Date(
    `${String(dateValue).replace(' ', 'T')}`
  );

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getNotifications();

      setNotifications(result.data?.notifications || []);
      setUnreadCount(
        Number(result.data?.unread_count || 0)
      );
    } catch (err) {
      setError(
        err.message || 'Notifikasi gagal dimuat.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function handleMarkRead(notificationId) {
    setActionError('');
    setMarkingId(notificationId);

    try {
      await markNotificationRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      setUnreadCount((current) =>
        Math.max(
          0,
          current -
            (notifications.find(
              (item) => item.id === notificationId
            )?.is_read
              ? 0
              : 1)
        )
      );
    } catch (err) {
      setActionError(
        err.message || 'Gagal memperbarui notifikasi.'
      );
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    setActionError('');
    setMarkingAll(true);

    try {
      await markAllNotificationsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      setActionError(
        err.message || 'Gagal memperbarui notifikasi.'
      );
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleNotificationClick(notification) {
    if (!notification.is_read) {
      await handleMarkRead(notification.id);
    }

    navigate('/');
  }

  return (
    <main className="notifications-page">
      <header className="notifications-header">
        <Link
          to="/"
          className="notifications-back"
          aria-label="Kembali ke Home"
        >
          <span aria-hidden="true">←</span>
        </Link>

        <div>
          <p className="notifications-eyebrow">YOUR ACTIVITY</p>
          <h1>Notifications</h1>
          <p className="notifications-subtitle">
            Lihat aktivitas terbaru di postinganmu.
          </p>
        </div>
      </header>

      <section className="notifications-panel">
        <div className="notifications-panel-header">
          <div>
            <h2>Recent activity</h2>
            <p>
              {unreadCount > 0
                ? `${unreadCount} notifikasi belum dibaca`
                : 'Semua notifikasi sudah dibaca'}
            </p>
          </div>

          <button
            type="button"
            className="notifications-read-all"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markingAll}
          >
            {markingAll
              ? 'Memproses...'
              : 'Tandai semua dibaca'}
          </button>
        </div>

        {actionError && (
          <p className="notifications-error" role="alert">
            {actionError}
          </p>
        )}

        {loading ? (
          <div className="notifications-state">
            <span className="notifications-loader" />
            <p>Memuat notifikasi...</p>
          </div>
        ) : error ? (
          <div className="notifications-state">
            <p className="notifications-error">{error}</p>
            <button
              type="button"
              className="notifications-retry"
              onClick={loadNotifications}
            >
              Coba lagi
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-state">
            <div className="notifications-empty-icon">
              ♡
            </div>
            <h3>Belum ada notifikasi</h3>
            <p>
              Aktivitas pada postinganmu akan muncul di sini.
            </p>
            <Link to="/" className="notifications-home-link">
              Kembali ke Home
            </Link>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => {
              const actorName =
                notification.actor_name || 'Pengguna Node';

              const isReaction =
                notification.type === 'reaction';

              return (
                <article
                  key={notification.id}
                  className={`notification-item ${
                    notification.is_read
                      ? 'is-read'
                      : 'is-unread'
                  }`}
                >
                  <button
                    type="button"
                    className="notification-content"
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    disabled={markingId === notification.id}
                  >
                    <div className="notification-avatar">
                      {notification.actor_photo ? (
                        <img
                          src={`http://localhost/node/${notification.actor_photo}`}
                          alt=""
                        />
                      ) : (
                        actorName
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>

                    <div className="notification-copy">
                      <p className="notification-message">
                        <strong>{actorName}</strong>{' '}
                        {isReaction
                          ? 'memberi reaction pada postinganmu.'
                          : 'mengomentari postinganmu.'}
                      </p>

                      {notification.type === 'comment' &&
                        notification.comment_content && (
                          <p className="notification-comment">
                            “{notification.comment_content}”
                          </p>
                        )}

                      {notification.post_caption && (
                        <p className="notification-post-context">
                          Postingan: {notification.post_caption}
                        </p>
                      )}

                      <time className="notification-time">
                        {formatNotificationDate(
                          notification.created_at
                        )}
                      </time>
                    </div>

                    {!notification.is_read && (
                      <span
                        className="notification-unread-dot"
                        aria-label="Belum dibaca"
                      />
                    )}
                  </button>

                  {!notification.is_read && (
                    <button
                      type="button"
                      className="notification-mark-read"
                      disabled={markingId === notification.id}
                      onClick={() =>
                        handleMarkRead(notification.id)
                      }
                    >
                      Tandai dibaca
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Notifications;
