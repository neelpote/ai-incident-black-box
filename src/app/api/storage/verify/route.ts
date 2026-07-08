import { NextResponse } from "next/server";

import { verifyCapsule } from "@/lib/storage/server";
import type { IncidentCapsule, StorageReceipt } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      capsule: IncidentCapsule;
      receipt: StorageReceipt;
    };
    const verification = await verifyCapsule(body.capsule, body.receipt);

    return NextResponse.json({ verification });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify incident capsule.",
      },
      { status: 500 },
    );
  }
}
