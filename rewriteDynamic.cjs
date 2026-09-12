const fs = require('fs');
const path = require('path');
const file = path.join('src', 'components', 'cards', 'DynamicBankView.tsx');

const content = `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/banorte';
import { BanorteButton } from '../ui/BanorteButton';
import { AnimatedCard } from '../ui/AnimatedCard';
import type { DynamicBankViewProps, DynamicElement, OnActionCallback } from '../../types/a2ui';

interface Props extends DynamicBankViewProps {
  onAction: OnActionCallback;
}

export const DynamicBankView: React.FC<Props> = ({
  title = 'Información',
  subtitle,
  elements = [],
  onAction,
}) => {

  const parseMarkdown = (text?: string) => {
    if (!text) return null;
    const cleanText = text.replace(/###\\s*/g, '');
    const parts = cleanText.split(/(\\**.*?\\**)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={{ fontFamily: Typography.fontFamily.bold, color: Colors.black }}>
            {part.replace(/\\*\\*/g, '')}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const renderElement = (el: DynamicElement, index: number) => {
    switch (el.type) {
      case 'header':
        return (
          <Text key={index} style={styles.headerText}>
            {parseMarkdown(el.content)}
          </Text>
        );
      case 'text':
        return (
          <Text key={index} style={styles.normalText}>
            {parseMarkdown(el.content)}
          </Text>
        );
      case 'key_value':
        return (
          <View key={index} style={styles.keyValueRow}>
            <Text style={styles.keyText}>{parseMarkdown(el.label)}</Text>
            <Text style={styles.valueText}>{parseMarkdown(String(el.value))}</Text>
          </View>
        );
      case 'action_button':
        return (
          <View key={index} style={styles.buttonContainer}>
            <BanorteButton
              title={el.label || 'Continuar'}
              onPress={() => onAction('button_press', { action: el.action || 'custom_action' })}
              variant="primary"
            />
          </View>
        );
      case 'bar_chart':
        if (!el.data || el.data.length === 0) return null;
        const maxVal = Math.max(...el.data.map((d) => d.value));
        return (
          <View key={index} style={styles.chartContainer}>
            {el.content && <Text style={styles.chartTitle}>{el.content}</Text>}
            <View style={styles.barsWrapper}>
              {el.data.map((item, i) => {
                const heightPct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                const displayVal = item.value >= 1000 ? (item.value / 1000).toFixed(1) + 'k' : item.value;
                return (
                  <View key={i} style={styles.barColumn}>
                    <Text style={styles.barValueText} numberOfLines={1}>{displayVal}</Text>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { height: \`\${heightPct}%\` }]} />
                    </View>
                    <Text style={styles.barLabel} numberOfLines={1}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatedCard entrance="fadeDown" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.content}>
        {elements.map((el, index) => (
          <Animated.View key={index} entering={FadeInDown.delay(index * 100 + 200).duration(400)}>
            {renderElement(el, index)}
          </Animated.View>
        ))}
      </View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  header: {
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.darkGray,
    marginTop: 4,
  },
  content: {
    gap: Spacing.md,
  },
  headerText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.black,
    marginTop: Spacing.sm,
  },
  normalText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.darkGray,
    lineHeight: 22,
  },
  keyValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.lightGray,
    alignItems: 'center',
  },
  keyText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  valueText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.black,
    textAlign: 'right',
    flex: 1,
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
  chartContainer: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
  },
  chartTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.darkGray,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
    marginTop: Spacing.md,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValueText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  barBg: {
    height: 100,
    width: 28,
    backgroundColor: '#EAEAEA',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  barLabel: {
    marginTop: Spacing.sm,
    fontSize: 11,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
  },
});
`;

fs.writeFileSync(file, content, 'utf8');
console.log('Updated DynamicBankView.tsx successfully.');
