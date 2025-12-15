<script setup lang="ts">
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'
import { ChartType } from './types'

interface TraitValue {
  value: string
  count: number
  rarity: number
}

const props = withDefaults(defineProps<Props>(), {
  chartType: ChartType.BAR,
})

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Title,
  Tooltip,
)

interface Props {
  traitType: string
  traits: TraitValue[]
  chartType?: ChartType
}

const { isDarkMode } = useTheme()

function generateRandomColor(index: number): string {
  const hue = (210 + index * 137.508) % 360
  const saturation = 70 + (index % 20)
  const lightness = isDarkMode.value ? 60 + (index % 15) : 50 + (index % 15)
  return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`
}

const chartData = computed(() => {
  const sortedTraits = [...props.traits].sort((a, b) => b.count - a.count)
  const labels = sortedTraits.map(t => t.value)
  const data = sortedTraits.map(t => t.count)
  const backgroundColors = sortedTraits.map((_, i) => generateRandomColor(i))

  return {
    labels,
    datasets: [
      {
        label: 'Count',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(c => c?.replace('0.8', '1') ?? c),
        borderWidth: 1,
      },
    ],
  }
})

const hasManyItems = computed(() => props.traits.length > 15)

const chartOptions = computed(() => {
  const textColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
  const gridColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  if (props.chartType === ChartType.DOUGHNUT) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !hasManyItems.value,
          position: 'right' as const,
          labels: {
            color: textColor,
            font: {
              size: 12,
            },
            padding: 12,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${context.label}: ${value} (${percentage}%)`
            },
          },
        },
      },
    }
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const trait = props.traits.find(t => t.value === context.label)
            return [
              `Count: ${context.parsed.y}`,
              `Rarity: ${trait?.rarity.toFixed(1)}%`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 11,
          },
        },
        grid: {
          color: gridColor,
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          font: {
            size: 11,
          },
        },
        grid: {
          color: gridColor,
        },
      },
    },
  }
})
</script>

<template>
  <div class="w-full h-full min-h-[300px] md:min-h-[400px]">
    <Bar
      v-if="chartType === ChartType.BAR"
      :data="chartData"
      :options="chartOptions"
    />
    <div v-else-if="chartType === ChartType.DOUGHNUT" class="flex flex-col h-full">
      <div class="flex-1">
        <Doughnut
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>
  </div>
</template>
