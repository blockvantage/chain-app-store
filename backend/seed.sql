-- Clear existing data
DELETE FROM boosts;
DELETE FROM app_images;
DELETE FROM apps;

-- Reset auto-increment
DELETE FROM sqlite_sequence WHERE name='apps';
DELETE FROM sqlite_sequence WHERE name='app_images';
DELETE FROM sqlite_sequence WHERE name='boosts';

-- Insert apps
INSERT INTO apps (id, name, description, logo_path, featured, hidden, developer_address, website_url, repo_url, twitter_url, discord_url, telegram_url, medium_url, github_url, tags, contract_addresses, created_at, updated_at) VALUES
(1, 'Uniswap', 'Uniswap is the largest decentralized exchange (DEX) on Ethereum and multiple Layer-2 networks.\nLaunched in 2018 by Hayden Adams, it pioneered the Automated Market Maker (AMM) model—smart-contract liquidity pools that let anyone swap ERC-20 tokens directly from a self-custody wallet, without order books, accounts or KYC. The protocol is open-source, permissionless (any token can be listed), and secured by Ethereum.', 'logos/1749669059042842895_uniswap-uni-logo.png', 1, 0, '0x1234567890123456789012345678901234567890', 'https://app.uniswap.com', 'https://github.com/Uniswap/v3-core', 'https://x.com/uniswap/', 'https://discord.com/invite/uniswap', NULL, NULL, 'https://github.com/Uniswap/', '["DeFi"]', '["0x1F98415757620B543A52E61c46B32eB19261F984","0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"]', datetime('now'), datetime('now')),

(2, 'Aave', 'Aave is a decentralized lending protocol where users can lend and borrow cryptocurrencies. Lenders earn interest by depositing digital assets into liquidity pools. Borrowers can then use their crypto as collateral to take out flash loans using these pools.', 'logos/1749669059042842895_uniswap-uni-logo.png', 1, 0, '0x1234567890123456789012345678901234567891', 'https://app.aave.com', 'https://github.com/aave/aave-v3-core', 'https://x.com/aave/', 'https://discord.com/invite/aave', 'https://t.me/Aave_Official', NULL, 'https://github.com/aave/', '["DeFi","Lending"]', '["0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"]', datetime('now'), datetime('now')),

(3, 'Lens Protocol', 'Lens Protocol is a Web3 social graph on Polygon. It provides a composable and decentralized social media framework where users own their content and connections.', 'logos/1749669059042842895_uniswap-uni-logo.png', 1, 0, '0x1234567890123456789012345678901234567892', 'https://lens.xyz', 'https://github.com/lens-protocol', 'https://x.com/LensProtocol', 'https://discord.com/invite/lensprotocol', NULL, NULL, 'https://github.com/lens-protocol/', '["Social","Web3"]', '["0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"]', datetime('now'), datetime('now')),

(4, 'Chainlink', 'Chainlink is a decentralized oracle network that enables smart contracts to securely access off-chain data feeds, web APIs, and traditional bank payments.', 'logos/1749669059042842895_uniswap-uni-logo.png', 0, 0, '0x1234567890123456789012345678901234567893', 'https://chain.link', 'https://github.com/smartcontractkit/chainlink', 'https://x.com/chainlink', 'https://discord.com/invite/chainlink', 'https://t.me/chainlink', NULL, 'https://github.com/smartcontractkit/', '["Oracle","Infrastructure"]', '["0x514910771AF9Ca656af840dff83E8264EcF986CA"]', datetime('now'), datetime('now')),

(5, 'OpenSea', 'OpenSea is the world''s first and largest NFT marketplace. Trade digital collectibles, gaming items, art, and other blockchain-based assets.', 'logos/1749669059042842895_uniswap-uni-logo.png', 0, 0, '0x1234567890123456789012345678901234567894', 'https://opensea.io', 'https://github.com/ProjectOpenSea', 'https://x.com/opensea', 'https://discord.com/invite/opensea', NULL, NULL, 'https://github.com/ProjectOpenSea/', '["NFT","Marketplace"]', '["0x00000000006c3852cbEf3e08E8dF289169EdE581"]', datetime('now'), datetime('now')),

(6, 'dYdX', 'dYdX is a decentralized exchange for cryptocurrency margin trading, derivatives, and perpetual contracts.', 'logos/1749669059042842895_uniswap-uni-logo.png', 1, 0, '0x1234567890123456789012345678901234567895', 'https://dydx.exchange', 'https://github.com/dydxprotocol', 'https://x.com/dydx', 'https://discord.com/invite/dydx', 'https://t.me/dydx_official', NULL, 'https://github.com/dydxprotocol/', '["DeFi","Trading"]', '["0x92D6C1e31e14520e676a687F0a93788B716BEff5"]', datetime('now'), datetime('now')),

(7, 'Compound', 'Compound is an algorithmic, autonomous interest rate protocol for lending and borrowing crypto assets without intermediaries.', 'logos/1749669059042842895_uniswap-uni-logo.png', 0, 0, '0x1234567890123456789012345678901234567896', 'https://compound.finance', 'https://github.com/compound-finance/compound-protocol', 'https://x.com/compoundfinance', 'https://discord.com/invite/compound', NULL, NULL, 'https://github.com/compound-finance/', '["DeFi","Lending"]', '["0xc00e94Cb662C3520282E6f5717214004A7f26888"]', datetime('now'), datetime('now')),

(8, 'Curve Finance', 'Curve is a decentralized exchange optimized for low slippage swaps between stablecoins and similar assets that peg to the same value.', 'logos/1749669059042842895_uniswap-uni-logo.png', 1, 0, '0x1234567890123456789012345678901234567897', 'https://curve.fi', 'https://github.com/curvefi', 'https://x.com/curvefinance', 'https://discord.com/invite/curve', 'https://t.me/curvefi', NULL, 'https://github.com/curvefi/', '["DeFi","Stablecoins"]', '["0xD533a949740bb3306d119CC777fa900bA034cd52"]', datetime('now'), datetime('now')),

(9, 'ENS', 'Ethereum Name Service provides human-readable names for Ethereum addresses and decentralized websites.', 'logos/1749669059042842895_uniswap-uni-logo.png', 0, 0, '0x1234567890123456789012345678901234567898', 'https://ens.domains', 'https://github.com/ensdomains', 'https://x.com/ensdomains', 'https://discord.com/invite/ens', NULL, NULL, 'https://github.com/ensdomains/', '["Infrastructure","Web3"]', '["0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72"]', datetime('now'), datetime('now')),

(10, 'Maker', 'MakerDAO enables the generation of Dai, a decentralized stablecoin soft-pegged to the US Dollar, using crypto assets as collateral.', 'logos/1749669059042842895_uniswap-uni-logo.png', 1, 0, '0x1234567890123456789012345678901234567899', 'https://makerdao.com', 'https://github.com/makerdao', 'https://x.com/makerdao', 'https://discord.com/invite/makerdao', NULL, NULL, 'https://github.com/makerdao/', '["DeFi","Stablecoins"]', '["0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2"]', datetime('now'), datetime('now')),

(11, 'Optimism', 'Optimism is a Layer 2 scaling solution for Ethereum that uses optimistic rollups to achieve lower fees and faster transactions.', 'logos/1749669059042842895_uniswap-uni-logo.png', 1, 0, '0x1234567890123456789012345678901234567900', 'https://optimism.io', 'https://github.com/ethereum-optimism', 'https://x.com/optimismFND', 'https://discord.com/invite/optimism', NULL, NULL, 'https://github.com/ethereum-optimism/', '["Infrastructure","Scaling"]', '["0x4200000000000000000000000000000000000042"]', datetime('now'), datetime('now')),

(12, 'Arbitrum', 'Arbitrum is a Layer 2 scaling solution for Ethereum that uses optimistic rollups to enable high-throughput, low-cost smart contracts.', 'logos/1749669059042842895_uniswap-uni-logo.png', 0, 0, '0x1234567890123456789012345678901234567901', 'https://arbitrum.io', 'https://github.com/OffchainLabs/arbitrum', 'https://x.com/arbitrum', 'https://discord.com/invite/arbitrum', NULL, NULL, 'https://github.com/OffchainLabs/', '["Infrastructure","Scaling"]', '["0x912CE59144191C1204E64559FE8253a0e49E6548"]', datetime('now'), datetime('now')),

(13, 'Polygon', 'Polygon is a protocol and framework for building and connecting Ethereum-compatible blockchain networks.', 'logos/1749669059042842895_uniswap-uni-logo.png', 1, 0, '0x1234567890123456789012345678901234567902', 'https://polygon.technology', 'https://github.com/maticnetwork', 'https://x.com/0xPolygon', 'https://discord.com/invite/polygon', 'https://t.me/polygonofficial', NULL, 'https://github.com/maticnetwork/', '["Infrastructure","Scaling"]', '["0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"]', datetime('now'), datetime('now')),

(14, 'Gnosis Safe', 'Gnosis Safe is the most trusted platform to manage digital assets on Ethereum, offering multi-signature security and advanced access controls.', 'logos/1749669059042842895_uniswap-uni-logo.png', 0, 0, '0x1234567890123456789012345678901234567903', 'https://safe.global', 'https://github.com/safe-global', 'https://x.com/safe', 'https://discord.com/invite/safe', NULL, NULL, 'https://github.com/safe-global/', '["Infrastructure","Security"]', '["0x3e5c63644e683549055b9be8653de26e0b4cd36e"]', datetime('now'), datetime('now')),

(15, 'Lido', 'Lido is a liquid staking solution for Ethereum, allowing users to stake their ETH while maintaining liquidity through stETH tokens.', 'logos/1749669059042842895_uniswap-uni-logo.png', 0, 0, '0x1234567890123456789012345678901234567904', 'https://lido.fi', 'https://github.com/lidofinance', 'https://x.com/lidofinance', 'https://discord.com/invite/lido', 'https://t.me/lidofinance', NULL, 'https://github.com/lidofinance/', '["DeFi","Staking"]', '["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32"]', datetime('now'), datetime('now'));

-- Insert mockup images for each app
INSERT INTO app_images (app_id, filename, image_path, description, "order", created_at, updated_at) VALUES
(1, 'uniswap-mockup-1.png', 'mockups/1749663103848762083_Screenshot 2025-06-11 at 1.33.10 AM.png', 'Uniswap trading interface', 1, datetime('now'), datetime('now')),
(1, 'uniswap-mockup-2.png', 'mockups/1749663103848762083_Screenshot 2025-06-11 at 1.33.10 AM.png', 'Liquidity pools overview', 2, datetime('now'), datetime('now')),
(2, 'aave-mockup-1.png', 'mockups/1749663103848762083_Screenshot 2025-06-11 at 1.33.10 AM.png', 'Lending dashboard', 1, datetime('now'), datetime('now')),
(3, 'lens-mockup-1.png', 'mockups/1749663103848762083_Screenshot 2025-06-11 at 1.33.10 AM.png', 'Social feed', 1, datetime('now'), datetime('now'));

-- Insert boosts (for apps that should be boosted)
INSERT INTO boosts (app_id, user_address, amount, token_symbol, tx_hash, expires_at, created_at, updated_at) VALUES
(1, '0x1234567890123456789012345678901234567890', '1.5', 'ETH', '0x123...', datetime('now', '+30 days'), datetime('now'), datetime('now')),
(2, '0x1234567890123456789012345678901234567891', '2.0', 'ETH', '0x456...', datetime('now', '+30 days'), datetime('now'), datetime('now')),
(8, '0x1234567890123456789012345678901234567892', '1.0', 'ETH', '0x789...', datetime('now', '+30 days'), datetime('now'), datetime('now')),
(13, '0x1234567890123456789012345678901234567893', '3.0', 'ETH', '0xabc...', datetime('now', '+30 days'), datetime('now'), datetime('now'));
