'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ZenotiService, ZenotiProvider, ZenotiSlot } from '@/lib/zenoti';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, Calendar as CalendarIcon, Clock, User, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from 'framer-motion';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  notes: z.string().optional(),
});

// Error display component with animation
function ErrorDisplay({ message, retryAction }: { message: string, retryAction: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center min-h-[300px] space-y-4 p-6 bg-zinc-900 rounded-md border border-red-700"
    >
      <AlertCircle className="w-12 h-12 text-red-500" />
      <div className="text-zinc-300 text-center space-y-2">
        <p>{message}</p>
        {message.includes('949-706-7874') && (
          <p className="font-semibold text-lg mt-2">
            Call <a href="tel:9497067874" className="text-blue-400 hover:underline">949-706-7874</a> to schedule your appointment
          </p>
        )}
      </div>
      <Button onClick={retryAction} variant="outline" className="mt-4">
        Try Again
      </Button>
    </motion.div>
  );
}

// Success component with animation
function SuccessDisplay({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[300px] space-y-4 p-6 bg-zinc-900 rounded-md border border-green-700"
    >
      <CheckCircle className="w-12 h-12 text-green-500" />
      <h3 className="text-xl font-serif text-white">Appointment Confirmed!</h3>
      <p className="text-zinc-300 text-center">{message}</p>
      <Button 
        onClick={() => window.location.reload()}
        variant="outline" 
        className="mt-4"
      >
        Book Another Appointment
      </Button>
    </motion.div>
  );
}

// Loading indicator component with animation
function LoadingIndicator({ message = "Loading..." }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
    >
      <Loader2 className="w-8 h-8 animate-spin text-white" />
      <p className="text-zinc-400">{message}</p>
    </motion.div>
  );
}

// Fade In component for smooth transitions
const FadeIn = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// Add isValidDate function at the top of the file
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export function AppointmentScheduler() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ZenotiService[]>([]);
  const [providers, setProviders] = useState<ZenotiProvider[]>([]);
  const [availableSlots, setAvailableSlots] = useState<ZenotiSlot[]>([]);
  const [currentBookingId, setCurrentBookingId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
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
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      // Load both data sets in parallel
      const [servicesData, providersData] = await Promise.all([
        ZenotiService.getServices(),
        ZenotiService.getProviders(),
      ]);
      
      setServices(servicesData || []);
      setProviders(providersData || []);
      
      // Log success
      console.log(`Loaded ${servicesData?.length || 0} services and ${providersData?.length || 0} providers`);
    } catch (error: any) {
      console.error('Failed to load initial data:', error);
      
      // Use the customer-friendly message for all errors
      const errorMessage = 'We apologize, the online booking system is temporarily unavailable. Please call 949-706-7874 to schedule your appointment.';
      
      toast({
        title: 'Booking System Unavailable',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setLoadError(errorMessage);
      setServices([]);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

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
        setAvailableSlots([]); // Clear previous slots while loading
        
        const { booking_id, slots } = await ZenotiService.getAvailability(
          selectedService,
          format(selectedDate, 'yyyy-MM-dd'),
          selectedProvider // Optional: will be undefined if not selected
        );
        
        setCurrentBookingId(booking_id);
        
        // Check if we have any available slots
        if (slots && slots.length > 0) {
          setAvailableSlots(slots);
        } else {
          // No slots available
          toast({
            title: 'No Availability',
            description: 'There are no available time slots for this date. Please try another date.',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        console.error('Failed to load availability:', error);
        
        // Use the customer-friendly message for all errors
        const errorMessage = 'We apologize, the online booking system is temporarily unavailable. Please call 949-706-7874 to schedule your appointment.';
        
        toast({
          title: 'Booking System Unavailable',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadAvailability();
  }, [selectedService, selectedDate, selectedProvider, toast]);

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
    console.log("Submit triggered with booking_id:", currentBookingId);
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
      const response = await ZenotiService.bookAppointment({
        booking_id: currentBookingId,
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

      // Success!
      setBookingSuccess(true);
      setBookingDetails({
        ...response,
        serviceName: getServiceName(selectedService),
        providerName: getProviderName(selectedProvider),
        date: format(selectedDate, 'MMMM d, yyyy'),
        time: selectedSlot && availableSlots.find(s => s.id === selectedSlot)?.start_time && 
          isValidDate(availableSlots.find(s => s.id === selectedSlot)?.start_time || '') 
          ? format(new Date(availableSlots.find(s => s.id === selectedSlot)?.start_time || ''), 'h:mm a')
          : 'No time selected',
      });

      toast({
        title: 'Success',
        description: 'Your appointment has been booked successfully!',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      
      // Use the customer-friendly message for all errors
      const errorMessage = error.message || 'We apologize, the online booking system is temporarily unavailable. Please call 949-706-7874 to schedule your appointment.';
      
      toast({
        title: 'Booking System Unavailable',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get service name from ID
  const getServiceName = (id: string) => {
    return services.find(service => service.id === id)?.name || 'Selected Service';
  };

  // Helper to get provider name from ID
  const getProviderName = (id: string) => {
    return providers.find(provider => provider.id === id)?.name || 'Selected Provider';
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (loadError) {
    return <ErrorDisplay message={loadError} retryAction={loadInitialData} />;
  }

  if (bookingSuccess) {
    const serviceName = getServiceName(selectedService);
    const providerName = getProviderName(selectedProvider);
    const appointmentDate = selectedDate ? format(selectedDate, 'MMMM d, yyyy') : '';
    const appointmentTime = availableSlots.find(slot => slot.id === selectedSlot)?.start_time || '';
    const formattedTime = appointmentTime && isValidDate(appointmentTime) 
      ? format(new Date(appointmentTime), 'h:mm a') 
      : '';
    
    return (
      <SuccessDisplay 
        message={`Your appointment for ${serviceName} with ${providerName} on ${appointmentDate} at ${formattedTime} has been confirmed. You will receive a confirmation email at ${formData.email}. Your confirmation code is: ${bookingDetails.confirmation_code || 'PENDING'}.`} 
      />
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
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: step > index ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className={`h-[2px] flex-1 mx-2 origin-left ${
                  step > index ? 'bg-primary' : 'bg-zinc-700'
                }`}
              />
            )}
            <motion.div 
              animate={{
                scale: step === index + 1 ? [1, 1.1, 1] : 1,
                borderColor: step > index 
                  ? 'var(--primary)' 
                  : step === index + 1
                  ? 'var(--primary)'
                  : 'rgb(63, 63, 70)'
              }}
              transition={{ 
                duration: 0.3,
                scale: { 
                  repeat: step === index + 1 ? Infinity : 0, 
                  repeatType: 'reverse',
                  duration: 1.5
                }
              }}
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
            </motion.div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`step-${step}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-900 rounded-xl p-8"
        >
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
                  {Object.entries(servicesByCategory).length > 0 ? (
                    Object.entries(servicesByCategory).map(([category, services]) => (
                      <div key={category} className="mb-6">
                        <h4 className="text-lg font-medium text-white mb-3">{category}</h4>
                        <div className="space-y-3">
                          {services.map((service) => (
                            <motion.div 
                              key={service.id} 
                              className="flex items-start space-x-3"
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
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
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-zinc-500">
                      <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                      <p>No services available. Please try again later.</p>
                    </div>
                  )}
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
                  <Label className="text-white flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Available Times
                  </Label>
                  
                  {availableSlots.length > 0 ? (
                    <RadioGroup
                      value={selectedSlot}
                      onValueChange={setSelectedSlot}
                      className="grid grid-cols-2 gap-2"
                    >
                      {availableSlots.map((slot) => (
                        <motion.div 
                          key={slot.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <RadioGroupItem
                            value={slot.id}
                            id={slot.id}
                            className="peer sr-only"
                          />
                          <label
                            htmlFor={slot.id}
                            className="flex items-center justify-center h-12 rounded-md border-2 border-zinc-800 bg-zinc-900 peer-checked:border-primary peer-checked:text-primary cursor-pointer hover:bg-zinc-800 transition-colors"
                          >
                            {isValidDate(slot.start_time) 
                              ? format(new Date(slot.start_time), 'h:mm a')
                              : 'Invalid time'}
                          </label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 rounded-md border-2 border-zinc-800 bg-zinc-900">
                      <p className="text-zinc-400">No available time slots for this date</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setStep(2)} 
                        className="mt-4"
                      >
                        Choose Another Date
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Provider
                  </Label>
                  <RadioGroup
                    value={selectedProvider}
                    onValueChange={(value) => {
                      setSelectedProvider(value);
                      if (selectedSlot) setStep(4);
                    }}
                    className="space-y-2"
                  >
                    {providers.map((provider) => (
                      <motion.div 
                        key={provider.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
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
                      </motion.div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {selectedSlot && selectedProvider && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={() => setStep(4)}
                    className="w-full h-12 text-lg font-medium"
                  >
                    Continue
                  </Button>
                </motion.div>
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

              {/* Appointment summary */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-zinc-800 rounded-lg mb-6"
              >
                <h4 className="font-medium text-white mb-3">Appointment Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-zinc-400">Service:</div>
                  <div className="text-white">{getServiceName(selectedService)}</div>
                  
                  <div className="text-zinc-400">Date:</div>
                  <div className="text-white">{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</div>
                  
                  <div className="text-zinc-400">Time:</div>
                  <div className="text-white">
                    {selectedSlot && availableSlots.find(slot => slot.id === selectedSlot)?.start_time && 
                      isValidDate(availableSlots.find(slot => slot.id === selectedSlot)!.start_time)
                      ? format(new Date(availableSlots.find(slot => slot.id === selectedSlot)!.start_time), 'h:mm a')
                      : 'No time selected'}
                  </div>
                  
                  <div className="text-zinc-400">Provider:</div>
                  <div className="text-white">{getProviderName(selectedProvider)}</div>
                </div>
              </motion.div>

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

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 text-lg font-medium"
                  disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                >
                  Schedule Appointment
                </Button>
              </motion.div>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 