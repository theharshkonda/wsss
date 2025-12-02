export interface MediaItem {
  id: string;
  uri: string;            // original SAF or file uri
  displayUri: string;     // uri safe to use in <Image> and for video
  name: string;
  type: 'image' | 'video';
  size: number;
  timestamp: number;
  isVideo: boolean;
  mtime: number;
  source: 'raw' | 'saf';
}

export type RootStackParamList = {
  Main: undefined;
  MediaViewer: {
    item: MediaItem;
    allItems: MediaItem[];
    currentIndex: number;
  };
};

export type BottomTabParamList = {
  Home: undefined;
  Saved: undefined;
  Settings: undefined;
};

export type TopTabParamList = {
  Images: undefined;
  Videos: undefined;
};

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  dark: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    subtext: string;
    border: string;
    accent: string;
    error: string;
  };
}
