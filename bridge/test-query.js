require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    console.log("Testing supabase builder_chat_messages...");

    // Get a valid project ID
    const { data: project } = await supabase.from('projects').select('id').limit(1).single();
    if (!project) {
        console.log('No project found');
        return;
    }
    const projectId = project.id;
    console.log("Using project ID:", projectId);

    const { data, error } = await supabase.from('builder_chat_messages').insert([
        { project_id: projectId, role: 'assistant', content: 'test message' }
    ]).select();

    if (error) {
        console.error("INSERT ERROR:", error);
    } else {
        console.log("INSERT SUCCESS:", data);
    }
}

test();
