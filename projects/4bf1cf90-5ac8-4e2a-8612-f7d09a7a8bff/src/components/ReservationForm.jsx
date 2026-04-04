import React, { useState } from 'react';

function ReservationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    partySize: '2',
    requests: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (parseInt(formData.partySize) < 1 || parseInt(formData.partySize) > 12) {
      newErrors.partySize = 'Party size must be 1-12';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call / availability check
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Generate fake booking reference
    const ref = 'BV-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);
    setShowModal(true);
    setIsSubmitting(false);

    // Reset form for demo reuse
    setFormData({
      name: '',
      email: '',
      date: '',
      time: '',
      partySize: '2',
      requests: ''
    });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Available times for demo (hardcoded realistic slots)
  const availableTimes = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

  return (
    <section id="reservations" className="py-24 bg-neutral-dark text-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-16 items-center">
          {/* Left column - Info */}
          <div className="md:col-span-5">
            <span className="uppercase text-terracotta text-sm font-medium tracking-[1px]">Book your table</span>
            <h2 className="section-header font-serif text-5xl md:text-6xl leading-none text-cream mt-2 mb-6">
              Reserve Your Evening
            </h2>
            <p className="text-cream/80 text-lg max-w-sm">
              Intimate tables for two. Celebrations for twelve. Every reservation receives our full attention.
            </p>
            
            <div className="mt-12 space-y-8">
              <div className="flex gap-6">
                <div className="text-4xl">🕒</div>
                <div>
                  <div className="font-medium text-xl">Dinner Service</div>
                  <div className="text-cream/70">5:00 PM – 10:00 PM</div>
                  <div className="text-xs uppercase tracking-widest text-terracotta mt-1">Last seating 9:00 PM</div>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="text-4xl">📍</div>
                <div>
                  <div className="font-medium text-xl">Bella Vista</div>
                  <div className="text-cream/70">Via della Vigna Nuova 12, Florence</div>
                  <a href="#" className="text-terracotta hover:underline text-sm mt-1 inline-block">Get directions →</a>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Form */}
          <div className="md:col-span-7 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                {/* Name */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs uppercase tracking-widest font-medium mb-2 text-cream/70">Full name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/30 focus:border-terracotta rounded-3xl px-6 py-5 text-cream placeholder:text-cream/40 outline-none transition-colors"
                    placeholder="Maria Rossi"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1.5">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs uppercase tracking-widest font-medium mb-2 text-cream/70">Email address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/30 focus:border-terracotta rounded-3xl px-6 py-5 text-cream placeholder:text-cream/40 outline-none transition-colors"
                    placeholder="you@email.com"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1.5">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-medium mb-2 text-cream/70">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/10 border border-white/30 focus:border-terracotta rounded-3xl px-6 py-5 text-cream placeholder:text-cream/40 outline-none transition-colors"
                  />
                  {errors.date && <p className="text-red-400 text-sm mt-1.5">{errors.date}</p>}
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-medium mb-2 text-cream/70">Time</label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/30 focus:border-terracotta rounded-3xl px-6 py-5 text-cream outline-none transition-colors"
                  >
                    <option value="">Select time</option>
                    {availableTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.time && <p className="text-red-400 text-sm mt-1.5">{errors.time}</p>}
                </div>
              </div>

              {/* Party size */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-medium mb-2 text-cream/70">Party size</label>
                <select
                  name="partySize"
                  value={formData.partySize}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/30 focus:border-terracotta rounded-3xl px-6 py-5 text-cream outline-none transition-colors"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
                {errors.partySize && <p className="text-red-400 text-sm mt-1.5">{errors.partySize}</p>}
              </div>

              {/* Special requests */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-medium mb-2 text-cream/70">Special requests (optional)</label>
                <textarea
                  name="requests"
                  value={formData.requests}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white/10 border border-white/30 focus:border-terracotta rounded-3xl px-6 py-5 text-cream placeholder:text-cream/40 outline-none transition-colors resize-none"
                  placeholder="Anniversary celebration, dietary needs, etc."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-7 bg-terracotta hover:bg-white hover:text-neutral-dark text-cream font-medium text-xl rounded-3xl transition-all duration-300 flex items-center justify-center gap-x-3 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-current border-r-transparent rounded-full"></span>
                    Checking availability...
                  </>
                ) : (
                  <>Confirm reservation • No deposit required</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6">
          <div className="bg-white text-neutral-dark max-w-md w-full rounded-3xl p-8 text-center relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-neutral/40 hover:text-neutral text-2xl leading-none"
            >×</button>
            
            <div className="mx-auto w-20 h-20 bg-terracotta/10 text-terracotta rounded-3xl flex items-center justify-center text-4xl mb-6">✓</div>
            
            <h3 className="font-serif text-4xl mb-2">Reservation Confirmed</h3>
            <p className="text-neutral text-lg mb-8">Thank you! We look forward to welcoming you.</p>
            
            <div className="bg-neutral/5 rounded-2xl p-5 mb-8">
              <div className="text-xs uppercase tracking-widest text-neutral mb-1">Your booking reference</div>
              <div className="font-mono text-3xl text-terracotta font-medium">{bookingRef}</div>
            </div>
            
            <p className="text-sm text-neutral/70">
              A confirmation has been sent to <span className="font-medium">{formData.email || 'your email'}</span>.<br />
              We’ll see you on {formData.date} at {formData.time}.
            </p>
            
            <button
              onClick={closeModal}
              className="mt-10 w-full py-6 bg-neutral-dark text-cream rounded-3xl font-medium"
            >
              Back to restaurant
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReservationForm;
