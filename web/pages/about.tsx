import Head from 'next/head';
import { useConfig } from '../hooks/useConfig';

export default function About() {
  const { config } = useConfig();

  return (
    <>
      <Head>
        <title>About | {config?.chainName || 'Chain App Hub'}</title>
        <meta name="description" content={`About the ${config?.chainName || 'Chain'} App Hub`} />
      </Head>

      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">About {config?.chainName || 'Chain'} App Hub</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A decentralized platform for discovering, using, and supporting applications on the {config?.chainName || 'blockchain'} ecosystem.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300">
            The {config?.chainName || 'Chain'} App Hub aims to create a vibrant ecosystem of decentralized applications 
            by providing a platform where developers can showcase their work and users can discover high-quality apps. 
            We believe in fostering innovation, supporting developers, and empowering users through a transparent and 
            community-driven approach.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-primary-600 mb-2">App Discovery</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Browse and discover applications across various categories, from DeFi and NFTs to gaming and social platforms.
              </p>
            </div>
            
            {config?.enableModules.reviews && (
              <div>
                <h3 className="text-lg font-medium text-primary-600 mb-2">Community Reviews</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Read and write reviews to help others find the best applications and provide valuable feedback to developers.
                </p>
              </div>
            )}
            
            {config?.enableModules.boosting && (
              <div>
                <h3 className="text-lg font-medium text-primary-600 mb-2">App Boosting</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Support your favorite apps by boosting them with {config?.primaryToken || 'tokens'}, increasing their visibility and showing your appreciation.
                </p>
              </div>
            )}
            
            {config?.enableModules.poe && (
              <div>
                <h3 className="text-lg font-medium text-primary-600 mb-2">Proof of Engagement</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Earn points for engaging with apps and participating in the ecosystem, with potential rewards for active users.
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium text-primary-600 mb-2">Developer Support</h3>
              <p className="text-gray-700 dark:text-gray-300">
                A platform for developers to showcase their applications, receive feedback, and build a user base.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-primary-600 mb-2">Transparent Governance</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Community-driven curation and moderation to ensure quality and relevance of listed applications.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-primary-600 mb-2">For Developers</h3>
              <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Create your blockchain application</li>
                <li>Pay a small listing fee ({config?.listingFee?.amount} {config?.listingFee?.token})</li>
                <li>Submit your app with details and contract addresses</li>
                <li>Engage with users and gather feedback</li>
                <li>Update your app based on community input</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-primary-600 mb-2">For Users</h3>
              <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Browse apps by category or search for specific functionality</li>
                <li>Connect your wallet to interact with the platform</li>
                <li>Try out apps that interest you</li>
                {config?.enableModules.reviews && <li>Leave reviews for apps you've used</li>}
                {config?.enableModules.boosting && <li>Boost your favorite apps to support developers</li>}
                {config?.enableModules.poe && <li>Earn points through platform engagement</li>}
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Technical Architecture</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The {config?.chainName || 'Chain'} App Hub is built with a modular, plugin-based architecture that allows for 
            flexible configuration and extension. The core components include:
          </p>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Backend:</strong> Go-based API server with plugin support</li>
            <li><strong>Frontend:</strong> Next.js web application with responsive design</li>
            <li><strong>Database:</strong> SQLite for data persistence</li>
            <li><strong>Authentication:</strong> Wallet-based authentication using signatures</li>
            <li><strong>Deployment:</strong> Docker containers for easy deployment and scaling</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg mb-6">
            Whether you're a developer looking to showcase your work or a user exploring new applications, 
            we welcome you to join the {config?.chainName || 'Chain'} App Hub community.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium">
              Discord
            </a>
            <a href="#" className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium">
              Twitter
            </a>
            <a href="#" className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
