import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Plus, Minus, ChefHat } from 'lucide-react';
import useMouseParallax from '../hooks/useMouseParallax';

const ThreeDPlate = () => {
  const [rotation, setRotation] = useState({ x: 20, y: 20 });
  const [zoom, setZoom] = useState(1);
  const [showIngredients, setShowIngredients] = useState(false);
  
  const parallax = useMouseParallax(0.05);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
    setRotation({ x: 20 - y, y: 20 + x });
  };

  const handleReset = () => {
    setRotation({ x: 20, y: 20 });
    setZoom(1);
  };

  const ingredients = [
    { id: 1, name: 'Black Truffle', color: 'bg-black-matte', position: 'top-1/4 left-1/4' },
    { id: 2, name: 'Wagyu Beef', color: 'bg-terracotta-500', position: 'top-1/3 right-1/4' },
    { id: 3, name: 'Saffron', color: 'bg-brass-500', position: 'bottom-1/3 left-1/3' },
    { id: 4, name: 'Foie Gras', color: 'bg-concrete-300', position: 'bottom-1/4 right-1/3' },
    { id: 5, name: 'Gold Leaf', color: 'bg-yellow-400', position: 'top-1/2 left-1/2' },
  ];

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-3">
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))}
          className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-concrete-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          aria-label="Zoom in"
        >
          <Plus className="w-5 h-5 text-concrete-700" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
          className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-concrete-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          aria-label="Zoom out"
        >
          <Minus className="w-5 h-5 text-concrete-700" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-concrete-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          aria-label="Reset view"
        >
          <RotateCw className="w-5 h-5 text-concrete-700" />
        </button>
        <button
          onClick={() => setShowIngredients(!showIngredients)}
          className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-concrete-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          aria-label="Toggle ingredients"
        >
          <ChefHat className="w-5 h-5 text-concrete-700" />
        </button>
      </div>

      {/* 3D Plate Container */}
      <div className="relative w-full h-full" onMouseMove={handleMouseMove}>
        {/* Plate Base */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            transformStyle: 'preserve-3d',
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom}) ${parallax.transform}`,
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Plate Shadow */}
          <div className="absolute w-[400px] h-[400px] rounded-full bg-black/10 blur-xl -translate-z-50"></div>
          
          {/* Plate Rim */}
          <div className="relative w-[300px] h-[300px] rounded-full bg-gradient-to-br from-concrete-200 to-concrete-100 shadow-2xl border-8 border-concrete-300/50">
            {/* Plate Surface */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white to-concrete-50 shadow-inner">
              {/* Food Composition */}
              <div className="absolute inset-4 rounded-full">
                {/* Main Protein */}
                <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-terracotta-500 to-terracotta-600 rounded-full shadow-xl animate-float"></div>
                
                {/* Sauce Swirl */}
                <div className="absolute top-1/2 left-1/2 w-32 h-8 bg-gradient-to-r from-brass-400 to-brass-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
                
                {/* Garnish */}
                <div className="absolute bottom-1/3 right-1/3 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg animate-float" style={{ animationDelay: '1s' }}></div>
                
                {/* Microgreens */}
                <div className="absolute bottom-1/4 left-1/3 w-6 h-12 bg-gradient-to-b from-green-500 to-green-700 rounded-full shadow-md transform rotate-45 animate-float" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-1/4 left-2/3 w-6 h-12 bg-gradient-to-b from-green-500 to-green-700 rounded-full shadow-md transform -rotate-45 animate-float" style={{ animationDelay: '0.8s' }}></div>
                
                {/* Sauce Dots */}
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-brass-500 rounded-full animate-float"
                    style={{
                      top: `${25 + i * 15}%`,
                      left: `${65 - i * 10}%`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Plate Reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
          </div>
        </motion.div>

        {/* Floating Ingredients Labels */}
        {showIngredients && ingredients.map((ingredient) => (
          <motion.div
            key={ingredient.id}
            className={`absolute ${ingredient.position} z-10`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: ingredient.id * 0.1, duration: 0.3 }}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-8 h-8 ${ingredient.color} rounded-full shadow-lg flex items-center justify-center`}>
                <div className="w-4 h-4 rounded-full bg-white/30"></div>
              </div>
              <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
                <span className="text-xs font-body font-medium text-concrete-800 whitespace-nowrap">
                  {ingredient.name}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Ambient Lighting */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-brass-500/5 to-terracotta-500/5 blur-3xl"></div>
      </div>

      {/* Plate Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl max-w-md"
      >
        <div className="text-center">
          <h3 className="font-display font-bold text-lg text-black-matte mb-2">
            Signature Dish: Black Truffle Wagyu
          </h3>
          <p className="text-sm font-body text-concrete-600">
            Premium Japanese Wagyu beef with fresh black truffle, saffron emulsion, and edible gold leaf.
            Rotate and zoom to explore each element.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ThreeDPlate;