<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

let redirected = false
const REDIRECT_URL = '/twitter-auth'

onMounted(() => {
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session && !redirected) {
      redirected = true
      router.push(REDIRECT_URL)
    }
  })

  // Also check current session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session && !redirected) {
      redirected = true
      router.push(REDIRECT_URL)
    }
  })
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-4">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p class="text-lg">
        Completing sign in...
      </p>
    </div>
  </div>
</template>
