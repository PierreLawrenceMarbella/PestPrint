import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '../theme';

type AppButtonProps = Pick<PressableProps, 'disabled' | 'onPress' | 'testID'> & {
  label: string;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary';
};

export function AppButton({
  disabled,
  label,
  leadingIcon,
  onPress,
  style,
  testID,
  trailingIcon,
  variant = 'primary',
}: AppButtonProps) {
  const secondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        secondary ? styles.secondary : styles.primary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      {leadingIcon ? (
        <Ionicons
          color={secondary ? theme.colors.forest : theme.colors.surface}
          name={leadingIcon}
          size={19}
        />
      ) : null}
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
      {trailingIcon ? (
        <Ionicons
          color={secondary ? theme.colors.forest : theme.colors.surface}
          name={trailingIcon}
          size={18}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: theme.radius.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: theme.spacing.mdLg,
  },
  primary: {
    backgroundColor: theme.colors.forest,
    borderColor: theme.colors.forest,
    ...theme.shadow.card,
  },
  secondary: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.forestSoft,
  },
  label: {
    color: theme.colors.surface,
    fontSize: theme.type.size.body,
    fontWeight: theme.type.weight.bold,
  },
  secondaryLabel: {
    color: theme.colors.forest,
  },
  pressed: {
    elevation: 0,
    opacity: 0.86,
    transform: [{ translateY: 1 }],
  },
  disabled: {
    opacity: 0.48,
  },
});
