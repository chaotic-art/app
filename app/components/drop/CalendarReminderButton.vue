<script setup lang="ts">
import type { DropItem } from '@/types'
import { addHours, format } from 'date-fns'

const props = defineProps<{
  drop?: DropItem
}>()

const EVENT_DURATION_HOURS = 3
const dropStartTime = computed(() => props.drop?.dropStartTime)

function getRfc5545FormatDate(date: Date) {
  return format(date, 'yyyyMMdd\'T\'HHmmss')
}

function addGoogleEvent() {
  if (!dropStartTime.value) {
    return
  }

  const queryParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Chaotic Generative Drop: ${props.drop?.collectionName}`,
    dates: `${getRfc5545FormatDate(dropStartTime.value)}/${getRfc5545FormatDate(addHours(dropStartTime.value, EVENT_DURATION_HOURS))}`,
    location: `${window.location.origin}/${props.drop?.chain}/drops/${props.drop?.alias}`,
    recur: 'RRULE:FREQ=WEEKLY;BYDAY=TH',
  })

  const calendarURL = new URL('https://www.google.com/calendar/event')
  calendarURL.search = queryParams.toString()

  window.open(calendarURL.toString(), '_blank')
}
</script>

<template>
  <UButton variant="outline" size="sm" @click="addGoogleEvent">
    <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
    <span>
      Remind Me
    </span>
  </UButton>
</template>
