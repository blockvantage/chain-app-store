import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useConfig } from '../hooks/useConfig';
import { getLeaderboard, LeaderboardEntry } from '../utils/api';

export default function Leaderboard() {
  const { config, loading: configLoading } = useConfig();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard();
        setLeaderboard(data.leaderboard);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!configLoading && config?.enableModules.poe) {
      fetchLeaderboard();
    }
  }, [config, configLoading]);

  // If POE module is not enabled, show a message
  if (!configLoading && !config?.enableModules.poe) {
    return (
      <>
        <Head>
          <title>Leaderboard | {config?.chainName || 'Chain App Hub'}</title>
        </Head>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
          <p className="text-gray-600">
            The Proof of Engagement module is not enabled on this Chain App Hub.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Leaderboard | {config?.chainName || 'Chain App Hub'}</title>
        <meta name="description" content={`Leaderboard for ${config?.chainName || 'Chain App Hub'}`} />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Engagement Leaderboard</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">Loading leaderboard data...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">No engagement data available yet.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Engagement Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.userAddress} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className="font-mono">
                        {entry.userAddress.substring(0, 6)}...{entry.userAddress.substring(38)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className="text-primary-600 font-medium">{entry.total}</span> points
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How to Earn Points</h2>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              Engage with apps on the {config?.chainName || 'Chain'} App Hub to earn points:
            </p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li>Visit and interact with apps</li>
              <li>Submit reviews for apps you've used</li>
              <li>Boost your favorite apps</li>
              <li>Complete on-chain transactions with listed apps</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              Points may be redeemable for rewards in the future. Stay engaged to climb the leaderboard!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
