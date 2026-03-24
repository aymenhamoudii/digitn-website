require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    const { data, error } = await supabase.from('builder_chat_messages')
        .select('project_id, role, content, created_at')
        .eq('role', 'assistant')
        .order('created_at', { ascending: false })
        .limit(1);

    if (data && data.length > 0) {
        fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\045d1861-3a5f-46ac-a207-7d52b0200687\\chat_log.json', JSON.stringify(data[0], null, 2));
        console.log('Saved to chat_log.json');
    } else {
        console.log("No messages found");
    }
}

test();
