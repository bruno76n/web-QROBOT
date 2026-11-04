/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

// Secrets are set with `wrangler secret put` and are not in wrangler.jsonc (docs/17 §2).
declare namespace Cloudflare {
  interface Env {
    /** `aud` tag of the Cloudflare Access application. */
    ACCESS_AUD?: string;
    /** Comma-separated list of admin e-mails. */
    ADMIN_EMAILS?: string;
  }
}
