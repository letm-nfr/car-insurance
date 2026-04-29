import Notification from '../models/Notification.js'
import {
  getFromCache,
  setCache,
  deleteFromCache,
  notificationCacheKeys,
} from '../utils/redis.js'
import { logger, logError } from '../utils/logger.js'

// Get all notifications for user (with Redis caching)
export const getNotifications = async (req, res) => {
  try {
    // Get userId from query parameter
    const userId = req.query.userId

    logger.debug({ userId }, 'getNotifications: Received request')

    // Require userId
    if (!userId) {
      logger.warn({ userId }, 'getNotifications: userId required')
      return res.status(401).json({ message: 'Unauthorized: userId required' })
    }

    // Try to get from cache
    const cacheKey = notificationCacheKeys.byUserId(userId)
    const cached = await getFromCache(cacheKey)
    if (cached) {
      logger.debug({ cacheKey }, 'getNotifications: Cache hit')
      return res.status(200).json(cached)
    }

    logger.info({ userId }, 'getNotifications: Fetching from database')

    // Query notifications by userId
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    })

    const unreadCount = notifications.filter((n) => n.status === 'unread').length

    const response = {
      notifications,
      unreadCount,
      count: notifications.length,
    }

    logger.info({ userId, count: notifications.length, unreadCount }, 'getNotifications: Fetched successfully')

    // Cache the response (1 hour TTL)
    await setCache(cacheKey, response, 3600)

    return res.status(200).json(response)
  } catch (error) {
    logError(error, { context: 'getNotifications', userId: req.query?.userId })
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params
    const userId = req.query.userId

    logger.debug({ notificationId, userId }, 'markAsRead: Received request')

    if (!notificationId) {
      logger.warn({ notificationId }, 'markAsRead: Notification ID is required')
      return res.status(400).json({ message: 'Notification ID is required' })
    }

    if (!userId) {
      logger.warn({ userId }, 'markAsRead: userId required')
      return res.status(401).json({ message: 'Unauthorized: userId required' })
    }

    // Fetch notification to check authorization
    const notification = await Notification.findById(notificationId)

    if (!notification) {
      logger.warn({ notificationId }, 'markAsRead: Notification not found')
      return res.status(404).json({ message: 'Notification not found' })
    }

    // Check if notification belongs to user
    if (notification.userId && notification.userId.toString() !== userId) {
      logger.warn({ notificationId, userId }, 'markAsRead: Unauthorized access attempt')
      return res.status(403).json({ message: 'Unauthorized' })
    }

    logger.info({ notificationId, userId }, 'markAsRead: Marking as read')

    // Update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true }
    )

    // Invalidate user's notification cache
    await deleteFromCache(notificationCacheKeys.byUserId(userId))

    logger.info({ notificationId }, 'markAsRead: Successfully marked as read and cache invalidated')

    return res.status(200).json({
      message: 'Notification marked as read',
      notification: updatedNotification,
    })
  } catch (error) {
    logError(error, { context: 'markAsRead', notificationId: req.params?.notificationId })
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    // Get userId from query parameter
    const userId = req.query.userId

    logger.debug({ userId }, 'markAllAsRead: Received request')

    // Require userId
    if (!userId) {
      logger.warn({ userId }, 'markAllAsRead: userId required')
      return res.status(401).json({ message: 'Unauthorized: userId required' })
    }

    logger.info({ userId }, 'markAllAsRead: Marking all as read')

    // Update all notifications for this userId
    await Notification.updateMany({ userId }, { status: 'read' })

    // Invalidate user's notification cache
    await deleteFromCache(notificationCacheKeys.byUserId(userId))

    logger.info({ userId }, 'markAllAsRead: Successfully marked all as read and cache invalidated')

    return res.status(200).json({
      message: 'All notifications marked as read',
    })
  } catch (error) {
    logError(error, { context: 'markAllAsRead', userId: req.query?.userId })
    return res.status(500).json({ message: 'Internal server error' })
  }
}
