import { NextResponse } from "next/server";

export async function GET() {
  const content = `User-agent: *
Disallow: /api/`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

// Default export is required for Vercel build
export default GET;
