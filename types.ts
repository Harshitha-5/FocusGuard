export interface BlockedApp {
  id: string;
  name: string;
  icon: string; // Emoji or URL
  color: string;
  dailyLimitSeconds: number;
  usedSeconds: number;
  type: 'social' | 'video' | 'news';
  isEnabled: boolean;
}

export interface MathQuestion {
  question: string;
  answer: number;
  options: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UsageLog {
  date: string;
  appId: string;
  durationSeconds: number;
  challengesSolved: number;
}

export interface AppSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  bonusTimeSeconds: number;
  penaltySeconds: number;
  challengeType: 'math' | 'memory' | 'breathing';
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  ACTIVE_APP = 'ACTIVE_APP',
  LOCKED = 'LOCKED',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS'
}