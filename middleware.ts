export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/api/projects/:path*", "/api/documents/:path*"]
};
