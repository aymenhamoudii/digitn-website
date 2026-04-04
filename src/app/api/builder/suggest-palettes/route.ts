import { NextResponse } from "next/server";
import { getProject, getUserTier } from "@/lib/api/server";

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    // 1. Fetch project to get topic/questionnaire
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const tier = await getUserTier(project.user);

    // 2. Call Bridge
    const bridgeUrl = process.env.BRIDGE_URL || "http://localhost:3001";
    const bridgeSecret = process.env.BRIDGE_SECRET || "";

    const bridgeRes = await fetch(`${bridgeUrl}/builder/suggest-palettes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bridgeSecret}`
      },
      body: JSON.stringify({
        topic: project.description || project.source_text || project.name || "Presentation",
        questionnaire_answers: project.questionnaire_answers || {},
        tier: tier || "free"
      })
    });

    if (!bridgeRes.ok) {
      throw new Error(`Bridge returned ${bridgeRes.status}`);
    }

    const data = await bridgeRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Suggest palettes error:", error);
    return NextResponse.json(
      { error: "Failed to generate palette suggestions" },
      { status: 500 }
    );
  }
}
