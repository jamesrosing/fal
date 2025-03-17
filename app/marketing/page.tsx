'use client';

import { useState } from 'react';
import { MarketingFeatures } from '@/components/MarketingFeatures';
import { ChatInterface } from '@/components/ChatInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, Clock, DollarSign, ShoppingCart, MessageSquare, TagIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// Mock data for the example
const mockBooking = {
  id: 'booking-123',
  date: new Date(),
  time: '2:00 PM',
  service: 'Deluxe Facial Treatment',
  provider: 'Julia Bandy',
  duration: 60,
  price: 120,
  discounts: [],
  total: 120
};

const mockUser = {
  id: 'user-456',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  loyaltyPoints: 450
};

export default function MarketingFeaturesPage() {
  const [activeTab, setActiveTab] = useState('booking');
  const [booking, setBooking] = useState(mockBooking);
  const [applied, setApplied] = useState<{
    type: string;
    id: string;
    description: string;
    value: number;
  }[]>([]);

  // Handle applying marketing features to booking
  const handleApplyMarketing = (type: string, id: string) => {
    // In a real application, you would update the booking with the server
    let description = '';
    let value = 0;
    
    switch (type) {
      case 'discount':
        description = '20% Off Promotion';
        value = booking.price * 0.2;
        break;
      case 'coupon':
        description = `Coupon: ${id}`;
        value = 15;
        break;
      case 'gift_card':
        description = `Gift Card: ${id}`;
        value = 30;
        break;
      case 'loyalty':
        description = 'Loyalty Points';
        value = 10;
        break;
    }
    
    // Add to applied list
    setApplied([...applied, { type, id, description, value }]);
    
    // Update booking total
    setBooking({
      ...booking,
      total: booking.total - value
    });
    
    toast({
      title: 'Applied Successfully',
      description: `${description} has been applied to your booking.`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Zenoti Marketing Features</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booking Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Appointment</CardTitle>
            <CardDescription>Review and manage your upcoming appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="booking" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="booking">Details</TabsTrigger>
                <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
              </TabsList>
              
              <TabsContent value="booking" className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">{booking.service}</h3>
                      <p className="text-sm text-muted-foreground">with {booking.provider}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium mb-1 flex items-center">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        Date
                      </span>
                      <span className="text-sm">{format(booking.date, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium mb-1 flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Time
                      </span>
                      <span className="text-sm">{booking.time}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium mb-1 flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Duration
                      </span>
                      <span className="text-sm">{booking.duration} minutes</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium mb-1 flex items-center">
                        <DollarSign className="mr-1 h-4 w-4" />
                        Price
                      </span>
                      <span className="text-sm">${booking.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <TagIcon className="mr-1 h-4 w-4" />
                      Applied Promotions
                    </h4>
                    
                    {applied.length > 0 ? (
                      <div className="space-y-2">
                        {applied.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-muted p-2 rounded-md">
                            <span className="text-sm">{item.description}</span>
                            <span className="text-sm font-medium text-green-600">-${item.value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No promotions applied yet</p>
                    )}
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-lg">${booking.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="chat">
                <div className="h-[500px]">
                  <ChatInterface />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Marketing Features */}
        <div className="flex flex-col gap-4">
          <Card className="bg-muted/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{mockUser.name}</p>
                  <p className="text-xs text-muted-foreground">{mockUser.email}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-sm">Loyalty Points</span>
                <Badge variant="secondary">{mockUser.loyaltyPoints}</Badge>
              </div>
            </CardContent>
          </Card>
        
          <MarketingFeatures 
            userId={mockUser.id} 
            bookingId={booking.id} 
            onApply={handleApplyMarketing} 
          />
        </div>
      </div>
    </div>
  );
}