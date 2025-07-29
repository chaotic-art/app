export function successMessage(message?: string) {
  const toast = useToast()
  toast.add({ title: message || 'Success' })
}

export function warningMessage(message?: string) {
  const toast = useToast()
  toast.add({ title: message || 'Warning' })
}

export function errorMessage(message?: string) {
  const toast = useToast()
  toast.add({ title: message || 'Error' })
}
