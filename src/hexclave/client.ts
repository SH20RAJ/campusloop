import { HexclaveClientApp } from "@hexclave/next";

export const hexclaveClientApp = new HexclaveClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    handler: "/handler",
    signIn: "/join?mode=signin",
    signUp: "/join?mode=signup",
    afterSignIn: "/app",
    afterSignUp: "/app/onboarding",
    afterSignOut: "/join?mode=signin",
    oauthCallback: "/handler/oauth-callback",
    default: {
      type: "hosted",
    },
  },
});
