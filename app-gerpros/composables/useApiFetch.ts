import { useAuthStore } from '~/stores/auth';

export async function refreshTokens() {
  const auth = useAuthStore();
  const config = useRuntimeConfig();

  try {
    console.log('refreshing tokens');
    const data = await $fetch('/Users/Refresh', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: {
        'Authorization': `${auth.tokenType.value} ${auth.accessToken.value}`,
        'Content-Type': 'application/json',
      },
      body: { refreshToken: auth.refreshToken.value },
    });
    auth.setTokens(data as any);
  }
  catch (e) {
    console.error('Refresh token error:', e);
    auth.clearTokens();
  }
}

export async function useApiFetch<T>(url: string, options: any = {}) {
  const auth = useAuthStore();
  const config = useRuntimeConfig();

  if (auth.isLoggedIn.value && auth.shouldRefresh.value) {
    await refreshTokens();
  }

  if (auth.isLoggedIn.value) {
    options.headers = {
      ...(options.headers || {}),
      Authorization: `${auth.tokenType.value} ${auth.accessToken.value}`,
    };
  }

  return $fetch<T>(url, {
    baseURL: config.public.apiBase,
    ...options,
  });
}
