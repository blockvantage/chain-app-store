import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useConfig } from '../hooks/useConfig';
import { getApps, getBoostedApps, App, BoostedApp } from '../utils/api';

export default function Home() {
  const { config, loading: configLoading } = useConfig();
  const [featuredApps, setFeaturedApps] = useState<App[]>([]);
  const [boostedApps, setBoostedApps] = useState<BoostedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured apps
        const featuredResponse = await getApps(1, 6, true);
        setFeaturedApps(featuredResponse.apps);
        
        // Fetch boosted apps if boosting is enabled
        if (config?.enableModules.boosting) {
          const boostedResponse = await getBoostedApps();
          setBoostedApps(boostedResponse.apps.slice(0, 6)); // Get top 6 boosted apps
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load apps. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!configLoading && config) {
      fetchData();
    }
  }, [config, configLoading]);

  return (
    <>
      <Head>
        <title>{config?.chainName || 'Chain App Hub'}</title>
        <meta name="description" content={`Discover the best apps on ${config?.chainName || 'blockchain'}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {config?.chainName || 'Chain'} App Hub
          </h1>
          <p className="mt-6 text-xl max-w-2xl mx-auto">
            Discover, use, and boost the best applications on {config?.chainName || 'blockchain'}.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/apps" className="btn-primary text-lg px-8 py-3">
              Browse Apps
            </Link>
            <Link href="/submit" className="btn-secondary text-lg px-8 py-3 ml-4">
              Submit Your App
            </Link>
          </div>
        </section>

        {/* Featured Apps Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Apps</h2>
            <Link href="/apps?featured=true" className="text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">Loading featured apps...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : featuredApps.length === 0 ? (
            <div className="text-center py-12">No featured apps available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApps.map((app) => (
                <Link key={app.id} href={`/apps/${app.id}`}>
                  <div className="app-card h-full flex flex-col">
                    <div className="p-4 flex items-center">
                      <div className="w-16 h-16 relative mr-4">
                        <Image 
                          src={app.logoUrl || '/placeholder.png'} 
                          alt={app.name} 
                          fill 
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{app.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {app.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t flex-grow">
                      <p className="text-gray-600 line-clamp-2">{app.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Boosted Apps Section - Only show if boosting is enabled */}
        {config?.enableModules.boosting && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Top Boosted Apps</h2>
              <Link href="/apps?sort=boost" className="text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-12">Loading boosted apps...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : boostedApps.length === 0 ? (
              <div className="text-center py-12">No boosted apps available.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {boostedApps.map((app) => (
                  <Link key={app.id} href={`/apps/${app.id}`}>
                    <div className="app-card h-full flex flex-col">
                      <div className="p-4 flex items-center">
                        <div className="w-16 h-16 relative mr-4">
                          <Image 
                            src={app.logoUrl || '/placeholder.png'} 
                            alt={app.name} 
                            fill 
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{app.name}</h3>
                          <div className="mt-1 text-primary-600 font-medium">
                            {app.boostTotal} {config?.primaryToken || 'tokens'} boosted
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border-t flex-grow">
                        <p className="text-gray-600 line-clamp-2">{app.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Categories Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {['DeFi', 'NFT', 'Gaming', 'Social', 'Tools', 'Infrastructure', 'DAO', 'Other'].map((category) => (
              <Link key={category} href={`/apps?category=${category}`}>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
                  <h3 className="font-medium text-lg">{category}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
