/**
 * Haptic Feedback Utilities
 * Semantic wrappers around expo-haptics for consistent tactile feedback.
 */

import * as Haptics from 'expo-haptics';

/** Light tap – for toggles, switches, minor selections */
export const tapLight = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

/** Medium tap – for button presses, confirmations */
export const tapMedium = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

/** Heavy tap – for destructive/critical actions */
export const tapHeavy = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

/** Selection changed – for slider movement, picker changes */
export const selectionChanged = () =>
  Haptics.selectionAsync();

/** Success notification */
export const notifySuccess = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

/** Warning notification */
export const notifyWarning = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

/** Error notification */
export const notifyError = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
