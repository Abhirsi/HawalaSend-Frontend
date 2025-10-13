import React from 'react';

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    location: 'Toronto, Canada',
    text: 'Best rates I\'ve found! My family in Kenya receives money within minutes. No hidden fees!',
    rating: 5,
    avatar: '👩🏾'
  },
  {
    name: 'Ahmed K.',
    location: 'BC, Canada',
    text: 'I\'ve tried many services, but Hawala Send is the fastest and cheapest. Highly recommend!',
    rating: 5,
    avatar: '👨🏽'
  },
  {
    name: 'John D.',
    location: 'Vancouver, Canada',
    text: 'Sending money home has never been easier. Great exchange rates and instant delivery!',
    rating: 5,
    avatar: '👨🏿'
  }
];

const TestimonialsSection = () => {
  return (
    <div style={{ marginBottom: '60px' }}>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: 'white',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        What Our Customers Say
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 968 ? 'repeat(3, 1fr)' : window.innerWidth > 640 ? 'repeat(2, 1fr)' : '1fr',
        gap: '24px'
      }}>
        {TESTIMONIALS.map((testimonial, idx) => (
          <div key={idx} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {testimonial.avatar}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#111827' }}>
                  {testimonial.name}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                  {testimonial.location}
                </div>
              </div>
            </div>
            <div style={{ color: '#fbbf24', marginBottom: '12px', fontSize: '1.125rem' }}>
              {'⭐'.repeat(testimonial.rating)}
            </div>
            <p style={{
              color: '#374151',
              fontSize: '0.9375rem',
              lineHeight: '1.6',
              margin: 0
            }}>
              "{testimonial.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;