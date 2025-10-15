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
    location: 'London, UK',
    text: 'I\'ve tried many services, but TapTap Send is the fastest and cheapest. Highly recommend!',
    rating: 5,
    avatar: '👨🏽'
  },
  {
    name: 'John D.',
    location: 'New York, USA',
    text: 'Sending money home has never been easier. Great exchange rates and instant delivery!',
    rating: 5,
    avatar: '👨🏿'
  }
];

const TestimonialsSection = ({ isMobile }) => {
  return (
    <div style={{ marginBottom: isMobile ? '40px' : '60px' }}>
      <h2 style={{
        fontSize: isMobile ? '1.5rem' : '2rem',
        fontWeight: '700',
        color: 'white',
        textAlign: 'center',
        marginBottom: isMobile ? '24px' : '40px'
      }}>
        What Our Customers Say
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: isMobile ? '16px' : '24px'
      }}>
        {TESTIMONIALS.map((testimonial, idx) => (
          <div key={idx} style={{
            background: 'white',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: isMobile ? '12px' : '16px', alignItems: 'center' }}>
              <div style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                flexShrink: 0
              }}>
                {testimonial.avatar}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: isMobile ? '0.9375rem' : '1rem', color: '#111827' }}>
                  {testimonial.name}
                </div>
                <div style={{ fontSize: isMobile ? '0.75rem' : '0.8125rem', color: '#6b7280' }}>
                  {testimonial.location}
                </div>
              </div>
            </div>
            <div style={{ color: '#fbbf24', marginBottom: isMobile ? '10px' : '12px', fontSize: isMobile ? '1rem' : '1.125rem' }}>
              {'⭐'.repeat(testimonial.rating)}
            </div>
            <p style={{
              color: '#374151',
              fontSize: isMobile ? '0.875rem' : '0.9375rem',
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