// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [view, setView] = useState('farmers'); // 'farmers' | 'firms'
  const [allFarmers, setAllFarmers] = useState([]);
  const [allFirms, setAllFirms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Frontend filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | name-asc | name-desc | email-asc

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:4003/api/admin', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();

        setAllFarmers(Array.isArray(result.farmers) ? result.farmers : []);
        setAllFirms(Array.isArray(result.firms) ? result.firms : []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // fetch only once on mount

  // ────────────────────────────────────────────────
  //  Prepare displayed data (filter + sort)
  // ────────────────────────────────────────────────
  const getFilteredAndSortedRecords = () => {
    let records = view === 'farmers' ? [...allFarmers] : [...allFirms];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();

      records = records.filter((item) => {
        if (view === 'farmers') {
          const name = `${item.FirstName || ''} ${item.LastName || ''}`.toLowerCase();
          const email = (item.email || '').toLowerCase();
          const location = `${item.city || ''} ${item.state || ''}`.toLowerCase();
          return name.includes(q) || email.includes(q) || location.includes(q);
        } else {
          // firms
          const name = (item.CompanyName || '').toLowerCase();
          const person = (item.ContactPerson || '').toLowerCase();
          const email = (item.email || '').toLowerCase();
          const location = `${item.city || ''} ${item.state || ''}`.toLowerCase();
          return (
            name.includes(q) ||
            person.includes(q) ||
            email.includes(q) ||
            location.includes(q)
          );
        }
      });
    }

    // 2. Sorting
    records.sort((a, b) => {
      if (sortBy === 'newest') {
        const da = new Date(a.createdAt || 0);
        const db = new Date(b.createdAt || 0);
        return db - da; // newest first
      }
      if (sortBy === 'name-asc') {
        const na = view === 'farmers'
          ? `${a.FirstName || ''} ${a.LastName || ''}`
          : a.CompanyName || '';
        const nb = view === 'farmers'
          ? `${b.FirstName || ''} ${b.LastName || ''}`
          : b.CompanyName || '';
        return na.localeCompare(nb);
      }
      if (sortBy === 'name-desc') {
        const na = view === 'farmers'
          ? `${a.FirstName || ''} ${a.LastName || ''}`
          : a.CompanyName || '';
        const nb = view === 'farmers'
          ? `${b.FirstName || ''} ${b.LastName || ''}`
          : b.CompanyName || '';
        return nb.localeCompare(na);
      }
      if (sortBy === 'email-asc') {
        return (a.email || '').localeCompare(b.email || '');
      }
      return 0;
    });

    return records;
  };

  const displayedRecords = getFilteredAndSortedRecords();

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* View selector */}
      <div className="mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-5 py-2.5 text-sm font-medium rounded-l-lg border ${
              view === 'farmers'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setView('farmers')}
          >
            Farmers
          </button>
          <button
            type="button"
            className={`px-5 py-2.5 text-sm font-medium rounded-r-lg border ${
              view === 'firms'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setView('firms')}
          >
            Firms / Companies
          </button>
        </div>
      </div>

      {/* Search + Sort controls */}
      <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={
                view === 'farmers'
                  ? "Search by farmer name, email or location..."
                  : "Search by company name, contact person, email or location..."
              }
              className="w-full pl-11 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-56 py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
            <option value="email-asc">Email A → Z</option>
          </select>
        </div>
      </div>

      {/* Count */}
      {!loading && !error && (
        <p className="text-gray-600 mb-5 font-medium">
          {displayedRecords.length} {view === 'farmers' ? 'farmer' : 'firm'}
          {displayedRecords.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Loading / Error / Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading records...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl">
          {error}
        </div>
      ) : displayedRecords.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
          <p className="text-xl text-gray-700 font-medium">No records found</p>
          <p className="mt-3 text-gray-500">
            {searchQuery
              ? 'Try adjusting your search term.'
              : 'No records match the current view.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            {view === 'farmers' ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {displayedRecords.map((farmer) => (
                    <tr key={farmer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {farmer.FirstName} {farmer.LastName}
                      </td>
                      <td className="px-6 py-4">{farmer.email}</td>
                      <td className="px-6 py-4">{farmer.phoneNumber || '—'}</td>
                      <td className="px-6 py-4">
                        {farmer.city || '?'} {farmer.state ? `, ${farmer.state}` : ''}
                      </td>
                    
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Company Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contact Person</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {displayedRecords.map((firm) => (
                    <tr key={firm._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{firm.CompanyName}</td>
                      <td className="px-6 py-4">{firm.ContactPerson}</td>
                      <td className="px-6 py-4">{firm.email}</td>
                      <td className="px-6 py-4">{firm.phoneNumber || '—'}</td>
                      <td className="px-6 py-4">
                        {firm.city || '?'} {firm.state ? `, ${firm.state}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;