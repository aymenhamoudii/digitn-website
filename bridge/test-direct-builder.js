require('dotenv').config({ path: '../.env.local' });
const { startDirectBuild } = require('./src/lib/direct-builder');

// We intercept supabase right where it is exported
const { supabase } = require('./src/lib/supabase');
const originalFrom = supabase.from.bind(supabase);

supabase.from = function (table) {
    if (table === 'builder_chat_messages') {
        return {
            insert: async (data) => {
                console.log("\n\n==== INTERCEPTED SUPABASE INSERT ====");
                console.log(JSON.stringify(data, null, 2));
                console.log("======================================\n\n");

                try {
                    const result = await originalFrom(table).insert(data).select();
                    console.log("Real insert result:", JSON.stringify(result, null, 2));
                    return result;
                } catch (e) {
                    console.error("Real insert threw error:", e);
                    return { error: e };
                }
            },
            select: () => originalFrom(table).select()
        };
    }
    return originalFrom(table);
};

const resMock = {
    write: (data) => { }, // silent
    end: () => console.log("SSE end")
};

// Using the same project ID
const projectId = '96ad485c-727e-41f9-8453-b60c04827994';
console.log("Starting test direct build...");
startDirectBuild(projectId, "Test plan", 'pro')
    .then(() => {
        console.log("Finished build manually");
    })
    .catch(e => console.error("Error", e));
