// next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      oid?: string; // Add your custom property here
    };
  }
}
