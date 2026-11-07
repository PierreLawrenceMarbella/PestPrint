import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ModelEvidence } from '../types/pestResult';
import { theme } from '../theme';
import { formatPercentage } from '../utils/formatPercentage';

const categories = [
  ['healthy_rice', 'Healthy Rice'], ['rice_leaffolder', 'Rice Leaffolder'],
  ['rice_stem_borer', 'Stem Borer'], ['unknown', 'Unknown (Other Damage)'],
] as const;

/** Optional real model details inside the existing result card; no fixture values. */
export function ResultProbabilities({ probabilities, accent }: { probabilities: ModelEvidence['probabilities']; accent: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)} style={({ pressed }) => [styles.toggle, pressed && { opacity: 0.7 }]}
        testID="prediction-probability-toggle">
        <Text style={[styles.toggleLabel, { color: accent }]}>Prediction probabilities</Text>
        <Ionicons accessible={false} color={accent} name={expanded ? 'chevron-up' : 'chevron-down'} size={16} />
      </Pressable>
      {expanded ? categories.map(([id, name]) => (
        <View key={id} style={styles.row}>
          <View style={styles.labels}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.value}>{formatPercentage(probabilities[id], 'probability')}</Text>
          </View>
          <View style={styles.track}><View style={{ height: 4, backgroundColor: accent, width: `${probabilities[id] * 100}%` }} /></View>
        </View>
      )) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { marginTop: theme.spacing.smMd },
  toggle: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 44 },
  toggleLabel: { flex: 1, fontSize: theme.type.size.label, fontWeight: theme.type.weight.bold },
  row: { marginTop: theme.spacing.sm },
  labels: { flexDirection: 'row', gap: theme.spacing.sm, justifyContent: 'space-between', marginBottom: 4 },
  name: { color: theme.colors.text, flex: 1, fontSize: theme.type.size.caption },
  value: { color: theme.colors.text, flex: 1, fontSize: theme.type.size.caption, textAlign: 'right' },
  track: { backgroundColor: theme.colors.canvas, borderRadius: 2, height: 4, overflow: 'hidden' },
});
