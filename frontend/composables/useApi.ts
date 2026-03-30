export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  async function $api<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const token = useCookie('admin_token').value
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(opts.headers as Record<string, string>),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await $fetch<T>(path, {
      baseURL,
      ...opts,
      headers,
    })
    return res
  }

  return { $api }
}
