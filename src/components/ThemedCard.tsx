import React, {ReactNode} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';

interface ThemedCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({children, style}) => {
  const {theme} = useTheme();

  return (
    <View
      style={[
        styles.card,
        {backgroundColor: theme.colors.card, borderColor: theme.colors.border},
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
  },
});
