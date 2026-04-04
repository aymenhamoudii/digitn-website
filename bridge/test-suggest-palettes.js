async function test() {
  try {
    const res = await fetch('http://localhost:3001/builder/suggest-palettes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sec_digitn_89x_bridge_f3q9v2p4k7m1l5'
      },
      body: JSON.stringify({
        topic: "Future of AI",
        questionnaire_answers: { "Tone": "Professional" },
        tier: "pro"
      })
    });
    if (res.status === 404) {
      console.error("FAIL: Endpoint not found");
      process.exit(1);
    }
    const data = await res.json();
    if (!data.palettes || data.palettes.length !== 3) {
      console.error("FAIL: Did not return 3 palettes", data);
      process.exit(1);
    }
    console.log("PASS: Returned 3 palettes", data.palettes[0].name);
  } catch (e) {
    console.error("FAIL: Error", e.message);
    process.exit(1);
  }
}
test();
