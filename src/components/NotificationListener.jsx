// src/components/NotificationListener.jsx
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function NotificationListener() {
  const { user } = useAuth();

  useEffect(() => {
    // If no user is logged in, do not attempt to subscribe
    if (!user) return;

    // Initialize the Realtime channel
    const notificationChannel = supabase
      .channel('user-notifications') // Unique channel name of your choice
      .on(
        'postgres_changes',
        {
          event: 'INSERT',            // Only listen for new rows added
          schema: 'public',
          //filter: `user_id=eq.${user.id}`, // CRITICAL: Only receive events matching this user ID
        },
        (payload) => {
          // This function runs automatically whenever a new notification lands in PostgreSQL
          const newNotif = payload.new;
          
          // Trigger the frontend toast alert
          toast.success(newNotif.message || 'New notification received', {
            duration: 5000,
            icon: '🔔',
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully connected to Realtime notifications stream');
        }
      });

    // Cleanup subscription when the component unmounts or the user logs out
    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [user]);

  return null; // This component runs purely as a background worker
}