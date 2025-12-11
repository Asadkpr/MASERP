import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface Option {
  value: string;
  primaryText: string;
  secondaryText: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative mt-1" ref={selectRef}>
      <button
        type="button"
        className="relative w-full cursor-default rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedOption ? (
          <div>
            <span className="block truncate font-medium text-slate-800">{selectedOption.primaryText}</span>
            <span className="block truncate text-xs text-slate-500">{selectedOption.secondaryText}</span>
          </div>
        ) : (
          <span className="text-slate-500">{placeholder}</span>
        )}
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              className="relative cursor-default select-none py-2 pl-3 pr-9 text-slate-900 hover:bg-teal-50"
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={value === option.value}
            >
              <div>
                <span className={`block truncate ${value === option.value ? 'font-semibold' : 'font-normal'}`}>
                  {option.primaryText}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {option.secondaryText}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;