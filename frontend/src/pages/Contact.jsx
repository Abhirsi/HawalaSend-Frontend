// frontend/src/pages/Contact.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        padding: '2rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '500px',
          background: 'white',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem auto',
            fontSize: '2rem'
          }}>
            ✓
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#171717',
            marginBottom: '1rem'
          }}>
            Message Sent Successfully!
          </h2>
          <p style={{
            color: '#737373',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            Thank you for contacting HawalaSend. We've received your message and will respond within 24 hours.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 2rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '3rem'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '12px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              marginRight: '1rem'
            }}
          >
            ←
          </button>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Contact Support
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          {/* Contact Form */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#171717',
              marginBottom: '1.5rem'
            }}>
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Priority Level
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="normal">Normal - Account question</option>
                  <option value="high">High - Transfer issue</option>
                  <option value="urgent">Urgent - Account locked/security</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Brief description of your issue"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Please provide as much detail as possible..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Quick Contact */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#171717',
                marginBottom: '1.5rem'
              }}>
                Quick Contact
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    📞
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: '600', color: '#171717' }}>Phone Support</h4>
                    <p style={{ margin: 0, color: '#737373', fontSize: '0.875rem' }}>
                      +1 (855) 518-1238
                    </p>
                    <p style={{ margin: 0, color: '#737373', fontSize: '0.75rem' }}>
                      24/7 for urgent issues
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    ✉️
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: '600', color: '#171717' }}>Email Support</h4>
                    <p style={{ margin: 0, color: '#737373', fontSize: '0.875rem' }}>
                      support@hawalasend.com
                    </p>
                    <p style={{ margin: 0, color: '#737373', fontSize: '0.75rem' }}>
                      Response within 24 hours
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    💬
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: '600', color: '#171717' }}>Live Chat</h4>
                    <p style={{ margin: 0, color: '#737373', fontSize: '0.875rem' }}>
                      Available on all pages
                    </p>
                    <p style={{ margin: 0, color: '#737373', fontSize: '0.75rem' }}>
                      Monday - Friday, 9 AM - 6 PM PST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#171717',
                marginBottom: '1.5rem'
              }}>
                Common Questions
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'How long do transfers take?',
                  'What are the transfer fees?',
                  'How to track my transfer?',
                  'Supported countries',
                  'Account security',
                  'Exchange rates'
                ].map((question, index) => (
                  <button
                    key={index}
                    style={{
                      background: 'transparent',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      color: '#737373',
                      fontSize: '0.875rem'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.borderColor = '#1976d2';
                      e.target.style.color = '#1976d2';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.borderColor = '#e5e5e5';
                      e.target.style.color = '#737373';
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
              border: '1px solid #f59e0b',
              borderRadius: '16px',
              padding: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '0.5rem'
              }}>
                Emergency Support
              </h3>
              <p style={{
                color: '#92400e',
                fontSize: '0.875rem',
                margin: 0,
                lineHeight: 1.5
              }}>
                For urgent issues like account lockouts, suspicious activity, or failed transfers, 
                call our 24/7 emergency line: <strong>+1 (855) 518-1238</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          [style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;