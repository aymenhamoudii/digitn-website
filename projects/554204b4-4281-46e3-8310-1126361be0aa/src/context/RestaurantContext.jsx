import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const RestaurantContext = createContext();

// Provider component
export const RestaurantProvider = ({ children }) => {
  const [data, setData] = useState({
    menuItems: [],
    reviews: [],
    chefInfo: null,
    galleryImages: [],
    loading: true
  });

  useEffect(() => {
    // Load data from localStorage (which was seeded in main.jsx)
    const loadData = () => {
      try {
        const storedData = localStorage.getItem('restaurantData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setData({
            ...parsedData,
            loading: false
          });
        } else {
          // Fallback if somehow not seeded
          console.error("Demo data not found in localStorage");
          setData(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Failed to parse restaurant data:", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

  return (
    <RestaurantContext.Provider value={data}>
      {children}
    </RestaurantContext.Provider>
  );
};

// Custom hook to use the context
export const useRestaurantData = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurantData must be used within a RestaurantProvider');
  }
  return context;
};