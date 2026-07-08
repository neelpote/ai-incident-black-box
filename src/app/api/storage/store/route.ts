import { NextResponse } from "next/server";

import { storeCapsule } from "@/lib/storage/server";
import type { IncidentCapsule } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const capsule = (await request.json()) as IncidentCapsule;
    const receipt = await storeCapsule(capsule);

    return NextResponse.json({ receipt });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to store incident capsule.",
      },
      { status: 500 },
    );
  }
}
