import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/colors';
import { Platform, View, Text, StyleSheet } from 'react-native';

function TabIcon({ name, focused, isCenter }: { name: string; focused: boolean; isCenter?: boolean }) {
  const icons: Record<string, { outline: string; filled: string }> = {
    index: { outline: 'home-outline', filled: 'home' },
    tracking: { outline: 'analytics-outline', filled: 'analytics' },
    moments: { outline: 'camera-outline', filled: 'camera' },
    chat: { outline: 'chatbubbles-outline', filled: 'chatbubbles' },
    profile: { outline: 'person-outline', filled: 'person' },
  };

  const icon = focused ? icons[name]?.filled : icons[name]?.outline;
  const size = isCenter ? 26 : 22;

  if (isCenter) {
    return (
      <View style={styles.centerIconContainer}>
        <View style={styles.centerIconBg}>
          <Ionicons name="camera" size={24} color={colors.white} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabIcon}>
      {icon && (
        <Ionicons
          name={icon as any}
          size={size}
          color={focused ? colors.primary : colors.textMuted}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Theo dõi',
          tabBarIcon: ({ focused }) => <TabIcon name="tracking" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="moments"
        options={{
          title: 'Khoảnh khắc',
          tabBarIcon: ({ focused }) => <TabIcon name="moments" focused={focused} isCenter />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Tin nhắn',
          tabBarIcon: ({ focused }) => <TabIcon name="chat" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  centerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  centerIconBg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3.5,
    borderColor: colors.surface,
  },
});
