export function useStudioDetails(collection: ComputedRef<{ name: string, description: string, image: string, banner: string, owner: string }>) {
  const description = ref(collection.value.description)
  const logoFile = ref<File | null>(null)
  const bannerFile = ref<File | null>(null)
  const royaltyPercentage = ref(5)
  const royaltyRecipient = ref(collection.value.owner)
  const isPublished = ref(true)

  // Team mock data
  const collaborators = ref([
    { address: collection.value.owner, role: 'Owner' },
  ])
  const inviteAddress = ref('')

  const isDirty = computed(() => {
    return description.value !== collection.value.description
      || logoFile.value !== null
      || bannerFile.value !== null
  })

  function save() {
    // Placeholder — would trigger wallet signature for on-chain data
  }

  function addCollaborator() {
    if (inviteAddress.value.trim()) {
      collaborators.value.push({ address: inviteAddress.value.trim(), role: 'Collaborator' })
      inviteAddress.value = ''
    }
  }

  function removeCollaborator(index: number) {
    collaborators.value.splice(index, 1)
  }

  return {
    description,
    logoFile,
    bannerFile,
    royaltyPercentage,
    royaltyRecipient,
    isPublished,
    collaborators,
    inviteAddress,
    isDirty,
    save,
    addCollaborator,
    removeCollaborator,
  }
}
