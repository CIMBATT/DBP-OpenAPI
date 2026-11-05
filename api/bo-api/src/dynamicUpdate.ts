import type { DynamicUpdate } from './types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTimestamp = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));

// Returns the original lastUpdate string of the most recent entry, preserving its precision.
export function latestDynamicUpdate(updates: unknown): string | undefined {
  if (!Array.isArray(updates)) return undefined;
  let latest: { value: string; time: number } | undefined;
  for (const update of updates) {
    const value = isObject(update) ? update.lastUpdate : undefined;
    if (!isTimestamp(value)) continue;
    const time = Date.parse(value);
    if (!latest || time > latest.time) latest = { value, time };
  }
  return latest?.value;
}

export function isDynamicUpdate(value: unknown): value is DynamicUpdate {
  if (!isObject(value) || !isTimestamp(value.lastUpdate)) return false;
  const information = value.generalProductInformation;
  if (
    !isObject(information) ||
    typeof information.batteryStatus !== 'string' ||
    !isObject(information.operatorInformation) ||
    typeof information.operatorInformation.identifier !== 'string'
  ) return false;

  if (value.performance === undefined || value.performance === null) return true;
  if (!isObject(value.performance)) return false;
  const { batteryCondition, batteryTechnicalProperties } = value.performance;
  if (
    !isObject(batteryCondition) ||
    !isObject(batteryCondition.capacityFade) ||
    !Array.isArray(batteryCondition.internalResistanceIncrease) ||
    !isObject(batteryTechnicalProperties)
  ) return false;

  const fade = batteryCondition.capacityFade;
  if (
    (fade.capacityFadeValue !== undefined &&
      (typeof fade.capacityFadeValue !== 'number' || !Number.isFinite(fade.capacityFadeValue))) ||
    (fade.lastUpdate !== undefined && !isTimestamp(fade.lastUpdate))
  ) return false;

  if (!batteryCondition.internalResistanceIncrease.every((entry: unknown) =>
    isObject(entry) &&
    (entry.batteryComponent === undefined || typeof entry.batteryComponent === 'string') &&
    (entry.internalResistanceIncreaseValue === undefined ||
      (typeof entry.internalResistanceIncreaseValue === 'number' && Number.isFinite(entry.internalResistanceIncreaseValue))) &&
    (entry.lastUpdateInternalResistanceIncrease === undefined || isTimestamp(entry.lastUpdateInternalResistanceIncrease))
  )) return false;

  // The public API's technical properties are numeric; the BMS returns a subset.
  return Object.values(batteryTechnicalProperties).every(
    (property) => typeof property === 'number' && Number.isFinite(property),
  );
}
