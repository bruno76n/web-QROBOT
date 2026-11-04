import { env as cfEnv } from 'cloudflare:workers';

export type AppEnv = 'development' | 'preview' | 'production';

/** Non-secret variables and bindings, read in one place (docs/10 §1). */
export function getEnv() {
  return cfEnv;
}

/** Defaults to `production` (the safe value) when the variable is missing or unknown. */
export function getAppEnv(): AppEnv {
  const value = cfEnv.APP_ENV;
  return value === 'development' || value === 'preview' ? value : 'production';
}
