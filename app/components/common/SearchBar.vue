<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import type { Profile } from '@/services/profile'
import { onClickOutside, useDebounceFn } from '@vueuse/core'
import { isEvmAddress } from 'dedot/utils'
import { exploreCollections, exploreNfts } from '@/graphql/queries/explore'
import { searchProfiles } from '@/services/profile'
import { getss58AddressByPrefix } from '@/utils/account'
import { getDenyList } from '@/utils/prefix'

enum SearchBarTab {
  Collections = 'collections',
  Nfts = 'nfts',
  Users = 'users',
}

const router = useRouter()
const { currentChain } = useChain()

const searchInputRef = ref<HTMLInputElement>()
const searchDropdownRef = ref<HTMLDivElement>()
const searchQuery = ref('')
const showSuggestions = ref(false)
const activeTab = ref<SearchBarTab>(SearchBarTab.Collections)
const isLoading = ref(false)

// Tabs configuration
const tabs = [
  { label: 'Collections', value: SearchBarTab.Collections },
  { label: 'NFTs', value: SearchBarTab.Nfts },
  { label: 'Users', value: SearchBarTab.Users },
]

// Search results
const collections = ref<{
  id: string
  name: string
  image: string
  floor: string
}[]>([])
const nfts = ref<{
  id: string
  name: string
  image: string
  price: string | null
}[]>([])
const users = ref<Profile[]>([])

const debouncedSearch = useDebounceFn(async (query: string) => {
  if (!query.trim()) {
    collections.value = []
    nfts.value = []
    users.value = []
    return
  }

  isLoading.value = true

  try {
    // Search collections using existing GraphQL query
    const { $apolloClient } = useNuxtApp()

    const [collectionsResult, nftsResult, usersResult] = await Promise.all([
      // Search collections
      $apolloClient.query({
        query: exploreCollections,
        variables: {
          first: 10,
          offset: 0,
          search: [{ name_containsInsensitive: query }],
          orderBy: ['blockNumber_DESC'],
          denyList: getDenyList(currentChain.value) || [],
        },
        context: { endpoint: currentChain.value },
      }),

      // Search NFTs
      $apolloClient.query({
        query: exploreNfts,
        variables: {
          first: 10,
          offset: 0,
          name: query,
          orderBy: ['blockNumber_DESC'],
          denyList: getDenyList(currentChain.value) || [],
        },
        context: { endpoint: currentChain.value },
      }),

      searchProfiles(query, 10, 0),
    ])

    // Process collections
    collections.value = collectionsResult.data?.collectionEntities?.map(collection => ({
      id: collection.id,
      name: collection.name || 'Untitled Collection',
      image: sanitizeIpfsUrl(collection.meta?.image || ''),
      floor: collection.floor,
    })) || []

    // Process NFTs
    nfts.value = nftsResult.data?.tokenEntities?.map(nft => ({
      id: nft.id,
      name: nft.name || 'Untitled NFT',
      image: sanitizeIpfsUrl(nft.meta?.image || nft.image || ''),
      price: nft.price,
    })) || []

    // Process users
    users.value = usersResult?.data.filter(user => !isEvmAddress(user.address)).map(user => ({
      ...user,
      address: getss58AddressByPrefix(user.address, currentChain.value as Prefix),
    })) || []
  }
  catch (error) {
    console.error('Search error:', error)
    // Fallback to empty arrays on error
    collections.value = []
    nfts.value = []
    users.value = []
  }
  finally {
    isLoading.value = false
  }
}, 300)

// Watch search query changes
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    debouncedSearch(newQuery)
    showSuggestions.value = true
  }
  else {
    collections.value = []
    nfts.value = []
    users.value = []
    hideSuggestions()
  }
})

function hideSuggestions() {
  showSuggestions.value = false
}

function hideSuggestionsAndGoTo(path: string) {
  hideSuggestions()
  router.push(path)
}

onClickOutside(searchDropdownRef, () => {
  hideSuggestions()
})
</script>

<template>
  <div class="relative">
    <!-- Search Input -->
    <UInput
      ref="searchInputRef"
      v-model="searchQuery"
      placeholder="Search collections, NFTs, users..."
      icon="i-heroicons-magnifying-glass"
      class="w-full rounded-full lg:w-65 lg:focus-within:w-100 overflow-hidden transition-all duration-200 ease-in-out hover:shadow-md focus-within:shadow-lg"
      :class="{
        'lg:w-100': showSuggestions,
      }"
      :ui="{
        base: 'rounded-full',
      }"
      size="lg"
      @focus="showSuggestions = true"
    />

    <!-- Search Suggestions Dropdown -->
    <div
      v-if="showSuggestions && searchQuery"
      ref="searchDropdownRef"
      class="absolute w-full top-full left-0 right-0 mt-3 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <!-- Search Tabs -->
      <div class="flex border-b border-border/20 bg-muted/30">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="flex-1 px-4 py-4 text-sm font-medium transition-all duration-200 ease-in-out relative"
          :class="activeTab === tab.value
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <div
            v-if="activeTab === tab.value"
            class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
          />
        </button>
      </div>

      <!-- Tab Content -->
      <div class="p-6 max-h-96 overflow-y-auto">
        <!-- Collections Tab -->
        <div v-if="activeTab === 'collections'" class="space-y-4">
          <div v-if="isLoading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex items-center gap-4">
              <div class="w-14 h-14 bg-muted rounded-2xl animate-pulse" />
              <div class="flex-1 space-y-3">
                <div class="h-5 bg-muted rounded-xl animate-pulse" />
                <div class="h-4 bg-muted rounded-xl w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
          <div v-else-if="collections.length === 0 && searchQuery" class="text-center text-muted-foreground py-8">
            <UIcon name="i-heroicons-magnifying-glass" class="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p class="text-lg font-medium">
              No collections found
            </p>
            <p class="text-sm">
              Try adjusting your search terms
            </p>
          </div>
          <div v-else-if="collections.length > 0" class="space-y-4">
            <div
              v-for="collection in collections"
              :key="collection.id"
              class="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/60 cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.02] group"
              @click="hideSuggestionsAndGoTo(`/${currentChain}/collection/${collection.id}`)"
            >
              <img
                :src="collection.image || '/placeholder.jpg'"
                :alt="collection.name"
                class="w-14 h-14 rounded-2xl object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200"
              >
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-base truncate group-hover:text-primary transition-colors duration-200">
                  {{ collection.name }}
                </div>
                <div class="text-sm text-muted-foreground truncate mt-1">
                  Floor: <Money v-if="Number(collection.floor)" :value="collection.floor" inline /><span v-else>
                    --
                  </span>
                </div>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200 opacity-0 group-hover:opacity-100" />
            </div>
            <UButton
              variant="ghost"
              size="sm"
              class="w-full mt-6 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200"
              @click="hideSuggestionsAndGoTo(`/${currentChain}/explore/collectibles?search=${encodeURIComponent(searchQuery)}`)"
            >
              View all collections
            </UButton>
          </div>
        </div>

        <!-- NFTs Tab -->
        <div v-if="activeTab === 'nfts'" class="space-y-4">
          <div v-if="isLoading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex items-center gap-4">
              <div class="w-14 h-14 bg-muted rounded-2xl animate-pulse" />
              <div class="flex-1 space-y-3">
                <div class="h-5 bg-muted rounded-xl animate-pulse" />
                <div class="h-4 bg-muted rounded-xl w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
          <div v-else-if="nfts.length === 0 && searchQuery" class="text-center text-muted-foreground py-8">
            <UIcon name="i-heroicons-magnifying-glass" class="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p class="text-lg font-medium">
              No NFTs found
            </p>
            <p class="text-sm">
              Try adjusting your search terms
            </p>
          </div>
          <div v-else-if="nfts.length > 0" class="space-y-4">
            <div
              v-for="nft in nfts"
              :key="nft.id"
              class="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/60 cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.02] group"
              @click="hideSuggestionsAndGoTo(`/${currentChain}/gallery/${nft.id}`)"
            >
              <img
                :src="nft.image"
                :alt="nft.name"
                class="w-14 h-14 rounded-2xl object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200"
              >
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-base truncate group-hover:text-primary transition-colors duration-200">
                  {{ nft.name }}
                </div>
                <div class="text-sm text-muted-foreground truncate mt-1">
                  <span v-if="Number(nft.price)">Price:
                    <Money :value="Number(nft.price)" inline />
                  </span>
                </div>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200 opacity-0 group-hover:opacity-100" />
            </div>
            <UButton
              variant="ghost"
              size="sm"
              class="w-full mt-6 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200"
              @click="hideSuggestionsAndGoTo(`/${currentChain}/explore/nfts?search=${encodeURIComponent(searchQuery)}`)"
            >
              View all NFTs
            </UButton>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-if="activeTab === 'users'" class="space-y-4">
          <div v-if="isLoading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex items-center gap-4">
              <div class="w-14 h-14 bg-muted rounded-full animate-pulse" />
              <div class="flex-1 space-y-3">
                <div class="h-5 bg-muted rounded-xl animate-pulse" />
                <div class="h-4 bg-muted rounded-xl w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
          <div v-else-if="users.length === 0 && searchQuery" class="text-center text-muted-foreground py-8">
            <UIcon name="i-heroicons-user" class="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p class="text-lg font-medium">
              No users found
            </p>
            <p class="text-sm">
              Try adjusting your search terms
            </p>
          </div>
          <div v-else-if="users.length > 0" class="space-y-4">
            <div
              v-for="user in users"
              :key="user.address"
              class="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/60 cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.02] group"
              @click="hideSuggestionsAndGoTo(`/${currentChain}/u/${user.address}`)"
            >
              <div class="w-14 h-14 bg-muted rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                <ProfileAvatar :address="user.address" :size="56" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-base truncate group-hover:text-primary transition-colors duration-200">
                  {{ user.name || 'Unknown User' }}
                </div>
                <div class="text-sm text-muted-foreground truncate mt-1 font-mono">
                  {{ user.address.slice(0, 8) }}...{{ user.address.slice(-6) }}
                </div>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200 opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
