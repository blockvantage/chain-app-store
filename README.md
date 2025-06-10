# Chain App Hub

A modular, plugin-based application store for blockchain ecosystems. This platform allows users to discover, review, and boost blockchain applications while providing developers with a streamlined way to showcase their work.

## Features

- **Modular Architecture**: Core functionality with optional plugins
- **Multi-Chain Support**: Configure for any EVM-compatible blockchain
- **Plugin System**: Reviews, Boosting, and Proof of Engagement (POE) modules
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Docker Deployment**: Easy setup with Docker Compose

## Project Structure

```
chain-app-store/
├── backend/             # Go backend API server
│   ├── plugins/         # Plugin modules (reviews, boosting, poe)
│   ├── storage/         # Database models and handlers
│   ├── utils/           # Utility functions
│   └── main.go          # Entry point
├── web/                 # Next.js frontend
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components and API routes
│   ├── public/          # Static assets
│   ├── styles/          # CSS and styling
│   └── utils/           # Frontend utilities
├── init/                # Initialization container
├── config.json.sample   # Sample configuration
└── docker-compose.yml   # Docker Compose configuration
```

## Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local development)
- Go 1.21+ (for local development)

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chain-app-store.git
   cd chain-app-store
   ```

2. Create your configuration file:
   ```bash
   cp config.json.sample config.json
   ```

3. Edit `config.json` to match your blockchain configuration:
   ```json
   {
     "chainName": "YourChain",
     "primaryToken": "TOKEN",
     "rpcUrl": "https://your-rpc-url",
     "explorerUrl": "https://your-explorer-url",
     "logos": {
       "light": "/logos/your-logo-light.svg",
       "dark": "/logos/your-logo-dark.svg"
     },
     "enableModules": {
       "poe": true,
       "boosting": true,
       "reviews": true
     },
     "adminWallets": [
       "0xYourAdminWalletAddress"
     ],
     "listingFee": {
       "amount": "10",
       "token": "TOKEN"
     }
   }
   ```

4. Start the application with Docker Compose:
   ```bash
   docker-compose up --build
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## Configuration Options

| Option | Description |
|--------|-------------|
| `chainName` | Name of the blockchain network |
| `primaryToken` | Main token used for transactions |
| `rpcUrl` | RPC endpoint for blockchain interactions |
| `explorerUrl` | Block explorer URL |
| `logos.light` | Path to light mode logo |
| `logos.dark` | Path to dark mode logo |
| `boostingFeeSplit.platform` | Percentage of boost fees for platform |
| `boostingFeeSplit.deployer` | Percentage of boost fees for app deployer |
| `enableModules.poe` | Enable Proof of Engagement module |
| `enableModules.boosting` | Enable Boosting module |
| `enableModules.reviews` | Enable Reviews module |
| `adminWallets` | List of wallet addresses with admin privileges |
| `listingFee.amount` | Amount required to list an app |
| `listingFee.token` | Token used for listing fee |

## Plugin System

The Chain App Hub uses a modular plugin architecture that allows for easy extension:

### Reviews Plugin

Allows users to:
- Submit reviews for applications
- Rate apps on a 5-star scale
- Moderate reviews (admin only)

### Boosting Plugin

Enables:
- Token-based boosting of applications
- Fee distribution between platform and developers
- Increased visibility for boosted apps

### POE (Proof of Engagement) Plugin

Tracks:
- User engagement with applications
- Leaderboard of most active users
- Contribution metrics for each app

## Development

### Local Backend Development

```bash
cd backend
go mod tidy
go run main.go
```

### Local Frontend Development

```bash
cd web
npm install
npm run dev
```

### Adding a New Plugin

1. Create a new directory in `backend/plugins/your-plugin`
2. Implement the plugin interface (see existing plugins for examples)
3. Register your plugin in `backend/main.go`
4. Add UI components in the frontend as needed
5. Update configuration schema to include your plugin settings

## API Documentation

### Core Endpoints

- `GET /config` - Get application configuration
- `GET /apps` - List all applications
- `GET /apps/:id` - Get application details
- `POST /apps` - Submit a new application

### Plugin Endpoints

#### Reviews
- `GET /reviews/:appId` - Get reviews for an app
- `POST /review` - Submit a new review

#### Boosting
- `GET /boosted` - Get list of boosted apps
- `POST /boost` - Boost an application

#### POE
- `GET /leaderboard` - Get user engagement leaderboard
- `GET /contributions/:appId` - Get contributions for an app
- `POST /engage` - Log user engagement

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
