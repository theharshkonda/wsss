import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, RefreshControl, Alert} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MediaGrid} from '../components/MediaGrid';
import {FileService} from '../services/FileService';
import {MediaItem, RootStackParamList} from '../types';
import {useTheme} from '../contexts/ThemeContext';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export const SavedScreen: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [savedMedia, setSavedMedia] = useState<MediaItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedMedia = useCallback(async () => {
    try {
      const media = await FileService.getSavedMedia();
      setSavedMedia(media);
    } catch (error) {
      Alert.alert('Error', 'Failed to load saved media');
      console.error('Load saved media error:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedMedia();
    }, [loadSavedMedia]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedMedia();
    setRefreshing(false);
  };

  const handleItemPress = (item: MediaItem, index: number) => {
    navigation.navigate('MediaViewer', {
      item,
      allItems: savedMedia,
      currentIndex: index,
    });
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <MediaGrid
        items={savedMedia}
        onItemPress={handleItemPress}
        emptyMessage="No saved statuses yet"
      />
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
