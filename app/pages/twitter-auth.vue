<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(false)

async function signInWithTwitter() {
  loading.value = true

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'twitter',
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  })

  if (error) {
    console.error('Twitter sign in error:', error)
    loading.value = false
  }
}

async function signOut() {
  loading.value = true
  await supabase.auth.signOut()
  loading.value = false
}
</script>

<template>
  <div class="min-h-[50vh] flex items-center justify-center p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-simple-icons-x" class="w-6 h-6" />
          <h1 class="text-2xl font-semibold">
            Sign in with Twitter
          </h1>
        </div>
      </template>

      <div class="space-y-4">
        <template v-if="!user">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Connect your Twitter account to continue
          </p>

          <UButton
            block
            size="lg"
            :loading="loading"
            :disabled="loading"
            @click="signInWithTwitter"
          >
            <template #leading>
              <UIcon name="i-simple-icons-x" class="w-5 h-5" />
            </template>
            {{ loading ? 'Connecting...' : 'Sign in with Twitter' }}
          </UButton>
        </template>

        <template v-else>
          <div class="space-y-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="user.user_metadata.avatar_url"
                  :alt="user.user_metadata.name"
                  size="md"
                />
                <div>
                  <p class="font-medium">
                    {{ user.user_metadata.name }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    @{{ user.user_metadata.user_name }}
                  </p>
                </div>
              </div>
            </div>

            <UButton
              block
              variant="outline"
              :loading="loading"
              @click="signOut"
            >
              Sign out
            </UButton>
          </div>

          <!-- <pre>
            {{ user }}
          </pre> -->
        </template>
      </div>
    </UCard>
  </div>
</template>
