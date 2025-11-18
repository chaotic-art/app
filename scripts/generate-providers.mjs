#!/usr/bin/env node

import { writeFile } from 'node:fs/promises'
import process from 'node:process'
import { prodParasKusamaCommon, prodParasPolkadotCommon, prodRelayKusama, prodRelayPolkadot, testParasPaseoCommon } from '@polkadot/apps-config'

// Extract chain configurations
const ahp = prodParasPolkadotCommon.find(key => key.info === 'PolkadotAssetHub')
const ahk = prodParasKusamaCommon.find(key => key.info === 'KusamaAssetHub')
const ahpas = testParasPaseoCommon.find(key => key.info === 'PaseoAssetHub')

// Extract providers
// For AHP and AHK, filter by provider key (name) that contains "ibp" or "parity" (lowercase)
function extractProviders(providersObj) {
  if (!providersObj)
    return []
  return Object.entries(providersObj)
    .filter(([key]) => {
      const lowerKey = key.toLowerCase()
      return lowerKey.includes('ibp') || lowerKey.includes('parity')
    })
    .map(([, value]) => value)
    .filter(provider => !provider.startsWith('light://'))
}

const ahpProviders = extractProviders(ahp?.providers)
const ahkProviders = extractProviders(ahk?.providers)
const dotProviders = Object.values(prodRelayPolkadot?.providers || {})
const ksmProviders = Object.values(prodRelayKusama?.providers || {})
const ahpasProviders = Object.values(ahpas?.providers || {})

// Filter out light client providers as they may not work in all environments
function filterProviders(providers) {
  return providers.filter(provider => !provider.startsWith('light://'))
}

// Generate TypeScript content
function generateProvidersTs() {
  const formatProviders = (providers, indent = '    ') => {
    return providers
      .map(provider => `${indent}'${provider}',`)
      .join('\n')
  }

  return `/**
 * Network providers configuration
 * Generated from @polkadot/apps-config endpoints
 * 
 * This file is auto-generated. Do not edit manually.
 * Run 'node scripts/generate-providers.mjs' to regenerate.
 */

export const PROVIDERS = {
  // Polkadot Asset Hub (AHP)
  ahp: [
${formatProviders(ahpProviders)}
  ] as const,

  // Kusama Asset Hub (AHK)
  ahk: [
${formatProviders(ahkProviders)}
  ] as const,

  // Polkadot Relay Chain (DOT)
  dot: [
${formatProviders(filterProviders(dotProviders))}
  ] as const,

  // Kusama Relay Chain (KSM)
  ksm: [
${formatProviders(filterProviders(ksmProviders))}
  ] as const,

  // Paseo Asset Hub (AHPAS) - Testnet
  ahpas: [
${formatProviders(filterProviders(ahpasProviders))}
  ] as const,
} as const

export type ProviderChain = keyof typeof PROVIDERS
export type ProvidersConfig = typeof PROVIDERS
`
}

// Write the generated file
const outputPath = './app/config/providers.ts'
const content = generateProvidersTs()

try {
  await writeFile(outputPath, content, 'utf8')
  console.log('✅ Successfully generated providers configuration at:', outputPath)
  console.log('📊 Provider counts:')
  console.log(`   - AHP (Polkadot Asset Hub): ${ahpProviders.length} providers`)
  console.log(`   - AHK (Kusama Asset Hub): ${ahkProviders.length} providers`)
  console.log(`   - DOT (Polkadot): ${filterProviders(dotProviders).length} providers`)
  console.log(`   - KSM (Kusama): ${filterProviders(ksmProviders).length} providers`)
  console.log(`   - AHPAS (Paseo Asset Hub): ${filterProviders(ahpasProviders).length} providers`)
}
catch (error) {
  console.error('❌ Error generating providers configuration:', error)
  process.exit(1)
}
