import React from 'react';
import Button from '../ui/Button';

const Contact = () => {
  return (
    <section id="contact" className="section-padding bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1">
            <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Find Us</h2>
            <h3 className="text-4xl font-display font-bold mb-8">Visit Vibe Eats</h3>
            
            <div className="space-y-8">
              <div>
                <h4 className="font-bold text-lg mb-2 text-white">Location</h4>
                <p className="text-text-secondary leading-relaxed">
                  123 Culinary Boulevard<br />
                  Foodie District, NY 10001
                </p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-white">Opening Hours</h4>
                <div className="grid grid-cols-2 gap-4 text-text-secondary">
                  <div>
                    <p className="text-white font-medium">Mon - Thu</p>
                    <p>12:00 PM - 10:00 PM</p>
                  </div>
                  <div>
                    <p className="text-white font-medium">Fri - Sat</p>
                    <p>12:00 PM - 12:00 AM</p>
                  </div>
                  <div>
                    <p className="text-white font-medium">Sunday</p>
                    <p>10:00 AM - 9:00 PM</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-white">Contact</h4>
                <p className="text-text-secondary">+1 (555) 123-4567</p>
                <p className="text-primary hover:underline cursor-pointer">hello@vibeeats.com</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-background p-8 md:p-12 rounded-3xl border border-white/5">
            <h4 className="text-2xl font-bold mb-6">Send a Message</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <input 
                type="text" 
                placeholder="Name" 
                aria-label="Your Name"
                className="bg-surface border-2 border-white/10 focus:border-primary outline-none p-4 rounded-xl text-white"
              />
              <input 
                type="email" 
                placeholder="Email" 
                aria-label="Your Email"
                className="bg-surface border-2 border-white/10 focus:border-primary outline-none p-4 rounded-xl text-white"
              />
            </div>
            <textarea 
              rows="5" 
              placeholder="How can we help?" 
              aria-label="Your Message"
              className="w-full bg-surface border-2 border-white/10 focus:border-primary outline-none p-4 rounded-xl text-white mb-6"
            ></textarea>
            <Button variant="primary" className="w-full sm:w-auto">Send Message</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
