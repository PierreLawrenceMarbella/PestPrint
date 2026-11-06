import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '../components/AppCard';
import { PageHeader } from '../components/PageHeader';
import { Screen } from '../components/Screen';
import { ScreenHeading } from '../components/ScreenHeading';
import { theme } from '../theme';

export function AboutScreen() {
  return (
    <Screen header={<PageHeader title="About" />} testID="about-screen">
      <ScreenHeading
        description="A mobile companion designed to make rice crop damage information easier to access in the field."
        eyebrow="ABOUT THE PROJECT"
        title="Practical support for rice crop care"
      />
      <AppCard style={styles.card}>
        <View style={styles.icon}>
          <Ionicons color={theme.colors.forest} name="leaf-outline" size={28} />
        </View>
        <Text style={styles.title}>Built for farmers and agriculture</Text>
        <Text style={styles.description}>
          PESTPRINT brings image-based crop support and a focused rice pest guide into one clear mobile experience.
        </Text>
      </AppCard>
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Ionicons color={theme.colors.forest} name="shield-checkmark-outline" size={22} />
          <Text style={styles.rowTitle}>Responsible results</Text>
        </View>
        <Text style={styles.description}>
          Results are intended to support field observations and should be considered alongside advice from agricultural experts.
        </Text>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: theme.colors.mint,
    borderRadius: theme.radius.pill,
    height: 52,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    width: 52,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.type.size.sectionTitle,
    fontWeight: theme.type.weight.bold,
    marginBottom: theme.spacing.sm,
  },
  description: {
    color: theme.colors.muted,
    fontSize: theme.type.size.label,
    lineHeight: theme.type.lineHeight.body,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  rowTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: theme.type.weight.bold,
  },
});
