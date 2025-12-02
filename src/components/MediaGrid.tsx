import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../contexts/ThemeContext';
import {MediaItem} from '../types';
import {StatusCard} from './StatusCard';

interface MediaGridProps {
  items: MediaItem[];
  onItemPress: (item: MediaItem, index: number) => void;
  emptyMessage?: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  onItemPress,
  emptyMessage = 'No media found',
}) => {
  const {theme} = useTheme();

  const renderItem = ({item, index}: {item: MediaItem; index: number}) => (
    <StatusCard
      item={item}
      onPress={() => onItemPress(item, index)}
    />
  );

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, {backgroundColor: theme.colors.background}]}>
        <Icon name="images-outline" size={64} color={theme.colors.subtext} />
        <Text style={[styles.emptyText, {color: theme.colors.subtext}]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
