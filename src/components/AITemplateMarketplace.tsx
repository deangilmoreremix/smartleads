import { useState, useEffect } from 'react';
import { Store, Search, Star, TrendingUp, Copy, Filter, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  prompt_text: string;
  category: string;
  industry: string;
  tone: string;
  usage_count: number;
  avg_reply_rate: number;
  avg_open_rate: number;
  rating: number;
  rating_count: number;
}

interface AITemplateMarketplaceProps {
  onUseTemplate: (template: MarketplaceTemplate) => void;
}

export default function AITemplateMarketplace({ onUseTemplate }: AITemplateMarketplaceProps) {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<MarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'usage' | 'reply_rate'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: 'All Goals' },
    { value: 'cold_outreach', label: 'Cold Outreach' },
    { value: 'follow_up', label: 'Follow-Up' },
    { value: 'meeting_request', label: 'Meeting Request' },
    { value: 'value_proposition', label: 'Value Proposition' },
    { value: 're_engagement', label: 'Re-engagement' },
    { value: 'introduction', label: 'Introduction' }
  ];

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'Restaurants', label: 'Restaurants' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Legal Services', label: 'Legal Services' },
    { value: 'Technology', label: 'Technology' },
    { value: 'SaaS', label: 'SaaS' },
    { value: 'E-commerce', label: 'E-commerce' },
    { value: 'Consulting', label: 'Consulting' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterAndSortTemplates();
  }, [templates, searchQuery, selectedCategory, selectedIndustry, sortBy]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_prompt_marketplace')
        .select('*')
        .eq('is_public', true)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error loading templates:', error);
        setTemplates([]);
      } else {
        setTemplates(data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading templates:', error);
      setLoading(false);
    }
  };

  const filterAndSortTemplates = () => {
    let filtered = [...templates];

    if (searchQuery.trim()) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.industry.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(t => t.industry === selectedIndustry);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'usage':
          return b.usage_count - a.usage_count;
        case 'reply_rate':
          return b.avg_reply_rate - a.avg_reply_rate;
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = (template: MarketplaceTemplate) => {
    onUseTemplate(template);
    toast.success('Template loaded successfully');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Store className="w-6 h-6" />
          <h2 className="text-2xl font-bold">AI Template Marketplace</h2>
        </div>
        <p className="text-blue-100">
          Browse proven AI prompts from high-performing campaigns. Filter by industry, goal, and performance metrics.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(selectedCategory !== 'all' || selectedIndustry !== 'all') && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {(selectedCategory !== 'all' ? 1 : 0) + (selectedIndustry !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="rating">Highest Rated</option>
            <option value="usage">Most Used</option>
            <option value="reply_rate">Best Reply Rate</option>
          </select>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Goal
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {industries.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>

            {(selectedCategory !== 'all' || selectedIndustry !== 'all') && (
              <div className="col-span-2">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedIndustry('all');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No templates found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedIndustry('all');
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {template.category.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {template.industry}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full capitalize">
                      {template.tone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">
                      {template.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {template.rating_count} ratings
                  </p>
                </div>

                <div className="text-center">
                  <div className="font-semibold text-gray-900 mb-1">
                    {template.usage_count}
                  </div>
                  <p className="text-xs text-gray-500">times used</p>
                </div>

                <div className="text-center">
                  <div className="font-semibold text-green-600 mb-1">
                    {template.avg_reply_rate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500">reply rate</p>
                </div>

                <div className="text-center">
                  <div className="font-semibold text-blue-600 mb-1">
                    {template.avg_open_rate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500">open rate</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 font-mono">
                  {template.prompt_text.substring(0, 200)}
                  {template.prompt_text.length > 200 && '...'}
                </p>
              </div>

              <button
                onClick={() => handleUseTemplate(template)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Use This Template
              </button>
            </div>
          ))
        )}
      </div>

      {filteredTemplates.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            Showing {filteredTemplates.length} of {templates.length} templates
          </p>
        </div>
      )}
    </div>
  );
}
