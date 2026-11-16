export const ADC_MAX = 1023

export function adcToPercent(value: number): number {
  return Math.round((Math.min(Math.max(value, 0), ADC_MAX) / ADC_MAX) * 100)
}
