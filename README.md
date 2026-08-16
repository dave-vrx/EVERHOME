# EVERHOME

EVERHOME is a mobile-first social world platform prototype: discover worlds, join as a guest, chat with speech bubbles, customize avatars, build experiences, and browse a creator marketplace.

## Included

- Responsive desktop and mobile portal
- Password-free guest identity
- Searchable world discovery
- Join flow with working chat and speech bubbles
- Avatar, creator, discovery, and marketplace surfaces
- Keyboard and touch-friendly interactions

## Realtime architecture

GitHub Pages hosts the public client. Shared player positions, space membership, chat, inventory, trades, balances, world saves, and progress should go to MantleDB through its hosted HTTPS/realtime endpoint. Administrative keys must stay on a separate server; the browser should receive only a public client key and scoped guest token.

Suggested collections: `players`, `spaces`, `presence`, `chat`, `worlds`, `assets`, `inventory`, `trades`, `wallets`, `events`, and `progress`.

Production MantleDB wiring needs the endpoint and public client credentials from the existing FISH project.
