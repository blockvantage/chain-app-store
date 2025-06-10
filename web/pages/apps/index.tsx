import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useConfig } from '../../hooks/useConfig';
import { getApps, App, getBoostedApps } from '../../utils/api';

export default function Apps() {
  const router = useRouter();
  const { config } = useConfig();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get query parameters
  const page = Number(router.query.page) || 1;
  const featured = router.query.featured === 'true';
  const category = router.query.category as string;
  const sort = router.query.sort as string;

  useEffect(() => {
    // Set selected category from URL if present
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        
        let appsData;
        
        // Handle different sorting options
        if (sort === 'boost' && config?.enableModules.boosting) {
          // Get boosted apps
          const response = await getBoostedApps();
          appsData = {
            apps: response.apps,
            pagination: {
              total: response.apps.length,
              page: 1,
              pageSize: response.apps.length,
              pages: 1
            }
          };
        } else {
          // Get regular apps with filters
          appsData = await getApps(
            page, 
            12, 
            featured, 
            selectedCategory || undefined
          );
        }
        
        setApps(appsData.apps);
        setTotalPages(appsData.pagination.pages);
        
        // Extract unique categories from all apps
        const allCategories = new Set<string>();
        appsData.apps.forEach(app => {
          app.tags.forEach(tag => allCategories.add(tag));
        });
        
        setCategories(Array.from(allCategories));
      } catch (err) {
        console.error('Error fetching apps:', err);
        setError('Failed to load apps. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [page, featured, selectedCategory, sort, config]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    
    // Update URL with the new category
    const query: any = { ...router.query };
    if (category) {
      query.category = category;
    } else {
      delete query.category;
    }
    
    // Reset to page 1 when changing filters
    delete query.page;
    
    router.push({
      pathname: router.pathname,
      query
    });
  };

  const handlePageChange = (newPage: number) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage }
    });
  };

  return (
    <>
      <Head>
        <title>Apps | {config?.chainName || 'Chain App Hub'}</title>
        <meta name="description" content={`Browse apps on ${config?.chainName || 'blockchain'}`} />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {featured ? 'Featured Apps' : 
             selectedCategory ? `${selectedCategory} Apps` : 
             sort === 'boost' ? 'Top Boosted Apps' : 
             'All Apps'}
          </h1>
          
          <div className="flex space-x-2">
            <Link 
              href="/apps" 
              className={`px-4 py-2 rounded-md ${!featured && !sort ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
            >
              All
            </Link>
            <Link 
              href="/apps?featured=true" 
              className={`px-4 py-2 rounded-md ${featured ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
            >
              Featured
            </Link>
            {config?.enableModules.boosting && (
              <Link 
                href="/apps?sort=boost" 
                className={`px-4 py-2 rounded-md ${sort === 'boost' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
              >
                Boosted
              </Link>
            )}
          </div>
        </div>

        {/* Categories filter */}
        <div className="flex flex-wrap gap-2 py-4">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === null ? 'bg-primary-600 text-white' : 'bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Apps grid */}
        {loading ? (
          <div className="text-center py-12">Loading apps...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : apps.length === 0 ? (
          <div className="text-center py-12">No apps found matching your criteria.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apps.map((app) => (
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
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.tags.slice(0, 2).map((tag) => (
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
                  
                  {/* Show badges based on enabled modules */}
                  {(config?.enableModules.reviews || config?.enableModules.boosting) && (
                    <div className="p-4 border-t flex justify-between text-sm text-gray-500">
                      {'boostTotal' in app && config?.enableModules.boosting && (
                        <div>
                          <span className="text-primary-600 font-medium">
                            {(app as any).boostTotal} {config?.primaryToken}
                          </span> boosted
                        </div>
                      )}
                      {app.featured && (
                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          Featured
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-3 py-1 rounded ${
                  page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded ${
                    page === pageNum ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded ${
                  page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}
