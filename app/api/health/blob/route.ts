import { NextResponse } from "next/server";
import { getBlobConfig, shouldUseBlobStorage } from "@/lib/uploads/blob-config";

export async function GET() {
  const config = getBlobConfig();
  return NextResponse.json({
    ok: shouldUseBlobStorage(),
    ...config,
  });
}
