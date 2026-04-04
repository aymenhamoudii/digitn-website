import { NextResponse } from "next/server";
import { serverApi } from "@/lib/api/server";

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    // 1. Fetch project to get topic/questionnaire
    const projectRes = await serverApi.get(`/projects/${projectId}/`);
    if (!projectRes.ok) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: projectRes.status });
    }

    const project = await projectRes.json();

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
        topic: project.plan_text || project.name || "Presentation",
        questionnaire_answers: project.questionnaire_answers || {},
        tier: project.tier || "free" // Pass tier if available to use the right models
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
