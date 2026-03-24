const { getRouterClient } = require('./src/lib/router9');

(async () => {
  try {
    const { client, models } = await getRouterClient('free');
    console.log('Client type:', typeof client);
    console.log('Has chat:', client.chat !== undefined);
    console.log('Chat type:', typeof client.chat);

    if (client.chat) {
      console.log('Has completions:', client.chat.completions !== undefined);
      console.log('Completions type:', typeof client.chat.completions);

      if (client.chat.completions) {
        console.log('Has create:', typeof client.chat.completions.create);
      }
    }

    console.log('\nModels:', models);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
