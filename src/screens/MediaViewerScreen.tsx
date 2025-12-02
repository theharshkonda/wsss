import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Platform,
  Image as RNImage,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImageViewer from 'react-native-image-zoom-viewer';
import Video from 'react-native-video';
import {Share} from 'react-native';
import {FileService} from '../services/FileService';
import {ThemedButton} from '../components/ThemedButton';
import {useTheme} from '../contexts/ThemeContext';
import {RootStackParamList} from '../types';

type MediaViewerScreenRouteProp = RouteProp<RootStackParamList, 'MediaViewer'>;

const {width, height} = Dimensions.get('window');

export const MediaViewerScreen: React.FC = () => {
  const {theme} = useTheme();
  const route = useRoute<MediaViewerScreenRouteProp>();
  const navigation = useNavigation();
  const {item} = route.params;

  const [saving, setSaving] = useState(false);
  const [paused, setPaused] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await FileService.saveMedia(item);
      Alert.alert('Success', 'Status saved to Pictures/StatusBox');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save status';
      Alert.alert('Error', errorMessage);
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        url: item.displayUri,
        message: 'Check out this status!',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}>
        <Icon name="arrow-back" size={28} color="#ffffff" />
      </TouchableOpacity>

      {item.type === 'image' ? (
        <ImageViewer
          imageUrls={[{url: item.displayUri}]}
          enableSwipeDown
          onSwipeDown={() => navigation.goBack()}
          backgroundColor={theme.colors.background}
          renderIndicator={() => null}
        />
      ) : (
        <View style={styles.videoContainer}>
          <Video
            source={{uri: item.displayUri}}
            style={styles.video}
            controls={false}
            resizeMode="contain"
            paused={paused}
            repeat
          />
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={() => setPaused(!paused)}
            activeOpacity={0.7}>
            <Icon
              name={paused ? 'play' : 'pause'}
              size={60}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionButtons}>
        <ThemedButton
          title="Save"
          onPress={handleSave}
          loading={saving}
          style={styles.actionButton}
        />
        <ThemedButton
          title="Share"
          onPress={handleShare}
          variant="outline"
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
  playPauseButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
