import { useEffect, type ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useProcessingMotion } from '../hooks/useProcessingMotion';
import type { CropImage } from '../types/cropImage';
import { theme } from '../theme';

type ProcessingVisualProps = {
  active: boolean;
  children: ReactNode;
  image: CropImage;
};

export function ProcessingVisual({ active, children, image }: ProcessingVisualProps) {
  const { width } = useWindowDimensions();
  const size = Math.min(220, Math.max(156, width - 120));
  const animate = useProcessingMotion(active);
  const phase = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(phase);
    phase.value = 0;
    if (animate) {
      phase.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.linear }), -1);
    }
    return () => cancelAnimation(phase);
  }, [animate, phase]);

  const rotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${phase.value * 360}deg` }],
  }));
  const scan = useAnimatedStyle(() => ({
    opacity: animate ? interpolate(phase.value, [0, 0.12, 0.88, 1], [0, 0.6, 0.6, 0]) : 0,
    transform: [{ translateY: phase.value * 84 }],
  }));

  return (
    <>
      <View
        accessible
        accessibilityLabel={active ? 'Analyzing image. Progress is indeterminate.' : 'PESTPRINT rice crop analysis'}
        accessibilityRole={active ? 'progressbar' : 'image'}
        accessibilityState={{ busy: active }}
        style={[styles.indicator, { height: size, width: size, borderRadius: size / 2 }]}
        testID="processing-indicator"
      >
        <Animated.View
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.arc,
            { borderRadius: size / 2, borderTopColor: active ? theme.colors.forest : theme.colors.forestSoft },
            !active && styles.inactiveArc,
            rotation,
          ]}
        />
        <View importantForAccessibility="no-hide-descendants" style={styles.leafMark}>
          <Ionicons color={theme.colors.forestDark} name="leaf-outline" size={52} />
        </View>
      </View>
      {children}
      <View style={styles.cropCard}>
        <View style={styles.cropFrame}>
          <Image
            accessibilityLabel="Selected rice crop image"
            resizeMode="contain"
            resizeMethod="resize"
            source={{ uri: image.uri }}
            style={styles.cropImage}
          />
          <Animated.View pointerEvents="none" style={[styles.scanLine, scan]} />
          <View pointerEvents="none" style={styles.topCorner} />
          <View pointerEvents="none" style={styles.bottomCorner} />
        </View>
        <View style={styles.cropCopy}>
          <Text style={styles.cropTitle}>Selected crop image</Text>
          <Text numberOfLines={2} style={styles.fileName}>{image.fileName}</Text>
          <Text style={styles.cropNote}>{active ? 'Analysis request in progress' : 'Image ready for review'}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  indicator: {
    alignItems: 'center', alignSelf: 'center', borderColor: theme.colors.mint,
    borderWidth: 11, justifyContent: 'center', marginBottom: theme.spacing.xl,
  },
  arc: {
    position: 'absolute', top: -11, bottom: -11, left: -11, right: -11,
    borderWidth: 11, borderColor: theme.colors.forest, borderLeftColor: 'transparent',
  },
  inactiveArc: { borderColor: theme.colors.forestSoft, borderLeftColor: theme.colors.forestSoft },
  leafMark: {
    alignItems: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.forestDark,
    borderRadius: 44, borderWidth: 2, height: 88, justifyContent: 'center', width: 88,
  },
  cropCard: {
    alignItems: 'center', backgroundColor: theme.colors.canvas, borderColor: theme.colors.border,
    borderRadius: theme.radius.card, borderWidth: 1, flexDirection: 'row', gap: theme.spacing.md,
    marginBottom: theme.spacing.lg, padding: theme.spacing.smMd, width: '100%',
  },
  cropFrame: {
    backgroundColor: theme.colors.mint, borderRadius: theme.radius.control, height: 88,
    overflow: 'hidden', width: 88,
  },
  cropImage: { height: '100%', width: '100%' },
  cropCopy: { flex: 1 },
  cropTitle: { color: theme.colors.text, fontSize: theme.type.size.label, fontWeight: theme.type.weight.bold },
  fileName: { color: theme.colors.muted, fontSize: theme.type.size.caption, marginTop: theme.spacing.xs },
  cropNote: { color: theme.colors.forestDark, fontSize: theme.type.size.caption, marginTop: theme.spacing.sm },
  scanLine: {
    backgroundColor: theme.colors.forest, height: 3, left: 0, position: 'absolute', right: 0, top: 1,
  },
  topCorner: {
    borderColor: theme.colors.surface, borderLeftWidth: 2, borderTopWidth: 2,
    height: 13, left: 5, position: 'absolute', top: 5, width: 13,
  },
  bottomCorner: {
    borderBottomWidth: 2, borderColor: theme.colors.surface, borderRightWidth: 2,
    bottom: 5, height: 13, position: 'absolute', right: 5, width: 13,
  },
});
