import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { BrandHeader } from '../components/BrandHeader';
import { FeatureCard } from '../components/FeatureCard';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { theme } from '../theme';

const features = [
  {
    description: 'Choose or capture a clear photo of your rice crop.',
    icon: 'camera-outline' as const,
    title: 'Upload or Capture',
  },
  {
    description: 'Review visible crop damage with image-based analysis.',
    icon: 'scan-outline' as const,
    title: 'AI Analysis',
  },
  {
    description: 'See the predicted class and confidence information.',
    icon: 'document-text-outline' as const,
    title: 'Get Results',
  },
  {
    description: 'Support clearer rice pest identification in the field.',
    icon: 'people-outline' as const,
    title: 'For Agriculture',
  },
] as const;

export function HomeScreen() {
  return (
    <Screen testID="home-screen">
      <BrandHeader />
      <AppCard style={styles.hero} variant="outlined">
        <Text style={styles.eyebrow}>AI-POWERED RICE CROP SUPPORT</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Identify Rice Pests Through Crop Damage Images
        </Text>
        <Text style={styles.description}>
          Examine visible damage on rice leaves, stems, or grains and identify the most likely supported category.
        </Text>
        <AppButton
          label="Analyze a Rice Crop Image"
          leadingIcon="camera-outline"
          onPress={() => router.push('/analyze')}
          trailingIcon="chevron-forward"
        />
      </AppCard>

      <SectionTitle style={styles.sectionTitle}>How PESTPRINT helps</SectionTitle>
      <View style={styles.featureGrid}>
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: theme.colors.surface,
    borderWidth: 0,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.forest,
    fontSize: theme.type.size.caption,
    fontWeight: theme.type.weight.bold,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.type.size.display,
    fontWeight: theme.type.weight.black,
    letterSpacing: -1,
    lineHeight: theme.type.lineHeight.display,
  },
  description: {
    color: theme.colors.muted,
    fontSize: theme.type.size.body,
    lineHeight: theme.type.lineHeight.body,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.smMd,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.smMd,
  },
});
