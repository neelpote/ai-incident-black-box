import { NextResponse } from "next/server";

import { retrieveCapsule } from "@/lib/storage/server";
import type { IncidentCapsule, StorageReceipt } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      capsule: IncidentCapsule;
      receipt: StorageReceipt;
    };
    const retrieval = await retrieveCapsule(body.capsule, body.receipt);

    return NextResponse.json({ retrieval });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve incident capsule.",
      },
      { status: 500 },
    );
  }
}
