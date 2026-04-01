<template>
  <div class="max-w-md mx-auto px-4 py-20">
    <div class="bg-surface-light border border-surface-border rounded-xl p-8">
      <h1 class="text-2xl font-extrabold text-white text-center mb-8">管理後台</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">帳號</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="請輸入帳號"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">密碼</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="請輸入密碼"
          />
        </div>

        <div v-if="errorMsg" class="bg-accent-failed/10 border border-accent-failed/30 rounded-lg p-3 text-accent-failed text-sm">
          {{ errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary-600 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          登入
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const router = useRouter()
const adminToken = useCookie('admin_token', {
  maxAge: 60 * 60 * 24,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
})

// If already logged in, redirect
if (adminToken.value) {
  router.replace('/admin/dashboard')
}

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await $fetch<{ accessToken: string; transportKey: string }>('/admin/login', {
      baseURL: config.public.apiBase as string,
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    adminToken.value = res.accessToken
    // Store transport key in sessionStorage (not persisted across tabs/sessions)
    if (res.transportKey) {
      sessionStorage.setItem('admin_tk', res.transportKey)
    }
    router.push('/admin/dashboard')
  } catch (err: any) {
    errorMsg.value = err?.data?.message || '登入失敗，請確認帳號密碼。'
  } finally {
    loading.value = false
  }
}

useHead({
  title: '管理員登入 - Airsoft Racing',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>
