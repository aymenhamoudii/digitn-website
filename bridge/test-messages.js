require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    const { data, error } = await supabase.from('builder_chat_messages')
        .select('project_id, role, content, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log("Recent messages:", JSON.stringify(data, null, 2));
}

test();
