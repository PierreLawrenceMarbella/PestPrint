import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import { AppButton } from '../components/AppButton';
import { PageHeader } from '../components/PageHeader';
import { ResultCharacteristics } from '../components/ResultCharacteristics';
import { ResultEducationModal } from '../components/ResultEducationModal';
import { ResultPredictionCard } from '../components/ResultPredictionCard';
import { Screen } from '../components/Screen';
import { getResultName } from '../constants/resultContent';
import { theme } from '../theme';
import type { CropImage } from '../types/cropImage';
import type { ClassificationResult } from '../types/pestResult';

type ResultScreenProps = {
  image: CropImage;
  result: ClassificationResult;
  onBack: () => void;
  onAnalyzeAnother: () => void;
};

const entrance = FadeIn.duration(240).reduceMotion(ReduceMotion.System);

export function ResultScreen({ image, result, onBack, onAnalyzeAnother }: ResultScreenProps) {
  const [educationVisible, setEducationVisible] = useState(false);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const fixture = result.source === 'development-fixture';

  return (
    <>
      <Screen
        contentStyle={styles.content}
        header={<PageHeader onBack={onBack} title="Analysis Result" />}
        testID={`${result.kind}-result-screen`}
      >
        <Animated.View entering={entrance}>
          {fixture ? (
            <View accessibilityRole="alert" style={styles.fixture} testID="result-fixture-notice">
              <Text style={styles.fixtureTitle}>DEVELOPMENT FIXTURE</Text>
              <Text style={styles.fixtureText}>Example image and sample scores. No AI analysis was run.</Text>
            </View>
          ) : null}
          <View style={styles.imageFrame}>
            {failedUri === image.uri ? (
              <Text style={styles.imageError}>This image is no longer available. You can analyze another image.</Text>
            ) : (
              <Image
                accessibilityLabel={fixture ? `${getResultName(result)} development example image` : 'Selected rice crop image'}
                onError={() => setFailedUri(image.uri)}
                resizeMode="contain"
                resizeMethod="resize"
                source={{ uri: image.uri }}
                style={styles.image}
                testID="result-crop-image"
              />
            )}
          </View>
          <ResultPredictionCard result={result} />
          <ResultCharacteristics result={result} />
          <AppButton
            allowLabelWrap
            label="Analyze Another Image"
            leadingIcon="refresh-outline"
            onPress={onAnalyzeAnother}
            style={styles.action}
            testID="analyze-another-image-button"
          />
          {result.kind !== 'healthy' ? <AppButton
            allowLabelWrap
            label={result.kind === 'known-pest' ? 'Learn More About This Pest' : 'Learn More'}
            onPress={() => setEducationVisible(true)}
            style={styles.action}
            testID="learn-more-pest-button"
            variant="secondary"
          /> : null}
        </Animated.View>
      </Screen>
      <ResultEducationModal onClose={() => setEducationVisible(false)} result={result} visible={educationVisible} />
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: theme.spacing.md },
  imageFrame: {
    alignItems: 'center', backgroundColor: theme.colors.canvas, borderRadius: theme.radius.card,
    justifyContent: 'center', marginBottom: theme.spacing.smMd, overflow: 'hidden', width: '100%',
  },
  image: { height: 210, width: '100%' },
  imageError: { color: theme.colors.muted, lineHeight: theme.type.lineHeight.body, padding: theme.spacing.lg },
  action: { marginBottom: theme.spacing.smMd, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.sm },
  fixture: { backgroundColor: theme.colors.mint, borderRadius: theme.radius.control, marginBottom: theme.spacing.md, padding: theme.spacing.smMd },
  fixtureTitle: { color: theme.colors.forestDark, fontSize: theme.type.size.caption, fontWeight: theme.type.weight.bold },
  fixtureText: { color: theme.colors.text, fontSize: theme.type.size.caption, lineHeight: 18, marginTop: theme.spacing.xs },
});
