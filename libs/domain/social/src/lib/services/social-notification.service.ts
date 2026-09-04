/**
 * @fileoverview Notification service - handles notification operations
 * PHASE 5: Uses mock data. Replace with actual API service in Phase 5B.
 */

import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Notification } from '../models';
import { MOCK_NOTIFICATIONS } from '../mocks/mock-data';

@Injectable({
  providedIn: 'root',
})
export class SocialNotificationService {
  private notifications = [...MOCK_NOTIFICATIONS];
  private notificationSubject = new Subject<Notification>();

  notificationReceived$ = this.notificationSubject.asObservable();

  /**
   * Get all notifications
   */
  getNotifications(): Observable<Notification[]> {
    return of(this.notifications).pipe(delay(400));
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): Observable<number> {
    const unread = this.notifications.filter((n) => !n.isRead).length;
    return of(unread).pipe(delay(200));
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): Observable<void> {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    this.notifications.forEach((n) => (n.isRead = true));
    return of(undefined).pipe(delay(400));
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): Observable<void> {
    const index = this.notifications.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * Delete all notifications
   */
  deleteAllNotifications(): Observable<void> {
    this.notifications = [];
    return of(undefined).pipe(delay(400));
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: string): Observable<Notification[]> {
    const filtered = this.notifications.filter((n) => n.type === type);
    return of(filtered).pipe(delay(300));
  }

  /**
   * Simulate receiving a new notification
   * (In Phase 5B, this would come from WebSocket/SignalR)
   */
  simulateNewNotification(notification: Notification): void {
    this.notifications.unshift(notification);
    this.notificationSubject.next(notification);
  }

  /**
   * Get notification by ID
   */
  getNotification(notificationId: string): Observable<Notification | null> {
    const notification = this.notifications.find((n) => n.id === notificationId);
    return of(notification || null).pipe(delay(300));
  }
}
