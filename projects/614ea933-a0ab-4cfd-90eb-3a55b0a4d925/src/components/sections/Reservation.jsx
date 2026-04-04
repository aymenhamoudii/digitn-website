import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Reservation = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    guests: '2'
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', date: '', time: '', guests: '2' });
    }, 1500);
  };

  return (
    <section id="reservation" className="section-padding bg-background relative">
      <div className="max-w-5xl mx-auto bg-surface rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/5">
        <div className="md:w-2/5 relative min-h-[300px]">
          <img 
            src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=600&q=80" 
            alt="Private dining table arrangement" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
            <h4 className="text-3xl font-display font-bold mb-4">Book Your Table</h4>
            <p className="text-sm opacity-90 leading-relaxed">Join us for an unforgettable evening. Reservations recommended for weekend dining.</p>
          </div>
        </div>

        <div className="md:w-3/5 p-8 md:p-12">
          {status === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-2xl font-display font-bold mb-2">Reservation Confirmed!</h4>
              <p className="text-text-secondary mb-8">We've sent the details to your email. See you soon!</p>
              <Button onClick={() => setStatus('idle')} variant="secondary">Book Another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Full Name" 
                  placeholder="John Doe" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <Input 
                  label="Email Address" 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input 
                  label="Date" 
                  type="date" 
                  required 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
                <Input 
                  label="Time" 
                  type="time" 
                  required 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
                <Input 
                  label="Guests" 
                  type="number" 
                  min="1" 
                  max="10" 
                  required 
                  value={formData.guests}
                  onChange={(e) => setFormData({...formData, guests: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={status === 'loading'}>
                {status === 'loading' ? 'Checking Availability...' : 'Confirm Booking'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Reservation;
