import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialValue = "",
  placeholder = "Search products...",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Update search term if initialValue prop changes (e.g. when filters are cleared)
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  // Auto-search after a small delay when typing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm !== initialValue) {
        onSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, onSearch, initialValue]);

  return (
    <form
      className={`relative w-full md:w-80 ${className}`}
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder={placeholder}
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <FaSearch className="text-gray-400" />
      </div>
    </form>
  );
};

export default SearchBar;
