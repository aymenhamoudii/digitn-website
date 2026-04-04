import React, { useState, useEffect } from 'react';
import DateTimePicker from './DateTimePicker';
import { checkAvailability, submitBooking } from '../utils/validation';

const BookingForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    occasion: 'casual',
    specialRequests: '',
  });
  
  const [availability, setAvailability] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Pre-fill form with demo data
    if (typeof window !== 'undefined' && localStorage.getItem('demoSeeded')) {
      setFormData({
        name: 'Alex Morgan',
        email: 'alex@example.com',
        phone: '(555) 123-4567',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        time: '19:00',
        guests: 4,
        occasion: 'anniversary',
        specialRequests: 'Window table preferred',
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (stepNum) => {
    const newErrors = {};
    
    switch (stepNum) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        break;
      
      case 2:
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (formData.guests < 1 || formData.guests > 12) {
          newErrors.guests = 'Please select 1-12 guests';
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      
      // Check availability when date/time is selected
      if (step === 1 && formData.date && formData.time) {
        const slots = checkAvailability(formData.date, formData.time, formData.guests);
        setAvailability(slots);
      }
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const booking = await submitBooking(formData);
      setBookingId(booking.id);
      setBookingComplete(true);
      
      // Store booking in localStorage for demo purposes
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      localStorage.setItem('bookings', JSON.stringify([...existingBookings, booking]));
      
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const occasions = [
    { value: 'casual', label: 'Casual Dining' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'business', label: 'Business Dinner' },
    { value: 'date', label: 'Romantic Date' },
    { value: 'celebration', label: 'Special Celebration' },
  ];

  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="relative">
      {/* Section header */}
      <div className="mb-16 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-6 text-cinematic-white">
          Reserve Your <span className="text-gradient-silver">Table</span>
        </h2>
        <p className="text-lg text-cinematic-silver-primary max-w-3xl mx-auto">
          Experience culinary excellence at Éclat. Book your table and prepare for 
          an unforgettable dining journey.
        </p>
      </div>

      {bookingComplete ? (
        /* Confirmation screen */
        <div className="max-w-2xl mx-auto glass-silver rounded-2xl p-8 md:p-12 text-center border border-cinematic-silver-primary/20">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cinematic-silver-primary/20 to-transparent border border-cinematic-silver-primary/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-cinematic-silver-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-3xl font-bold text-cinematic-white mb-4">
              Reservation Confirmed
            </h3>
            
            <p className="text-cinematic-silver-primary mb-6">
              Your table at Éclat has been reserved. We look forward to welcoming you!
            </p>
            
            <div className="text-sm text-cinematic-silver-dark mb-8">
              Confirmation ID: <span className="font-mono text-cinematic-silver-accent">{bookingId}</span>
            </div>
          </div>
          
          <div className="glass-silver rounded-xl p-6 mb-8 border border-cinematic-silver-primary/20">
            <h4 className="text-xl font-bold text-cinematic-white mb-4">Reservation Details</h4>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-cinematic-silver-dark mb-1">Name</p>
                <p className="text-cinematic-white">{formData.name}</p>
              </div>
              <div>
                <p className="text-sm text-cinematic-silver-dark mb-1">Date & Time</p>
                <p className="text-cinematic-white">{formData.date} at {formData.time}</p>
              </div>
              <div>
                <p className="text-sm text-cinematic-silver-dark mb-1">Guests</p>
                <p className="text-cinematic-white">{formData.guests} people</p>
              </div>
              <div>
                <p className="text-sm text-cinematic-silver-dark mb-1">Occasion</p>
                <p className="text-cinematic-white">{formData.occasion}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              setBookingComplete(false);
              setStep(1);
              setFormData({
                name: '',
                email: '',
                phone: '',
                date: '',
                time: '',
                guests: 2,
                occasion: 'casual',
                specialRequests: '',
              });
            }}
            className="btn-primary"
          >
            Make Another Reservation
          </button>
        </div>
      ) : (
        /* Booking form */
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-12">
            <div className="flex justify-between items-center">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      step >= stepNum
                        ? 'bg-cinematic-silver-accent text-cinematic-black'
                        : 'bg-cinematic-silver-primary/10 text-cinematic-silver-primary'
                    }`}>
                      {stepNum}
                    </div>
                    <span className={`text-sm font-medium transition-all duration-300 ${
                      step >= stepNum
                        ? 'text-cinematic-white'
                        : 'text-cinematic-silver-dark'
                    }`}>
                      {stepNum === 1 && 'Contact'}
                      {stepNum === 2 && 'Details'}
                      {stepNum === 3 && 'Confirm'}
                    </span>
                  </div>
                  
                  {stepNum < 3 && (
                    <div className={`flex-1 h-0.5 transition-all duration-300 ${
                      step > stepNum
                        ? 'bg-cinematic-silver-accent'
                        : 'bg-cinematic-silver-primary/20'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Contact Information */}
            {step === 1 && (
              <div className="glass-silver rounded-2xl p-8 border border-cinematic-silver-primary/20 animate-reveal">
                <h3 className="text-2xl font-bold text-cinematic-white mb-6">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-cinematic-silver-primary mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-cinematic-black-light border transition-all duration-300 ${
                        errors.name
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-cinematic-silver-primary/30 focus:border-cinematic-silver-primary'
                      } text-cinematic-white focus:outline-none focus:ring-2 focus:ring-cinematic-silver-primary/20`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-cinematic-silver-primary mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-cinematic-black-light border transition-all duration-300 ${
                        errors.email
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-cinematic-silver-primary/30 focus:border-cinematic-silver-primary'
                      } text-cinematic-white focus:outline-none focus:ring-2 focus:ring-cinematic-silver-primary/20`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-cinematic-silver-primary mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-cinematic-black-light border transition-all duration-300 ${
                        errors.phone
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-cinematic-silver-primary/30 focus:border-cinematic-silver-primary'
                      } text-cinematic-white focus:outline-none focus:ring-2 focus:ring-cinematic-silver-primary/20`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-400">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-cinematic-silver-primary mb-2">
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-3 rounded-lg bg-cinematic-black-light border border-cinematic-silver-primary/30 text-cinematic-white focus:outline-none focus:border-cinematic-silver-primary focus:ring-2 focus:ring-cinematic-silver-primary/20 transition-all duration-300"
                      placeholder="Allergies, celebrations, seating preferences..."
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary"
                  >
                    Continue to Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Booking Details */}
            {step === 2 && (
              <div className="glass-silver rounded-2xl p-8 border border-cinematic-silver-primary/20 animate-reveal">
                <h3 className="text-2xl font-bold text-cinematic-white mb-6">Reservation Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-cinematic-silver-primary mb-2">
                      Date *
                    </label>
                    <DateTimePicker
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      error={errors.date}
                      minDate={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-cinematic-silver-primary mb-2">
                      Time *
                    </label>
                    <DateTimePicker
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      error={errors.time}
                      availableSlots={availability}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-cinematic-silver-primary mb-2">
                      Number of Guests *
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-cinematic-black-light border transition-all duration-300 ${
                        errors.guests
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-cinematic-silver-primary/30 focus:border-cinematic-silver-primary'
                      } text-cinematic-white focus:outline-none focus:ring-2 focus:ring-cinematic-silver-primary/20`}
                    >
                      {guestOptions.map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                    {errors.guests && (
                      <p className="mt-2 text-sm text-red-400">{errors.guests}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-cinematic-silver-primary mb-2">
                      Occasion
                    </label>
                    <select
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-cinematic-black-light border border-cinematic-silver-primary/30 text-cinematic-white focus:outline-none focus:border-cinematic-silver-primary focus:ring-2 focus:ring-cinematic-silver-primary/20 transition-all duration-300"
                    >
                      {occasions.map(occasion => (
                        <option key={occasion.value} value={occasion.value}>
                          {occasion.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {availability.length > 0 && (
                  <div className="mt-6 p-4 bg-cinematic-black/50 rounded-lg border border-cinematic-silver-primary/20">
                    <h4 className="text-lg font-semibold text-cinematic-white mb-2">
                      Available Tables
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {availability.map((slot, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                            formData.time === slot.time
                              ? 'bg-cinematic-silver-accent text-cinematic-black'
                              : 'bg-cinematic-silver-primary/10 text-cinematic-silver-primary'
                          }`}
                        >
                          {slot.time} ({slot.tables} tables)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary"
                  >
                    Review & Confirm
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="glass-silver rounded-2xl p-8 border border-cinematic-silver-primary/20 animate-reveal">
                <h3 className="text-2xl font-bold text-cinematic-white mb-6">Review Your Reservation</h3>
                
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-cinematic-silver-accent mb-3">
                        Contact Information
                      </h4>
                      <div>
                        <p className="text-sm text-cinematic-silver-dark mb-1">Name</p>
                        <p className="text-cinematic-white">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinematic-silver-dark mb-1">Email</p>
                        <p className="text-cinematic-white">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinematic-silver-dark mb-1">Phone</p>
                        <p className="text-cinematic-white">{formData.phone}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-cinematic-silver-accent mb-3">
                        Reservation Details
                      </h4>
                      <div>
                        <p className="text-sm text-cinematic-silver-dark mb-1">Date & Time</p>
                        <p className="text-cinematic-white">{formData.date} at {formData.time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinematic-silver-dark mb-1">Guests</p>
                        <p className="text-cinematic-white">{formData.guests} people</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinematic-silver-dark mb-1">Occasion</p>
                        <p className="text-cinematic-white">
                          {occasions.find(o => o.value === formData.occasion)?.label}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {formData.specialRequests && (
                    <div className="p-4 bg-cinematic-black/50 rounded-lg border border-cinematic-silver-primary/20">
                      <h4 className="text-lg font-semibold text-cinematic-white mb-2">
                        Special Requests
                      </h4>
                      <p className="text-cinematic-silver-primary">{formData.specialRequests}</p>
                    </div>
                  )}
                </div>
                
                {errors.submit && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400">{errors.submit}</p>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary relative"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Confirm Reservation'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Booking info */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Reservation Policy',
            content: 'Tables are held for 15 minutes past your reservation time. A credit card may be required for parties of 6 or more.',
          },
          {
            title: 'Cancellation',
            content: 'Please cancel at least 24 hours in advance to avoid a cancellation fee of $50 per person.',
          },
          {
            title: 'Dress Code',
            content: 'Smart casual attire is required. We recommend business casual or formal wear for the best experience.',
          },
        ].map((info, index) => (
          <div
            key={index}
            className="glass-silver rounded-xl p-6 border border-cinematic-silver-primary/20"
          >
            <h4 className="text-lg font-bold text-cinematic-white mb-3">
              {info.title}
            </h4>
            <p className="text-sm text-cinematic-silver-primary">
              {info.content}
            </p>
          </div>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 -left-20 w-64 h-64 border border-cinematic-silver-primary/10 rounded-full opacity-20" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 border border-cinematic-silver-primary/5 rounded-full opacity-20" />
    </div>
  );
};

export default BookingForm;