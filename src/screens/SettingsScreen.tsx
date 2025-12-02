import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ThemedCard} from '../components/ThemedCard';
import {useTheme} from '../contexts/ThemeContext';
import {ThemeMode} from '../types';

export const SettingsScreen: React.FC = () => {
  const {theme, themeMode, setThemeMode} = useTheme();

  const themeOptions: {label: string; value: ThemeMode; icon: string}[] = [
    {label: 'Light', value: 'light', icon: 'sunny'},
    {label: 'Dark', value: 'dark', icon: 'moon'},
    {label: 'System', value: 'system', icon: 'phone-portrait'},
  ];

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.content}>
      <ThemedCard style={styles.card}>
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Theme
        </Text>
        {themeOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={styles.themeOption}
            onPress={() => setThemeMode(option.value)}
            activeOpacity={0.7}>
            <View style={styles.themeOptionLeft}>
              <Icon
                name={option.icon}
                size={24}
                color={theme.colors.text}
                style={styles.themeIcon}
              />
              <Text style={[styles.themeLabel, {color: theme.colors.text}]}>
                {option.label}
              </Text>
            </View>
            {themeMode === option.value && (
              <Icon name="checkmark-circle" size={24} color={theme.colors.accent} />
            )}
          </TouchableOpacity>
        ))}
      </ThemedCard>

      <ThemedCard style={styles.card}>
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          About
        </Text>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, {color: theme.colors.subtext}]}>
            Developer
          </Text>
          <Text style={[styles.aboutValue, {color: theme.colors.text}]}>
            StatusBox Team
          </Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, {color: theme.colors.subtext}]}>
            Version
          </Text>
          <Text style={[styles.aboutValue, {color: theme.colors.text}]}>
            1.0.0
          </Text>
        </View>
      </ThemedCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    marginRight: 12,
  },
  themeLabel: {
    fontSize: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutLabel: {
    fontSize: 16,
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
