import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {ImagesTab} from './ImagesTab';
import {VideosTab} from './VideosTab';
import {useTheme} from '../contexts/ThemeContext';
import {TopTabParamList} from '../types';

const TopTab = createMaterialTopTabNavigator<TopTabParamList>();

export const HomeScreen: React.FC = () => {
  const {theme} = useTheme();

  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.subtext,
        tabBarIndicatorStyle: {backgroundColor: theme.colors.accent, height: 3},
        tabBarStyle: {backgroundColor: theme.colors.background},
        tabBarLabelStyle: {fontSize: 14, fontWeight: '600'},
      }}>
      <TopTab.Screen name="Images" component={ImagesTab} />
      <TopTab.Screen name="Videos" component={VideosTab} />
    </TopTab.Navigator>
  );
};
