import React from 'react';
import Layout from '../components/Layout';

export default function Test() {
  return (
    <Layout>
      <div className="py-12">
        <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Test Page
        </h1>
        <p className="text-center mt-4">
          This is a test page with Apple-inspired design
        </p>
      </div>
    </Layout>
  );
}
