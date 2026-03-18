import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, StyleProp, ImageStyle, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../constants/colors';

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 48,
  style,
  showBorder = true,
}) => {
  const initials = useMemo(() => {
    if (!name) return '?';
    return getInitials(name);
  }, [name]);

  const imageStyle = useMemo(() => [
    styles.image,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: showBorder ? 2 : 0,
      borderColor: colors.surface,
    },
    style as StyleProp<ImageStyle>
  ], [size, style, showBorder]);

  const placeholderStyle = useMemo(() => [
    styles.placeholder,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: showBorder ? 2 : 0,
      borderColor: colors.surface,
    },
    style
  ], [size, style, showBorder]);

  const textStyle = useMemo(() => [
    styles.initials,
    { fontSize: size / 2.5 }
  ], [size]);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={imageStyle}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View style={placeholderStyle}>
      <Text style={textStyle}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.primaryLight,
  },
  placeholder: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
});
