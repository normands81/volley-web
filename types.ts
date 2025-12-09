export interface NavItem {
  label: string;
  href: string;
}

export interface MatchResult {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  category: string;
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
}

export enum ChatRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export interface Season {
  id: number;
  description: string;
  current: boolean;
}

export interface Team {
  idteam: number;
  description: string;
  idseason: number;
  season?: Season;
}

export interface Partner {
  idpartner: number;
  description: string;
  logo?: string;
  website_url?: string;
  active: boolean;
  idseason: number;
}