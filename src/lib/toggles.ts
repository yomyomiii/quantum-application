import { getItem, setItem } from './storage'

export interface Toggles {
  X1: boolean // Demo Mode
  X2: boolean // Debug Panel
  X3: boolean // Persona Switcher
  X4: boolean // Auto Progress (기본 OFF 필수)
  X5: boolean // Seed Data Reset
  X6: boolean // Performance Mode
  X7: boolean // Read-only Viewer
  X8: boolean // RTL Support
}

const DEFAULTS: Toggles = {
  X1: false,
  X2: false,
  X3: false,
  X4: false,
  X5: false,
  X6: false,
  X7: false,
  X8: false,
}

export function getToggles(): Toggles {
  return getItem<Toggles>('qs:toggles', DEFAULTS)
}

export function setToggle(key: keyof Toggles, value: boolean): void {
  const current = getToggles()
  setItem('qs:toggles', { ...current, [key]: value })
}

export function isEnabled(key: keyof Toggles): boolean {
  return getToggles()[key]
}
