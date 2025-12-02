import React from 'react';
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {MediaItem} from '../types';

interface StatusCardProps {
  item: MediaItem;
  onPress: () => void;
}

const {width} = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARDS_PER_ROW = 2;
const CARD_WIDTH = (width - CARD_MARGIN * (CARDS_PER_ROW + 1)) / CARDS_PER_ROW;
const CARD_HEIGHT = CARD_WIDTH * 1.5; // Increased height ratio

export const StatusCard: React.FC<StatusCardProps> = ({item, onPress}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}>
      <Image
        source={{uri: item.displayUri}}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      {item.isVideo && (
        <View style={styles.videoOverlay}>
          <Icon name="play-circle" size={40} color="#ffffff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: CARD_MARGIN / 2,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#1a1a1a',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
