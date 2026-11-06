import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import type { CropImage } from '../types/cropImage';
import { theme } from '../theme';
import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { PageHeader } from './PageHeader';
import { Screen } from './Screen';

const entrance = FadeIn.duration(260).reduceMotion(ReduceMotion.System);

export function ProcessingPreview({ image, onBack }: { image: CropImage; onBack: () => void }) {
  return (
    <Screen
      contentStyle={styles.content}
      header={<PageHeader onBack={onBack} title="Processing Preview" />}
      testID="processing-preview-screen"
    >
      <Animated.View entering={entrance}>
        <Image
          accessibilityLabel="Selected rice crop image"
          resizeMode="contain"
          source={{ uri: image.uri }}
          style={styles.image}
        />
        <View style={styles.icon}>
          <Ionicons color={theme.colors.forest} name="checkmark-circle-outline" size={48} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>Ready for analysis</Text>
        <AppCard style={styles.notice} variant="mint">
          <Text style={styles.noticeTitle}>Analysis is not connected yet</Text>
          <Text style={styles.description}>
            Your image is ready. This is a preview of the processing screen; no image
            has been sent for analysis and no prediction has been made.
          </Text>
        </AppCard>
        <AppButton label="Back to Image" onPress={onBack} testID="processing-back-button" />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: theme.spacing.lg },
  image: { backgroundColor: theme.colors.canvas, borderRadius: theme.radius.card, height: 220, width: '100%' },
  icon: { alignItems: 'center', marginTop: theme.spacing.lg },
  title: {
    color: theme.colors.text,
    fontSize: theme.type.size.pageTitle,
    fontWeight: theme.type.weight.bold,
    marginVertical: theme.spacing.md,
    textAlign: 'center',
  },
  notice: { marginBottom: theme.spacing.lg },
  noticeTitle: { color: theme.colors.forestDark, fontSize: theme.type.size.body, fontWeight: theme.type.weight.bold },
  description: { color: theme.colors.text, fontSize: theme.type.size.label, lineHeight: theme.type.lineHeight.compact, marginTop: theme.spacing.sm },
});
