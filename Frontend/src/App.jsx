import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Filter, TrendingUp, Globe, BarChart3 } from "lucide-react";
import "./index.css"; // <-- ensure shimmer CSS below is added there

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [likelihoodChartData, setLikelihoodChartData] = useState([]);
  const [relevanceChartData, setRelevanceChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const [filters, setFilters] = useState({
    end_year: "",
    topic: "",
    sector: "",
    region: "",
    pest: "",
    source: "",
    swot: "",
    country: "",
    city: "",
  });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://viz-dashboard-kqzs.onrender.com/api/data");
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debounced Filtering
  useEffect(() => {
    if (!data.length) return;

    const handler = setTimeout(() => {
      setFiltering(true);

      const filtered = data.filter((item) =>
        Object.entries(filters).every(([key, value]) => {
          const fieldValue = item[key];
          const normalized = fieldValue && fieldValue !== "N/A" ? fieldValue : "Unknown";
          return value === "" || normalized === value;
        })
      );
      setFilteredData(filtered);

      const groupBy = (arr, keyField, valueField) =>
        Object.entries(
          arr.reduce((acc, curr) => {
            const key = curr[keyField] && curr[keyField] !== "N/A" ? curr[keyField] : "Unknown";
            acc[key] = (acc[key] || 0) + (curr[valueField] || 0);
            return acc;
          }, {})
        ).map(([key, value]) => ({ [keyField]: key, [valueField]: value }));

      setChartData(groupBy(filtered, "region", "intensity"));
      setLikelihoodChartData(groupBy(filtered, "country", "likelihood"));
      setRelevanceChartData(groupBy(filtered, "topic", "relevance"));
      setFiltering(false);
    }, 400);

    return () => clearTimeout(handler);
  }, [filters, data]);

  const stats = [
    { label: "Total Records", value: filteredData.length, icon: BarChart3, color: "bg-blue-500" },
    { label: "Regions", value: new Set(filteredData.map((d) => d.region)).size, icon: Globe, color: "bg-green-500" },
    { label: "Topics", value: new Set(filteredData.map((d) => d.topic)).size, icon: TrendingUp, color: "bg-purple-500" },
  ];

  const filterOptions = useMemo(() => {
    const opts = {};
    for (const field in filters) {
      opts[field] = [...new Set(data.map((d) => d[field] && d[field] !== "N/A" ? d[field] : "Unknown"))].sort();
    }
    return opts;
  }, [data]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () =>
    setFilters({
      end_year: "",
      topic: "",
      sector: "",
      region: "",
      pest: "",
      source: "",
      swot: "",
      country: "",
      city: "",
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">Data Visualization Dashboard</h1>
          <p className="text-blue-100">Comprehensive analytics and insights</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md p-6 animate-shimmer"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                    </div>
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
          <div
            className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex justify-between cursor-pointer"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
            </div>
            <div className="flex items-center gap-2">
              {Object.values(filters).some((v) => v !== "") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              )}
              <span className="text-slate-500">{showFilters ? "▼" : "▶"}</span>
            </div>
          </div>

          {showFilters && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.keys(filters).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {field.replace("_", " ")}
                  </label>
                  <select
                    name={field}
                    value={filters[field]}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All</option>
                    {filterOptions[field].map((val, i) => (
                      <option key={i} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charts */}
        {(loading || filtering) ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {Array(2)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md p-6 animate-shimmer"
                >
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-[300px] bg-gray-100 rounded"></div>
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[{
              title: "Intensity by Region",
              data: chartData,
              dataKey: "region",
              barKey: "intensity",
              color: "#6366f1",
            }, {
              title: "Likelihood by Country",
              data: likelihoodChartData,
              dataKey: "country",
              barKey: "likelihood",
              color: "#10b981",
            }].map((chart, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md hover:shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{chart.title}</h3>
                {chart.data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chart.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey={chart.dataKey} tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey={chart.barKey} fill={chart.color} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
