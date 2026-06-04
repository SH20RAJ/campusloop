import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    handler: "/handler",
    signIn: "/sign-in",
    signUp: "/sign-up",
    afterSignIn: "/app",
    afterSignUp: "/app",
    afterSignOut: "/",
    oauthCallback: "/handler/oauth-callback",
    default: {
      type: "hosted",
    },
  },
});
