/**
 * Generates a VAPID keypair for Web Push.
 *
 *   bun run scripts/generate-vapid-keys.ts
 *
 * Prints the values to paste into .env.local and to set as Cloudflare
 * secrets. Keys are never written to disk by this script — the private key
 * must not end up in the repo.
 */
function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function main() {
  const keyPair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ]);

  const publicKey = toBase64Url(await crypto.subtle.exportKey("raw", keyPair.publicKey));
  const jwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  if (!jwk.d) throw new Error("Private key export missing 'd'");

  console.log("\nAdd to .env.local:\n");
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`);
  console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${jwk.d}`);
  console.log(`VAPID_SUBJECT=mailto:hello@campusloop.space`);

  console.log("\nThen set them for production:\n");
  console.log("  bunx wrangler secret put VAPID_PRIVATE_KEY");
  console.log("  bunx wrangler secret put VAPID_PUBLIC_KEY");
  console.log("  bunx wrangler secret put VAPID_SUBJECT");
  console.log(
    "\nNEXT_PUBLIC_VAPID_PUBLIC_KEY is inlined at build time, so it also has to be present in the build environment.\n",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
