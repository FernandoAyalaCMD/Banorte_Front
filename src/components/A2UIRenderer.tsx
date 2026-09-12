/**
 * A2UI Dynamic Renderer
 * Receives an A2UIPayload, resolves the component from the registry,
 * and renders it with entrance animations and the onAction callback.
 */

import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { getComponent } from './registry';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/banorte';
import type { A2UIPayload, A2UIEventType, OnActionCallback } from '../types/a2ui';

interface A2UIRendererProps {
  payload: A2UIPayload;
  onAction: (
    actionId: string,
    eventType: A2UIEventType,
    eventPayload: Record<string, unknown>
  ) => void;
}

export const A2UIRenderer: React.FC<A2UIRendererProps> = ({ payload, onAction }) => {
  const Component = getComponent(payload.component);

  const handleAction: OnActionCallback = useCallback(
    (eventType, eventPayload) => {
      onAction(payload.actionId, eventType, eventPayload);
    },
    [payload.actionId, onAction]
  );

  if (!Component) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.errorContainer}
      >
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Componente no encontrado</Text>
        <Text style={styles.errorMessage}>
          "{payload.component}" no está registrado en el Component Registry.
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(250)}
      layout={Layout.springify()}
      style={styles.container}
    >
      <Component {...payload.props} onAction={handleAction} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  errorIcon: {
    fontSize: 32,
  },
  errorTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.warning,
  },
  errorMessage: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.darkGray,
    textAlign: 'center',
  },
});

export default A2UIRenderer;
