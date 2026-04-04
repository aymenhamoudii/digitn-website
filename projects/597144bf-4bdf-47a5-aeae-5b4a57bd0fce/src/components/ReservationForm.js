import React, { useState } from 'react';
import ReservationModal from './ReservationModal';

const ReservationForm = () => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: '',
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { date, time, partySize, name, email, phone } = formData;

    if (!date) newErrors.date = 'Please select a date';
    else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date must be in the future';
      }
    }

    if (!time) newErrors.time = 'Please select a time';
    if (!partySize) newErrors.partySize = 'Please enter party size';
    else if (parseInt(partySize) < 1) newErrors.partySize = 'Party size must be at least 1';
    else if (parseInt(partySize) > 20) newErrors.partySize = 'Party size cannot exceed 20';
    if (!name) newErrors.name = 'Please enter your name';
    if (!email) newErrors.email = 'Please enter your email';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid';
    if (!phone) newErrors.phone = 'Please enter your phone number';
    else if (!/^\d{10,11}$/.test(phone.replace(/\s/g, ''))) newErrors.phone = 'Phone number is invalid';

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      // Simulate successful reservation
      setModalContent({
        title: 'Reservation Confirmed!',
        message: `Thank you, ${formData.name}. Your reservation for ${formData.partySize} people on ${formData.date} at ${formData.time} has been confirmed.`,
        ctaText: 'View Menu',
        ctaAction: () => {
          setShowModal(false);
          // In a real app, scroll to menu section
        },
        secondaryText: 'Share on Social',
        secondaryAction: () => {
          alert('Sharing on social media (not implemented in demo)');
        },
      });
      setShowModal(true);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-display text-neutral-900 text-center mb-10">
          Make a Reservation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                  ${errors.date ? 'border-red-500' : ''}
                  focus:border-primary-500 focus:ring-primary-500 sm:text-sm`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                  ${errors.time ? 'border-red-500' : ''}
                  focus:border-primary-500 focus:ring-primary-500 sm:text-sm`}
              />
              {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Party Size
              </label>
              <input
                type="number"
                name="partySize"
                value={formData.partySize}
                onChange={handleChange}
                min="1"
                max="20"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                  ${errors.partySize ? 'border-red-500' : ''}
                  focus:border-primary-500 focus:ring-primary-500 sm:text-sm`}
              />
              {errors.partySize && <p className="mt-1 text-sm text-red-600">{errors.partySize}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                  ${errors.name ? 'border-red-500' : ''}
                  focus:border-primary-500 focus:ring-primary-500 sm:text-sm`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                  ${errors.email ? 'border-red-500' : ''}
                  focus:border-primary-500 focus:ring-primary-500 sm:text-sm`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                  ${errors.phone ? 'border-red-500' : ''}
                  focus:border-primary-500 focus:ring-primary-500 sm:text-sm`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-primary-500 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              disabled={Object.keys(errors).length > 0}
            >
              Reserve Table
            </button>
          </div>
        </form>
      </div>

      {/* Reservation Modal */}
      {showModal && (
        <ReservationModal
          content={modalContent}
          onClose={() => setShowModal(false)}
        />
      )}
    </section>
  );
};

export default ReservationForm;