import React, { useEffect, useState } from 'react';

interface App {
  id: string;
  name: string;
  description: string;
  featured: boolean;
  hidden: boolean;
}

export default function AdminPanel() {
  const [apps, setApps] = useState<App[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await fetch('/api/apps');
        const data = await response.json();
        setApps(data);
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    };

    fetchApps();
  }, []);

  const handleFeatureApp = async (appId: string) => {
    try {
      await fetch('/api/admin/feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appId })
      });
      // Refresh apps list
      const response = await fetch('/api/apps');
      const data = await response.json();
      setApps(data);
    } catch (error) {
      console.error('Error featuring app:', error);
    }
  };

  const handleHideApp = async (appId: string) => {
    try {
      await fetch('/api/admin/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appId })
      });
      // Refresh apps list
      const response = await fetch('/api/apps');
      const data = await response.json();
      setApps(data);
    } catch (error) {
      console.error('Error hiding app:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Apps Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apps.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.name}</div>
                      <div className="text-sm text-gray-500">{app.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {app.featured && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Featured
                          </span>
                        )}
                        {app.hidden && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Hidden
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleFeatureApp(app.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        {app.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => handleHideApp(app.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {app.hidden ? 'Unhide' : 'Hide'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
