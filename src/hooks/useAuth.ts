import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentUser, getUserProfile } from '../lib/supabase';
import { User as AppUser } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const userProfile = await getUserProfile(currentUser.id);
          setProfile({
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            businessName: userProfile.business_name,
            businessType: userProfile.business_type,
            location: userProfile.location,
            avatar: userProfile.avatar_url || undefined
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const userProfile = await getUserProfile(session.user.id);
            setProfile({
              id: userProfile.id,
              name: userProfile.name,
              email: userProfile.email,
              businessName: userProfile.business_name,
              businessType: userProfile.business_type,
              location: userProfile.location,
              avatar: userProfile.avatar_url || undefined
            });
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user
  };
};