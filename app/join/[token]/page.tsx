'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, CheckCircle2, Lock, Mail, Phone, User, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

// Common country codes with flags
// Note: US and Canada share +1, so we use unique 'id' for React keys
const countryCodes = [
  { code: '+1', country: 'US', label: '🇺🇸 United States (+1)', id: 'US' },
  { code: '+1', country: 'CA', label: '🇨🇦 Canada (+1)', id: 'CA' },
  { code: '+44', country: 'GB', label: '🇬🇧 United Kingdom (+44)', id: 'GB' },
  { code: '+61', country: 'AU', label: '🇦🇺 Australia (+61)', id: 'AU' },
  { code: '+33', country: 'FR', label: '🇫🇷 France (+33)', id: 'FR' },
  { code: '+49', country: 'DE', label: '🇩🇪 Germany (+49)', id: 'DE' },
  { code: '+81', country: 'JP', label: '🇯🇵 Japan (+81)', id: 'JP' },
  { code: '+86', country: 'CN', label: '🇨🇳 China (+86)', id: 'CN' },
  { code: '+91', country: 'IN', label: '🇮🇳 India (+91)', id: 'IN' },
  { code: '+52', country: 'MX', label: '🇲🇽 Mexico (+52)', id: 'MX' },
  { code: '+55', country: 'BR', label: '🇧🇷 Brazil (+55)', id: 'BR' },
  { code: '+34', country: 'ES', label: '🇪🇸 Spain (+34)', id: 'ES' },
  { code: '+39', country: 'IT', label: '🇮🇹 Italy (+39)', id: 'IT' },
  { code: '+31', country: 'NL', label: '🇳🇱 Netherlands (+31)', id: 'NL' },
  { code: '+46', country: 'SE', label: '🇸🇪 Sweden (+46)', id: 'SE' },
  { code: '+47', country: 'NO', label: '🇳🇴 Norway (+47)', id: 'NO' },
  { code: '+45', country: 'DK', label: '🇩🇰 Denmark (+45)', id: 'DK' },
  { code: '+41', country: 'CH', label: '🇨🇭 Switzerland (+41)', id: 'CH' },
  { code: '+32', country: 'BE', label: '🇧🇪 Belgium (+32)', id: 'BE' },
  { code: '+27', country: 'ZA', label: '🇿🇦 South Africa (+27)', id: 'ZA' },
  { code: '+82', country: 'KR', label: '🇰🇷 South Korea (+82)', id: 'KR' },
  { code: '+65', country: 'SG', label: '🇸🇬 Singapore (+65)', id: 'SG' },
  { code: '+971', country: 'AE', label: '🇦🇪 UAE (+971)', id: 'AE' },
];

export default function JoinPage() {
  const params = useParams();
  const token = params.token as string;
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('US'); // Store country ID, not code
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Get the actual country code from the selected country ID
  const countryCode = countryCodes.find(c => c.id === selectedCountryId)?.code || '+1';
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [consentSms, setConsentSms] = useState(false);
  const [consentEmail, setConsentEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    contact?: string;
    phone?: string;
    email?: string;
    consent?: string;
  }>({});

  useEffect(() => {
    // Detect user's country/region
    detectUserLocation();
    fetchBusinessInfo();
  }, [token]);

  const detectUserLocation = async () => {
    try {
      // Try to detect country from browser locale
      const locale = navigator.language || navigator.languages?.[0] || 'en-US';
      const country = locale.split('-')[1]?.toUpperCase() || 'US';
      
      // Find matching country code (prefer exact match, fallback to first with same code)
      const matchedCountry = countryCodes.find(c => c.id === country);
      if (matchedCountry) {
        setSelectedCountryId(matchedCountry.id);
      } else {
        // If no exact match, default to US
        setSelectedCountryId('US');
      }

      // Also try IP-based detection (optional, can be slow)
      try {
        const ipResponse = await fetch('https://ipapi.co/json/', { 
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          if (ipData.country_code) {
            // For +1 countries (US/CA), prefer the detected country
            const ipMatched = countryCodes.find(c => c.id === ipData.country_code);
            if (ipMatched) {
              setSelectedCountryId(ipMatched.id);
            } else if (ipData.country_code === 'CA') {
              // Special handling for Canada
              setSelectedCountryId('CA');
            }
          }
        }
      } catch {
        // Ignore IP detection errors - fallback to browser locale
      }
    } catch {
      // Default to US if detection fails
        setSelectedCountryId('US');
    }
  };

  const fetchBusinessInfo = async () => {
    try {
      // Try to get business name from the token
      // This is optional - if it fails, we'll just show generic text
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      // Note: This would require a public endpoint or we can skip it for now
      setBusinessName(null);
    } catch {
      // Ignore errors - business name is optional
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!phoneNumber && !email) {
      newErrors.contact = 'At least one contact method (phone or email) is required';
    }

    // Phone validation - check if phone number is provided
    if (phoneNumber) {
      // Remove common formatting characters
      const cleanedPhone = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
      // Check if it's all digits and has reasonable length (7-15 digits without country code)
      if (!cleanedPhone.match(/^\d{7,15}$/)) {
        newErrors.phone = 'Please enter a valid phone number (7-15 digits)';
      }
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Consent is only required for the contact methods provided
    // If they provide phone, they must consent to SMS
    // If they provide email, they must consent to email
    if (phoneNumber && !consentSms) {
      newErrors.consent = 'Please provide consent to receive SMS messages if you enter a phone number';
    } else if (email && !consentEmail) {
      newErrors.consent = 'Please provide consent to receive email messages if you enter an email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setErrors({});

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured. Please check your environment variables.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/join-web`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          name: name.trim(),
          phone_e164: phoneNumber ? `${countryCode}${phoneNumber.replace(/[\s\-\(\)\.]/g, '')}` : null,
          email: email || null,
          date_of_birth: dateOfBirth || null,
          consent_sms: consentSms,
          consent_email: consentEmail,
        }),
      });

      let errorMessage = 'Failed to join';
      
      if (!response.ok) {
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || data.details || `Server error (${response.status})`;
          
          // Provide more helpful error messages
          if (response.status === 404) {
            errorMessage = 'Join service not found. Please ensure Edge Functions are deployed.';
          } else if (response.status === 409) {
            // Customer already exists
            if (data.existing_customer) {
              errorMessage = `A customer with this contact information already exists (${data.existing_customer.name}). Please use a different phone number or email.`;
            } else {
              errorMessage = data.error || 'A customer with this contact information already exists.';
            }
          } else if (response.status === 500) {
            errorMessage = data.error || data.details || 'Server error. Please check the console for details.';
          } else if (response.status === 403) {
            errorMessage = data.error || 'Invalid or expired join link.';
          } else if (response.status === 400) {
            errorMessage = data.error || 'Invalid request. Please check your information.';
          }
        } catch (parseError) {
          // If JSON parsing fails, try to get text
          try {
            const text = await response.text();
            errorMessage = text || `Server error (${response.status}). Please try again.`;
          } catch {
            errorMessage = `Server error (${response.status}). Please try again.`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      setSuccess(true);
    } catch (err) {
      console.error('Join error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-background">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-12">
            <div className="flex justify-center mb-6">
              <Spinner size="lg" className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">
              Please wait while we prepare the join form
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-background">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-12">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">You're All Set!</h1>
            <p className="text-muted-foreground text-lg mb-6">
              Thank you for joining! You've been successfully added to our list.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your information is secure and private</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="max-w-2xl mx-auto py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">L</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Join {businessName || 'Our List'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Stay connected and receive updates directly to your phone or email
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              Enter your details below. We'll only use this to send you updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="inline h-4 w-4 mr-2" />
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="John Doe"
                  required
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {countryCodes.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      // Only allow digits and common formatting
                      const value = e.target.value.replace(/[^\d\s\-\(\)\.]/g, '');
                      setPhoneNumber(value);
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    placeholder="1234567890"
                    className={`flex-1 ${errors.phone ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter your phone number without the country code (it's already selected above)
                </p>
                {phoneNumber && (
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="consent-sms"
                      checked={consentSms}
                      onCheckedChange={(checked) => setConsentSms(checked as boolean)}
                      required={!!phoneNumber}
                    />
                    <label
                      htmlFor="consent-sms"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I consent to receive SMS messages at this number. Message and data rates may apply.
                      <span className="text-destructive">*</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Date of Birth Field (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth (Optional)
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                />
                <p className="text-xs text-muted-foreground">
                  Helpful for distinguishing customers with the same name
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="john@example.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
                {email && (
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="consent-email"
                      checked={consentEmail}
                      onCheckedChange={(checked) => setConsentEmail(checked as boolean)}
                      required={!!email}
                    />
                    <label
                      htmlFor="consent-email"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I consent to receive email messages at this address.
                      {email && <span className="text-destructive">*</span>}
                    </label>
                  </div>
                )}
              </div>

              {/* Contact Method Error */}
              {errors.contact && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.contact}
                  </p>
                </div>
              )}

              {/* Consent Error */}
              {errors.consent && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.consent}
                  </p>
                </div>
              )}

              {/* General Error */}
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Joining...
                  </>
                ) : (
                  'Join Now'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Secure & Private</h3>
                <p className="text-xs text-muted-foreground">
                  Your information is encrypted and never shared
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Easy to Unsubscribe</h3>
                <p className="text-xs text-muted-foreground">
                  You can opt out anytime with one click
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Compliance First</h3>
                <p className="text-xs text-muted-foreground">
                  We follow all messaging regulations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            By joining, you agree to receive messages. You can unsubscribe at any time.
            <br />
            Standard message and data rates may apply for SMS.
          </p>
        </div>
      </div>
    </div>
  );
}
