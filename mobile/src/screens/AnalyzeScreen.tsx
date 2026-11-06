import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '../components/AppCard';
import { CategoryCard } from '../components/CategoryCard';
import { PageHeader } from '../components/PageHeader';
import { Screen } from '../components/Screen';
import { ScreenHeading } from '../components/ScreenHeading';
import { SectionTitle } from '../components/SectionTitle';
import { supportedCategories } from '../constants/categories';
import { theme } from '../theme';

export function AnalyzeScreen() {
  return (
    <Screen header={<PageHeader title="Analyze Image" />} testID="analyze-screen">
      <ScreenHeading
        description="Use a clear, well-lit image that keeps the damaged rice leaves, stem, or grains visible."
        eyebrow="RICE CROP ANALYSIS"
        title="Analyze a crop image"
      />

      <AppCard style={styles.scanCard} variant="outlined">
        <View style={styles.scanIcon}>
          <Ionicons color={theme.colors.forest} name="images-outline" size={34} />
        </View>
        <Text style={styles.scanTitle}>Image tools will appear here</Text>
        <Text style={styles.scanDescription}>
          Upload and camera controls will be connected in the next mobile phase.
        </Text>
      </AppCard>

      <SectionTitle style={styles.sectionTitle}>Supported categories</SectionTitle>
      <View style={styles.categoryGrid}>
        {supportedCategories.map((category) => (
          <CategoryCard category={category} compact key={category.name} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scanCard: {
    alignItems: 'center',
    borderColor: theme.colors.borderStrong,
    borderStyle: 'dashed',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  scanIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.mint,
    borderRadius: theme.radius.pill,
    height: 64,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    width: 64,
  },
  scanTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: theme.type.weight.bold,
    textAlign: 'center',
  },
  scanDescription: {
    color: theme.colors.muted,
    fontSize: theme.type.size.label,
    lineHeight: theme.type.lineHeight.compact,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.smMd,
  },
});
