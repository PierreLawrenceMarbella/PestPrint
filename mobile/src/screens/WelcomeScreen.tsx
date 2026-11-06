import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { theme } from '../theme';

export function WelcomeScreen() {
  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.brand}>
        PEST<Text style={styles.brandAccent}>PRINT</Text>
      </Text>
      <View style={styles.welcome}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>YOUR RICE CROP COMPANION</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Welcome to PESTPRINT
          </Text>
          <Text style={styles.description}>
            A closer look at your rice crop starts here.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  brandAccent: {
    color: theme.colors.forest,
  },
  welcome: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.forest,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.7,
    marginBottom: theme.spacing.md,
  },
  description: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 25,
  },
});
