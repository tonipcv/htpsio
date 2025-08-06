import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user ID from the session
    const userId = session.user.id;

    // Find documents shared with this client through DocumentAccess
    const documentAccess = await prisma.documentAccess.findMany({
      where: {
        clientId: userId,
      },
      include: {
        document: true,
      },
    });

    // Extract the documents from the access records
    const documents = documentAccess.map((access) => ({
      id: access.document.id,
      name: access.document.name,
      mimeType: access.document.mimeType,
      size: access.document.size,
      createdAt: access.document.createdAt,
      grantedAt: access.grantedAt,
    }));

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching shared documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared documents" },
      { status: 500 }
    );
  }
}
