/**
 * Component Registry
 * Maps component name strings from A2UI payloads to actual React Native components.
 * This is the core of the Server-Driven UI pattern.
 */

import React from 'react';
import type { ComponentName, ComponentPropsMap, OnActionCallback } from '../types/a2ui';

import { BurnerCard } from './cards/BurnerCard';
import { FraudAlertView } from './cards/FraudAlertView';
import { SubscriptionManager } from './cards/SubscriptionManager';
import { PayrollAdvance } from './cards/PayrollAdvance';
import { ResolutionSuccessCard } from './cards/ResolutionSuccessCard';

/**
 * Registry mapping component name strings to React components.
 * Each component receives its typed props + onAction callback.
 */
export const COMPONENT_REGISTRY: Record<
  ComponentName,
  React.ComponentType<any & { onAction: OnActionCallback }>
> = {
  BurnerCard,
  FraudAlertView,
  SubscriptionManager,
  PayrollAdvance,
  ResolutionSuccessCard,
};

/**
 * Check if a component name is registered.
 */
export function isRegistered(name: string): name is ComponentName {
  return name in COMPONENT_REGISTRY;
}

/**
 * Get a component from the registry.
 * Returns null if not found.
 */
export function getComponent(
  name: string
): React.ComponentType<any & { onAction: OnActionCallback }> | null {
  if (isRegistered(name)) {
    return COMPONENT_REGISTRY[name];
  }
  return null;
}

/**
 * Get all registered component names.
 */
export function getRegisteredComponents(): ComponentName[] {
  return Object.keys(COMPONENT_REGISTRY) as ComponentName[];
}
