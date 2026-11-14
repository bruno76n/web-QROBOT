/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

// Secrets are set with `wrangler secret put` and are not in wrangler.jsonc (docs/17 §2).
declare namespace Cloudflare {
  interface Env {
    /** `aud` tag of the Cloudflare Access application. */
    ACCESS_AUD?: string;
    /** Comma-separated list of admin e-mails. */
    ADMIN_EMAILS?: string;
    /** Workers Rate Limiting binding for `/api/click` (docs/13 §4). */
    CLICK_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
    /** Workers Rate Limiting binding for `/api/aprende/buscar` (docs/22 §3). */
    SEARCH_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
    /** Meilisearch host for Aprende; empty or missing means the search uses D1 (docs/22 §3). */
    MEILI_HOST?: string;
    /** Key that can only search the `learn` index. */
    MEILI_SEARCH_KEY?: string;
    /** Key that can rebuild the `learn` index. */
    MEILI_WRITE_KEY?: string;
  }
}
