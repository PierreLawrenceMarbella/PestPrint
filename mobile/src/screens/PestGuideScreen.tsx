import { StyleSheet, View } from 'react-native';

import { CategoryCard } from '../components/CategoryCard';
import { PageHeader } from '../components/PageHeader';
import { Screen } from '../components/Screen';
import { ScreenHeading } from '../components/ScreenHeading';
import { supportedCategories } from '../constants/categories';
import { theme } from '../theme';

export function PestGuideScreen() {
  return (
    <Screen header={<PageHeader title="Pest Guide" />} testID="pest-guide-screen">
      <ScreenHeading
        description="Learn the visible patterns associated with the categories supported by PESTPRINT."
        eyebrow="FIELD GUIDE"
        title="Rice crop categories"
      />
      <View style={styles.list}>
        {supportedCategories.map((category) => (
          <CategoryCard category={category} key={category.name} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.smMd,
  },
});
