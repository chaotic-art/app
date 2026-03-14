import { describe, expect, it } from 'vitest'
import {
  listedModeToQueryValue,
  listedQueryValueToMode,
  syncListedModeForSort,
} from './useExploreNftStatusFilter'

describe('useExploreNftStatusFilter helpers', () => {
  it('resolves all mode when listed query is absent and sort does not require listings', () => {
    expect(listedQueryValueToMode('', false)).toBe('all')
  })

  it('resolves listed mode from listed=true query', () => {
    expect(listedQueryValueToMode('true', false)).toBe('listed')
  })

  it('resolves unlisted mode from listed=false query', () => {
    expect(listedQueryValueToMode('false', false)).toBe('unlisted')
  })

  it('forces listed mode when sort requires listings', () => {
    expect(listedQueryValueToMode('false', true)).toBe('listed')
  })

  it('serializes listed modes back into route query values', () => {
    expect(listedModeToQueryValue('all')).toBeUndefined()
    expect(listedModeToQueryValue('listed')).toBe('true')
    expect(listedModeToQueryValue('unlisted')).toBe('false')
  })

  it('forces listed mode when switching into a sort that requires listings', () => {
    expect(syncListedModeForSort('unlisted', false, true)).toBe('listed')
  })

  it('resets back to all when leaving a sort that required listings', () => {
    expect(syncListedModeForSort('listed', true, false)).toBe('all')
  })
})
