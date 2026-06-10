// src/hooks/useNotifications.ts
// MereSimi Studios Ltd — Honiara Taxi Network

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, db } from '@/lib/supabase'
import { onForegroundMessage } from '@/lib/firebase'
import type { Database } from '@/types/database'

type Notification = Database['public']['Tables']['notifications']['Row']

// ─── Fetch notifications ──────────────────────────────────

export function useNotifications(userId: string | null) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn:  async () => {
      const { data, error } = await db.notifications()
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as Notification[]
    },
    enabled:   !!userId,
    staleTime: 30_000,
  })

  // Realtime: new notifications arrive
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['notifications', userId] })
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, qc])

  // FCM foreground messages (app is open)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    onForegroundMessage((payload) => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
    }).then((fn) => { unsubscribe = fn })
    return () => { unsubscribe?.() }
  }, [userId, qc])

  const unreadCount = query.data?.filter((n) => !n.read_at).length ?? 0

  return { ...query, unreadCount }
}

// ─── Mark notification as read ────────────────────────────

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await db.notifications()
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// ─── Mark all as read ─────────────────────────────────────

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await db.notifications()
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
