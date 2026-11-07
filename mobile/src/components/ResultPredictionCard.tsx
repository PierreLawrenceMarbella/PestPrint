import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { getResultName } from '../constants/resultContent';
import { theme } from '../theme';
import { resultPalette } from '../theme/resultPalette';
import type { ClassificationResult } from '../types/pestResult';
import { AppCard } from './AppCard';
import { ConfidenceBar } from './ConfidenceBar';
import { ResultProbabilities } from './ResultProbabilities';

export function ResultPredictionCard({ result }: { result: ClassificationResult }) {
  const palette = resultPalette[result.kind];
  const fixture = result.source === 'development-fixture';
  const unknownScore = result.kind === 'unknown' ? result.score : null;
  return (
    <AppCard style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={styles.heading}>
        {result.kind !== 'known-pest' ? (
          <View style={[styles.icon, { backgroundColor: palette.border }]}>
            <Ionicons accessible={false} color={palette.accent} name={result.kind === 'healthy' ? 'leaf-outline' : 'help'} size={28} />
          </View>
        ) : null}
        <View style={styles.title}>
          <Text style={[styles.eyebrow, { color: palette.accent }]}>
            {result.kind === 'known-pest' ? (fixture ? 'Development Fixture' : 'Predicted Pest') : 'Predicted Class'}
          </Text>
          <Text accessibilityRole="header" style={styles.name}>{getResultName(result)}</Text>
        </View>
      </View>
      {result.kind !== 'unknown' ? (
        <ConfidenceBar accentColor={palette.accent} fixture={fixture} trackColor={palette.border} value={result.confidencePercent} />
      ) : unknownScore ? (
        unknownScore.scale === 'percent' ? (
          <ConfidenceBar accentColor={palette.accent} fixture={fixture} label={unknownScore.label} trackColor={palette.border} value={unknownScore.value} />
        ) : (
          <Text style={[styles.rawScore, { color: palette.accent }]} testID="result-raw-score">
            {fixture ? `Sample ${unknownScore.label.toLowerCase()}` : unknownScore.label}: {unknownScore.value}
          </Text>
        )
      ) : <Text style={styles.unavailable} testID="result-score-unavailable">No score was supplied.</Text>}
      {result.source === 'on-device' && result.inference
        ? <ResultProbabilities accent={palette.accent} probabilities={result.inference.probabilities} /> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: theme.spacing.lg, padding: theme.spacing.md },
  heading: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.smMd },
  icon: { alignItems: 'center', borderRadius: theme.radius.pill, height: 44, justifyContent: 'center', marginTop: theme.spacing.xs, width: 44 },
  title: { flex: 1 },
  eyebrow: { color: theme.colors.predictionAccent, fontSize: theme.type.size.caption, fontWeight: theme.type.weight.bold },
  name: {
    color: theme.colors.text, fontSize: theme.type.size.pageTitle, fontWeight: theme.type.weight.bold,
    lineHeight: theme.type.lineHeight.pageTitle, marginBottom: theme.spacing.smMd, marginTop: theme.spacing.xs,
  },
  rawScore: { fontSize: theme.type.size.body, fontWeight: theme.type.weight.bold },
  unavailable: { color: theme.colors.muted, fontSize: theme.type.size.label, lineHeight: theme.type.lineHeight.compact },
});
