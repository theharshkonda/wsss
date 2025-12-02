import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, RefreshControl, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MediaGrid} from '../components/MediaGrid';
import {FileService} from '../services/FileService';
import {PermissionService} from '../services/PermissionService';
import {MediaItem, RootStackParamList} from '../types';
import {useTheme} from '../contexts/ThemeContext';
import {ThemedButton} from '../components/ThemedButton';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export const ImagesTab: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [images, setImages] = useState<MediaItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      const hasPermission = await PermissionService.checkAndRequestPermissions();
      if (!hasPermission) {
        console.log('ImagesTab: Permission denied');
        setLoading(false);
        return;
      }

      const media = await FileService.scanStatuses();
      console.log('ImagesTab: Total media from scanStatuses:', media.length);
      const imageItems = media.filter(item => item.type === 'image');
      console.log('ImagesTab: Filtered images:', imageItems.length);
      setImages(imageItems);

      // Automatically trigger SAF picker if no images found
      if (imageItems.length === 0) {
        console.log('ImagesTab: No images found, triggering SAF picker');
        const safMedia = await FileService.triggerSafPickerAndScan();
        console.log('ImagesTab: SAF media count:', safMedia.length);
        if (safMedia.length > 0) {
          const safImages = safMedia.filter(item => item.type === 'image');
          console.log('ImagesTab: SAF images count:', safImages.length);
          setImages(safImages);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadImages();
    setRefreshing(false);
  };

  const handleSelectFolder = async () => {
    const media = await FileService.triggerSafPickerAndScan();
    if (media.length > 0) {
      const imageItems = media.filter(item => item.type === 'image');
      setImages(imageItems);
      setShowFolderPicker(false);
    }
  };

  const handleItemPress = (item: MediaItem, index: number) => {
    navigation.navigate('MediaViewer', {
      item,
      allItems: images,
      currentIndex: index,
    });
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {showFolderPicker && images.length === 0 && !loading && (
        <View style={styles.pickerContainer}>
          <View style={[styles.dialog, {backgroundColor: theme.colors.card}]}>
            <Text style={[styles.title, {color: theme.colors.text}]}>
              Give access to WhatsApp Media
            </Text>
            <Text style={[styles.description, {color: theme.colors.subtext}]}>
              To view WhatsApp statuses, please select the Android/media folder in the next screen.
            </Text>
            <Text style={[styles.path, {color: theme.colors.subtext}]}>
              Navigate to:{'\n'}
              Android → media{'\n'}
              (The app will automatically find WhatsApp statuses)
            </Text>
            <ThemedButton
              title="Grant Access"
              onPress={handleSelectFolder}
              variant="primary"
              style={styles.button}
            />
          </View>
        </View>
      )}
      {loading && images.length === 0 ? (
        <View style={[styles.emptyContainer, {backgroundColor: theme.colors.background}]}>
          <Text style={[styles.loadingText, {color: theme.colors.subtext}]}>Loading statuses...</Text>
        </View>
      ) : (
        <MediaGrid
          items={images}
          onItemPress={handleItemPress}
          emptyMessage="No images found"
        />
      )}
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 24,
    zIndex: 10,
  },
  dialog: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 340,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  path: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  button: {
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
