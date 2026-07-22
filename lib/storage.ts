import { VoiceoverTarget } from '@/components/AudioPlayerCard';

export interface SavedCampaign {
  id: string;
  title: string;
  createdAt: string;
  sourceScript: string;
  tone: string;
  results: VoiceoverTarget[];
}

const STORAGE_KEY = 'voiceover_podcast_studio_campaigns';

export function getSavedCampaigns(): SavedCampaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading saved campaigns', e);
    return [];
  }
}

export function saveCampaignToHistory(campaign: Omit<SavedCampaign, 'id' | 'createdAt'>): SavedCampaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedCampaigns();
    const newEntry: SavedCampaign = {
      ...campaign,
      id: `camp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...existing].slice(0, 20); // keep last 20
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving campaign', e);
    return [];
  }
}

export function deleteSavedCampaign(id: string): SavedCampaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedCampaigns();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting campaign', e);
    return [];
  }
}
