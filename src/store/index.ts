import { create } from 'zustand';
import { fetchReadinessScore, fetchUserProfile, fetchAdMetrics } from '../services/api';

// Define types
interface ReadinessScore {
  user_id: string;
  score: number;
  calculated_at: string;
  signals: Record<string, number>;
}

interface UserProfile {
  user_id: string;
  profile_type: string;
  confidence: number;
  created_at: string;
  last_updated: string;
  dominant_signals: string[];
}

interface AdMetric {
  campaign_id: string;
  ad_id: string;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  roas: number;
}

interface AppState {
  // Data states
  readinessScores: ReadinessScore[];
  userProfiles: UserProfile[];
  adMetrics: AdMetric[];
  currentUserId: string | null;
  
  // UI states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchReadinessScore: (userId: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;
  fetchAdMetrics: () => Promise<void>;
  setCurrentUser: (userId: string) => void;
  setError: (error: string | null) => void;
}

// Create store
const useStore = create<AppState>((set, get) => ({
  // Initial state
  readinessScores: [],
  userProfiles: [],
  adMetrics: [],
  currentUserId: null,
  isLoading: false,
  error: null,
  
  // Actions
  fetchReadinessScore: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchReadinessScore(userId);
      // Add to existing scores or replace if exists
      set((state) => {
        const existingScores = state.readinessScores.filter(score => score.user_id !== userId);
        return {
          readinessScores: [...existingScores, data],
          isLoading: false
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch readiness score', 
        isLoading: false 
      });
    }
  },
  
  fetchUserProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchUserProfile(userId);
      // Add to existing profiles or replace if exists
      set((state) => {
        const existingProfiles = state.userProfiles.filter(profile => profile.user_id !== userId);
        return {
          userProfiles: [...existingProfiles, data],
          isLoading: false
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user profile', 
        isLoading: false 
      });
    }
  },
  
  fetchAdMetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchAdMetrics();
      set({ adMetrics: data.metrics, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch ad metrics', 
        isLoading: false 
      });
    }
  },
  
  setCurrentUser: (userId: string) => {
    set({ currentUserId: userId });
  },
  
  setError: (error: string | null) => {
    set({ error });
  }
}));

export default useStore; 