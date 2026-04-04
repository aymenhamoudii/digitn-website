# Bridge Debug Scripts

These scripts in the bridge root are manual debug/test utilities, not part of the automated test suite.

- test-client.js — verify router client connection
- test-direct-builder.js — test build flow manually
- test-fetch.js — test Django API fetch
- test-messages.js — inspect builder_chat_messages
- test-parser.js — test message parsing
- test-query.js — inspect persisted builder event data

To run: node bridge/test-client.js (from repo root)
