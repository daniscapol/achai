import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge } from '../ui/badge';

const TagInput = ({ 
  value = [], 
  onChange, 
  placeholder = "Type and press Enter",
  suggestions = [],
  maxTags = null
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue && suggestions.length > 0) {
      const filtered = suggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, value]);

  // Add a new tag
  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    
    if (!trimmedTag) return;
    
    // Check if tag already exists
    if (value.includes(trimmedTag)) {
      setInputValue('');
      return;
    }
    
    // Check max tags limit
    if (maxTags && value.length >= maxTags) {
      return;
    }
    
    onChange([...value, trimmedTag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  // Remove a tag
  const removeTag = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag if backspace is pressed with empty input
      removeTag(value.length - 1);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="min-h-[42px] px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Render tags */}
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-purple-600/20 text-purple-400 border-purple-600/50 hover:bg-purple-600/30"
            >
              <span className="mr-1">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:text-purple-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {/* Input field */}
          {(!maxTags || value.length < maxTags) && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : ''}
              className="flex-1 min-w-[120px] bg-transparent outline-none text-gray-200 placeholder-gray-500"
            />
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left text-gray-200 hover:bg-zinc-700 focus:bg-zinc-700 focus:outline-none"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      {maxTags && (
        <p className="mt-1 text-sm text-gray-500">
          {value.length}/{maxTags} tags
        </p>
      )}
    </div>
  );
};

export default TagInput;