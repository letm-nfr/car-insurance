import Notification from '../models/Notification.js'

// Get all notifications for user
export const getNotifications = async (req, res) => {
  try {
    const { email, token } = req.query
    const jwt = await import('jsonwebtoken').then((m) => m.default)
    const dotenv = await import('dotenv').then((m) => m.default)

    dotenv.config()

    if (!email && !token) {
      return res.status(400).json({ message: 'Email or token is required' })
    }

    let searchCriteria = {}

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        searchCriteria.userId = decoded.userId
      } catch (err) {
        console.log('Token verification failed, using email:', err.message)
        if (email) {
          searchCriteria.email = email
        } else {
          return res.status(401).json({ message: 'Invalid token' })
        }
      }
    } else {
      searchCriteria.email = email
    }

    const notifications = await Notification.find(searchCriteria).sort({
      createdAt: -1,
    })

    const unreadCount = notifications.filter((n) => n.status === 'unread').length

    return res.status(200).json({
      notifications,
      unreadCount,
      count: notifications.length,
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' })
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      notification,
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { email, token } = req.body
    const jwt = await import('jsonwebtoken').then((m) => m.default)
    const dotenv = await import('dotenv').then((m) => m.default)

    dotenv.config()

    if (!email && !token) {
      return res.status(400).json({ message: 'Email or token is required' })
    }

    let searchCriteria = {}

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        searchCriteria.userId = decoded.userId
      } catch (err) {
        console.log('Token verification failed, using email:', err.message)
        if (email) {
          searchCriteria.email = email
        } else {
          return res.status(401).json({ message: 'Invalid token' })
        }
      }
    } else {
      searchCriteria.email = email
    }

    await Notification.updateMany(searchCriteria, { status: 'read' })

    return res.status(200).json({
      message: 'All notifications marked as read',
    })
  } catch (error) {
    console.error('Mark all as read error:', error)
    return res.status(500).json({ message: error.message })
  }
}
