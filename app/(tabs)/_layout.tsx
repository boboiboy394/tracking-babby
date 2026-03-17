import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { View, Text, StyleSheet, Platform } from 'react-native';

function TabIcon({ name, focused, isCenter }: { name: string; focused: boolean; isCenter?: boolean }) {
  const icons: Record<string, string> = {
    index: '🏠',
    tracking: '📊',
    moments: '📸',
    chat: '💬',
    profile: '👤',
  };

  const size = isCenter ? 28 : 22;

  if (isCenter) {
    return (
      <View style={styles.centerIconContainer}>
        <View style={styles.centerIconBg}>
          <Text style={styles.centerIconText}>📸</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '•'}
      </Text>
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
          title: 'Home',
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
          title: 'Chat',
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
    height: Platform.OS === 'ios' ? 85 : 70,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
  centerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -15,
  },
  centerIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  centerIconText: {
    fontSize: 26,
  },
});
