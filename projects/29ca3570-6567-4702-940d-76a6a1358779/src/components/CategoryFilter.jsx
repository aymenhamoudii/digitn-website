import { menuCategories } from '../data/menuData';

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      {menuCategories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`relative px-6 py-3 text-sm tracking-wide transition-all duration-300 rounded-sm ${
            activeCategory === category
              ? 'bg-gold-600 text-charcoal-950 font-medium'
              : 'bg-charcoal-800 text-cream-400 hover:bg-charcoal-700 hover:text-cream-100'
          }`}
        >
          {category}
          {activeCategory === category && (
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gold-600 rotate-45" />
          )}
        </button>
      ))}
    </div>
  );
}
