import type { VNode } from 'vue'

export function successMessage(message?: string | VNode, description?: string | VNode) {
  const toast = useToast()
  toast.add({ title: message || 'Success', color: 'success', description })
}

export function warningMessage(message?: string) {
  const toast = useToast()
  toast.add({ title: message || 'Warning', color: 'warning' })
}

export function errorMessage(message?: string) {
  const toast = useToast()
  toast.add({ title: message || 'Error', color: 'error' })
}
