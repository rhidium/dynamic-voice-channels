# Rhidium/dynamic-voice-channels

A powerful Discord bot for on-demand voice channel creation, built with the [Rhidium framework](https://github.com/rhidium/rhidium). This bot allows users to create temporary voice channels automatically by joining a configured trigger channel, with full permission controls and customization options.

## Why?

Because pay-walling basic voice-channel creation behind subscriptions is exploitative and unnecessary. This bot keeps that core feature free and in your control.

### **Offenders:**

- [GreedMaster (originally VoiceMaster)](https://voicemaster.xyz/) (£39.99-£199.99 !!!! per year)
- [TempVoice](https://tempvoice.xyz/premium) (4-6 EUR/month, **recommended** if you cannot host yourself)
- [Tempy](https://tempybot.me/) (2,99$/month PER USER)
- [EmptyManager](https://www.patreon.com/Nexgan/membership) (3.50-10 EUR/month)
- [Auto Voice Channels](https://wiki.dotsbots.com/en/gold-patrons) (3-13.50 EUR/month)

> Why pay for a service when you can just host it yourself? If you feel like something is missing from this free, open-source, alternative - [create a feature request](https://github.com/rhidium/dynamic-voice-channels/issues).

Hosting voice-channel bots *is* expensive — but **only if the bot itself is in the channel consuming bandwidth**. Since this bot purely manages permissions and channel creation, hosting costs are negligible. There's no reasonable justification for charging up to £200+ per year for that functionality.

## Features

- 🎤 **Click-to-Create Voice Channels** - Users join a trigger channel and automatically get their own private voice channel
- 🔧 **Highly Configurable** - Fine-grained control over channel names, permissions, user limits, position, etc.
- 🎯 **YAML-Based Configuration** - Easy-to-read configuration with reusable permission templates
- 🗄️ **PostgreSQL Database** - Persistent tracking of dynamic channels via Prisma ORM
- 🐳 **Docker Ready** - Production-ready Docker Compose setup with health checks
- 🌍 **Multi-Language Support** - Built-in localization system (English & Dutch included)
- 🔒 **Role-Based Permissions** - Granular control over who can use which features
- 🧹 **Auto-Cleanup** - Dynamic channels are automatically deleted when empty + reconciliation on boot/restart

## Quick Start

### Prerequisites

- Node.js 20+ (or Docker)
- PostgreSQL 15+ (or use Docker Compose)
- pnpm 10.4.1+
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. **Clone the repository with submodules:**

```bash
git clone --recurse-submodules https://github.com/rhidium/dynamic-voice-channels.git
cd dynamic-voice-channels
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Configure the bot:**

```bash
# Copy and edit the config files
cp config/config.example.json config/config.json
nano config/config.json
nano click-to-create.yaml
```

5. **Set up the database:**

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate
```

6. **Build and start:**

```bash
# Development mode (with watch)
pnpm dev

# Production build
pnpm build
pnpm start
```

### Docker Deployment

For production deployment with Docker:

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f client

# Stop services
docker compose down
```

## Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
NODE_ENV=production                    # Environment: production or development
RHIDIUM_CONFIG_DIR=./config           # Config directory location
RHIDIUM_LOCALES_DIR=./locales         # Locales directory location

# Database Configuration
POSTGRES_HOST=localhost                # Change to "database" for Docker
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_DB=dynamic-voice-channels
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
```

### Discord Bot Configuration

Edit `config/config.json`:

```json
{
  "client": {
    "id": "YOUR_BOT_CLIENT_ID",
    "token": "YOUR_BOT_TOKEN",
    "development_server_id": "YOUR_DEV_SERVER_ID"
  },
  "permissions": {
    "owner_id": "YOUR_DISCORD_USER_ID",
    "system_administrator_ids": [],
    "developer_ids": []
  }
}
```

### Click-to-Create Channels

Configure trigger channels in `config/click-to-create.yaml`:

```yaml
- channelId: "1234567890123456789"    # Voice channel to join
  categoryId: "9876543210987654321"   # Category where channels are created
  maxChannels: 10                     # Max concurrent channels from this trigger
  channelName: "{creator}'s Channel"  # {creator} is replaced with username
  channelUserLimit: 0                 # 0 = unlimited
  channelBitrate: 64000              # Bitrate in bps
  channelPermissions:
    - roleId: "@everyone"
      allow:
        - ViewChannel
        - Speak
        - Stream
      deny:
        - Connect
    - roleId: "{{creatorId}}"        # Special template for creator
      allow:
        - Connect
        - ManageChannels
        - MoveMembers
      deny: []
```

#### YAML Features

The config supports **YAML anchors** for reusable permission templates:

```yaml
# Define reusable permission sets
- channelId: "123"
  channelPermissions:
    - &creator-perms
      roleId: "{{creatorId}}"
      allow: [Connect, ManageChannels]
      deny: []

# Reuse in another config
- channelId: "456"
  channelPermissions:
    - *creator-perms  # Reuses the same permissions
```

## Monitoring

View logs in real-time:

```bash
# View all logs
docker compose logs -f

# View only client logs
docker compose logs -f client

# View only database logs
docker compose logs -f database
```

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correctly formatted
- For Docker: use `POSTGRES_HOST=database` (service name)
- For local: use `POSTGRES_HOST=localhost`
- Check PostgreSQL is running: `docker compose ps` or `systemctl status postgresql`

### Prisma Client Not Generated

Run `pnpm db:generate` after any schema changes and before starting the bot.

### Migration Conflicts

If migrations are out of sync:
```bash
# Check status
pnpm db:status

# For development (⚠️ destroys data):
pnpm db:reset

# For production, resolve manually:
npx prisma migrate resolve --applied <migration-name>
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For more information on development & contributing, please see the [contribution guidelines](./.github/CONTRIBUTING.md).

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Author

**Richard Hillebrand (Mirasaki)**
- Website: [mirasaki.dev](https://mirasaki.dev/)
- Email: me@mirasaki.dev

## Support

- 📚 [Rhidium Documentation](https://rhidium.xyz/docs)
- 🐛 [Issue Tracker](https://github.com/rhidium/dynamic-voice-channels/issues)
- 💬 [Discord Server](https://discord.gg/rhidium) (if available)

## Acknowledgments

Built with the [Rhidium framework](https://github.com/rhidium/rhidium) - A powerful, modular Discord bot framework.
