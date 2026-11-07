import { StyleSheet, Text, View } from 'react-native';

import { formatConfidencePercent, getConfidencePercent } from '../services/pestResult';
import { theme } from '../theme';

type ConfidenceBarProps = {
  value?: number | null;
  fixture?: boolean;
  label?: string;
  accentColor?: string;
  trackColor?: string;
};

export function ConfidenceBar({ value, fixture = false, label: suppliedLabel = 'Confidence Score', accentColor = theme.colors.predictionAccent, trackColor = theme.colors.predictionBorder }: ConfidenceBarProps) {
  const confidence = getConfidencePercent(value);
  const label = fixture ? (suppliedLabel === 'Confidence Score' ? 'Sample confidence' : `Sample ${suppliedLabel.toLowerCase()}`) : suppliedLabel;

  return (
    <View
      accessible
      accessibilityLabel={confidence === null ? 'Confidence unavailable' : `${label}: ${formatConfidencePercent(confidence)}`}
      accessibilityRole={confidence === null ? 'text' : 'progressbar'}
      accessibilityValue={confidence === null ? undefined : { min: 0, max: 100, now: confidence }}
      testID="result-confidence"
    >
      <Text style={styles.label}>{confidence === null ? 'Confidence unavailable' : label}</Text>
      {confidence !== null ? <Text style={[styles.value, { color: accentColor }]}>{formatConfidencePercent(confidence)}</Text> : null}
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        {confidence !== null ? (
          <View style={[styles.fill, { backgroundColor: accentColor, width: `${confidence}%` }]} testID="result-confidence-fill" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.muted, fontSize: theme.type.size.caption,
    fontWeight: theme.type.weight.medium, marginBottom: theme.spacing.xs,
  },
  value: { fontSize: 20, fontWeight: theme.type.weight.bold, lineHeight: 28, marginBottom: theme.spacing.sm },
  track: { backgroundColor: theme.colors.predictionBorder, borderRadius: theme.radius.pill, height: 9, overflow: 'hidden' },
  fill: { backgroundColor: theme.colors.predictionAccent, borderRadius: theme.radius.pill, height: '100%' },
});
