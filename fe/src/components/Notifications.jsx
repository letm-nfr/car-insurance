import { useState, useEffect } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import {
  MdNotifications,
  MdCheckCircle,
  MdWarning,
  MdError,
} from 'react-icons/md'
import axios from 'axios'

export default function Notifications({ user, onBack }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const userEmail = user?.email

      if (!token && !userEmail) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      const params = {}
      if (token) {
        params.token = token
      }
      if (userEmail) {
        params.email = userEmail
      }

      const response = await axios.get(
        'http://localhost:2005/api/notifications/list',
        { params }
      )

      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.response?.data?.message || 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:2005/api/notifications/${notificationId}/read`
      )
      // Update local state
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, status: 'read' } : notif
        )
      )
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      const userEmail = user?.email

      await axios.put(
        'http://localhost:2005/api/notifications/mark-all/read',
        {
          token,
          email: userEmail,
        }
      )
      // Update local state
      setNotifications(
        notifications.map((notif) => ({ ...notif, status: 'read' }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_completed':
        return <MdCheckCircle size={24} className="text-green-600" />
      case 'policy_purchased':
        return <MdCheckCircle size={24} className="text-green-600" />
      case 'policy_approved':
        return <MdCheckCircle size={24} className="text-green-600" />
      case 'payment_failed':
        return <MdError size={24} className="text-red-600" />
      default:
        return <MdNotifications size={24} className="text-blue-600" />
    }
  }

  const getNotificationBgColor = (type, status) => {
    const baseColor =
      type === 'payment_failed'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        : type === 'policy_approved'
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'

    const unreadBorder = status === 'unread' ? ' border-l-4' : ''

    return baseColor + unreadBorder
  }

  return (
    <div className="fixed inset-0 bg-background-light dark:bg-background-dark z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <IoArrowBack size={24} className="text-[#0d141b] dark:text-white" />
          </button>
          <div>
            <h2 className="text-[#0d141b] dark:text-white text-lg font-bold">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <p className="text-xs text-primary font-semibold">
                {unreadCount} unread
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs px-3 py-1 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-4">
            <MdNotifications size={48} className="text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No notifications yet. Your updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${getNotificationBgColor(
                  notification.type,
                  notification.status
                )}`}
                onClick={() => {
                  if (notification.status === 'unread') {
                    markAsRead(notification._id)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-[#0d141b] dark:text-white font-bold text-sm">
                          {notification.title}
                        </h3>
                        <p className="text-[#4c739a] dark:text-gray-400 text-sm mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      {notification.status === 'unread' && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        </div>
                      )}
                    </div>

                    {notification.metadata?.policyNumber && (
                      <div className="mt-2 pt-2 border-t border-gray-300/50 dark:border-gray-700/50">
                        <p className="text-xs text-[#4c739a] dark:text-gray-400">
                          <span className="font-semibold">Policy:</span>{' '}
                          {notification.metadata.policyNumber}
                        </p>
                        {notification.metadata?.amount && (
                          <p className="text-xs text-[#4c739a] dark:text-gray-400 mt-1">
                            <span className="font-semibold">Amount:</span> Rs.
                            {notification.metadata.amount.toLocaleString('en-US')}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-[#4c739a] dark:text-gray-400 mt-2">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
