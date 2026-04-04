import { Leaf, Wheat, Flame } from 'lucide-react';

export default function MenuItem({ item }) {
  const renderDietaryIcons = () => {
    return item.dietary.map((diet) => {
      if (diet === 'V') {
        return (
          <span
            key={diet}
            className="inline-flex items-center text-green-400 text-xs mr-2"
            title="Vegetarian"
          >
            <Leaf size={14} className="mr-1" />
          </span>
        );
      }
      if (diet === 'GF') {
        return (
          <span
            key={diet}
            className="inline-flex items-center text-amber-400 text-xs mr-2"
            title="Gluten-Free"
          >
            <Wheat size={14} className="mr-1" />
            GF
          </span>
        );
      }
      return null;
    });
  };

  const renderSpiceLevel = () => {
    if (item.spiceLevel === 0) return null;
    const flames = Array(item.spiceLevel).fill(0);
    return (
      <span className="inline-flex items-center text-red-400 text-xs">
        {flames.map((_, i) => (
          <Flame key={i} size={14} />
        ))}
      </span>
    );
  };

  return (
    <div className="group relative bg-charcoal-900 border border-charcoal-800 rounded-sm overflow-hidden hover:border-gold-600/50 transition-all duration-300 hover:shadow-burgundy">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-serif text-xl text-cream-100 group-hover:text-gold-400 transition-colors">
            {item.name}
          </h3>
          <span className="text-gold-500 font-serif text-xl font-semibold">
            ${item.price}
          </span>
        </div>

        <p className="text-cream-400 text-sm leading-relaxed mb-4">
          {item.description}
        </p>

        {/* Wine Details */}
        {item.wineDetails && (
          <div className="mb-4 p-3 bg-charcoal-800/50 rounded-sm">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-cream-600 block">Region</span>
                <span className="text-cream-300">{item.wineDetails.region}</span>
              </div>
              <div>
                <span className="text-cream-600 block">Year</span>
                <span className="text-cream-300">{item.wineDetails.year}</span>
              </div>
              <div>
                <span className="text-cream-600 block">Varietal</span>
                <span className="text-cream-300">{item.wineDetails.varietal}</span>
              </div>
            </div>
          </div>
        )}

        {/* Dietary & Spice */}
        <div className="flex items-center justify-between pt-4 border-t border-charcoal-800">
          <div className="flex items-center">
            {renderDietaryIcons()}
            {renderSpiceLevel()}
          </div>
          <span className="text-xs text-cream-600 italic">
            {item.category}
          </span>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
    </div>
  );
}
