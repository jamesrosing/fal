'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ZenotiService, ZenotiProvider, ZenotiSlot, ZenotiAPI } from '@/lib/zenoti';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  notes: z.string().optional(),
});

export function AppointmentScheduler() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ZenotiService[]>([]);
  const [providers, setProviders] = useState<ZenotiProvider[]>([]);
  const [availableSlots, setAvailableSlots] = useState<ZenotiSlot[]>([]);
  const [currentBookingId, setCurrentBookingId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Load services and providers on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [servicesData, providersData] = await Promise.all([
          ZenotiAPI.getServices(),
          ZenotiAPI.getProviders(),
        ]);
        setServices(servicesData || []);
        setProviders(providersData || []);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load services and providers. Please try again.',
          variant: 'destructive',
        });
        setServices([]);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Group services by category
  const servicesByCategory = services?.reduce((acc, service) => {
    const category = service.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, ZenotiService[]>) || {};

  // Load available slots when service and date are selected
  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedService || !selectedDate) return;
      
      try {
        setLoading(true);
        const { booking_id, slots } = await ZenotiAPI.getAvailability(
          selectedService,
          format(selectedDate, 'yyyy-MM-dd'),
          selectedProvider // Optional: will be undefined if not selected
        );
        setCurrentBookingId(booking_id);
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Failed to load availability:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available time slots. Please try again.',
          variant: 'destructive',
        });
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };
    loadAvailability();
  }, [selectedService, selectedDate, selectedProvider]);

  const validateForm = () => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedService || !selectedDate || !selectedSlot || !selectedProvider || !currentBookingId) {
      toast({
        title: 'Error',
        description: 'Please complete all appointment details.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await ZenotiAPI.bookAppointment({
        service_id: selectedService,
        provider_id: selectedProvider,
        slot_id: selectedSlot,
        guest: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        notes: formData.notes,
      });

      toast({
        title: 'Success',
        description: 'Your appointment has been scheduled successfully! You will receive a confirmation email shortly.',
      });
      
      // Reset form
      setStep(1);
      setSelectedService('');
      setSelectedDate(undefined);
      setSelectedSlot('');
      setSelectedProvider('');
      setCurrentBookingId('');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to book appointment. Please try again or contact us directly.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-between mb-12">
        {[
          'Select Service',
          'Choose Date',
          'Pick Time & Provider',
          'Your Details'
        ].map((label, index) => (
          <div
            key={index}
            className={`flex items-center ${index > 0 ? 'flex-1' : ''}`}
          >
            {index > 0 && (
              <div 
                className={`h-[2px] flex-1 mx-2 ${
                  step > index ? 'bg-primary' : 'bg-zinc-700'
                }`}
              />
            )}
            <div 
              className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2
                ${step > index 
                  ? 'border-primary bg-primary text-white' 
                  : step === index + 1
                  ? 'border-primary text-primary'
                  : 'border-zinc-700 text-zinc-700'
                }
              `}
            >
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 rounded-xl p-8">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-white mb-2">Select a Service</h3>
              <p className="text-zinc-400">Choose the service you'd like to book</p>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <RadioGroup
                value={selectedService}
                onValueChange={(value) => {
                  setSelectedService(value);
                  setStep(2);
                }}
              >
                {Object.entries(servicesByCategory).map(([category, services]) => (
                  <div key={category} className="mb-6">
                    <h4 className="text-lg font-medium text-white mb-3">{category}</h4>
                    <div className="space-y-3">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-start space-x-3">
                          <RadioGroupItem value={service.id} id={service.id} />
                          <label
                            htmlFor={service.id}
                            className="flex-1 cursor-pointer rounded-lg bg-zinc-800 p-4 hover:bg-zinc-750 transition-colors"
                          >
                            <div className="font-medium text-white">{service.name}</div>
                            <div className="text-sm text-zinc-400 mt-1">
                              <span>${service.price}</span>
                              <span className="mx-2">•</span>
                              <span>{service.duration} min</span>
                            </div>
                            {service.description && (
                              <div className="text-sm text-zinc-500 mt-2">{service.description}</div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>
          </div>
        )}

        {/* Step 2: Select Date */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-white mb-2">Select a Date</h3>
              <p className="text-zinc-400">Choose your preferred appointment date</p>
            </div>
            
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) setStep(3);
                }}
                className="rounded-md border-zinc-800"
                disabled={(date) => {
                  const today = new Date();
                  const twoMonthsFromNow = new Date();
                  twoMonthsFromNow.setMonth(today.getMonth() + 2);
                  return date < today || date > twoMonthsFromNow;
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Select Time & Provider */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-white mb-2">Select Time & Provider</h3>
              <p className="text-zinc-400">Choose your preferred time and provider</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-white">Available Times</Label>
                <RadioGroup
                  value={selectedSlot}
                  onValueChange={setSelectedSlot}
                  className="grid grid-cols-2 gap-2"
                >
                  {availableSlots.map((slot) => (
                    <div key={slot.id}>
                      <RadioGroupItem
                        value={slot.id}
                        id={slot.id}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={slot.id}
                        className="flex items-center justify-center h-12 rounded-md border-2 border-zinc-800 bg-zinc-900 peer-checked:border-primary peer-checked:text-primary cursor-pointer hover:bg-zinc-800 transition-colors"
                      >
                        {format(new Date(slot.start_time), 'h:mm a')}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Provider</Label>
                <RadioGroup
                  value={selectedProvider}
                  onValueChange={(value) => {
                    setSelectedProvider(value);
                    if (selectedSlot) setStep(4);
                  }}
                  className="space-y-2"
                >
                  {providers.map((provider) => (
                    <div key={provider.id}>
                      <RadioGroupItem
                        value={provider.id}
                        id={provider.id}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={provider.id}
                        className="flex flex-col p-4 rounded-md border-2 border-zinc-800 bg-zinc-900 peer-checked:border-primary cursor-pointer hover:bg-zinc-800 transition-colors"
                      >
                        <span className="font-medium text-white">{provider.name}</span>
                        {provider.specialties?.length > 0 && (
                          <span className="text-sm text-zinc-400 mt-1">
                            {provider.specialties.join(', ')}
                          </span>
                        )}
                        {provider.bio && (
                          <span className="text-sm text-zinc-500 mt-2">{provider.bio}</span>
                        )}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {selectedSlot && selectedProvider && (
              <Button
                onClick={() => setStep(4)}
                className="w-full h-12 text-lg font-medium"
              >
                Continue
              </Button>
            )}
          </div>
        )}

        {/* Step 4: Contact Information */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-white mb-2">Your Information</h3>
              <p className="text-zinc-400">Please provide your contact details</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-white">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  className="h-12 bg-zinc-800 border-zinc-700"
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-sm text-red-400">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  className="h-12 bg-zinc-800 border-zinc-700"
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-sm text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-white">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="h-12 bg-zinc-800 border-zinc-700"
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-white">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className="h-12 bg-zinc-800 border-zinc-700"
              />
              {errors.phone && (
                <p id="phone-error" className="text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-white">Additional Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="h-12 bg-zinc-800 border-zinc-700"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-12 text-lg font-medium"
              disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
            >
              Schedule Appointment
            </Button>
          </div>
        )}

        {/* Navigation */}
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="mt-6"
          >
            Back
          </Button>
        )}
      </div>
    </div>
  );
} 