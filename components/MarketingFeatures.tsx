'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, Gift, CreditCard, Heart, ShoppingBag, TagIcon, PercentIcon, TicketIcon, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface MarketingFeatureProps {
  userId?: string;
  bookingId?: string;
  onApply?: (type: string, id: string) => void;
  standalone?: boolean;
}

export function MarketingFeatures({ userId, bookingId, onApply, standalone = false }: MarketingFeatureProps) {
  // State for each marketing feature
  const [activeTab, setActiveTab] = useState('discounts');
  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [coupons, setCoupons] = useState({ code: '', isValid: false, error: '' });
  const [giftCards, setGiftCards] = useState({ code: '', value: 0, isValid: false, error: '' });
  const [loyaltyPoints, setLoyaltyPoints] = useState({ available: 0, toRedeem: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [giftCardForm, setGiftCardForm] = useState({
    value: 50,
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    message: '',
    notifyRecipient: true
  });

  // Load marketing data
  useEffect(() => {
    if (activeTab === 'discounts') {
      fetchDiscounts();
    } else if (activeTab === 'campaigns') {
      fetchCampaigns();
    } else if (activeTab === 'loyalty' && userId) {
      fetchLoyaltyPoints();
    }
  }, [activeTab, userId]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/zenoti/discounts');
      const data = await response.json();
      setDiscounts(data.discounts || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available discounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/zenoti/campaigns?status=active');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load active campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLoyaltyPoints = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/zenoti/loyalty/${userId}`);
      const data = await response.json();
      setLoyaltyPoints({
        ...loyaltyPoints,
        available: data.points_balance || 0,
      });
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      toast({
        title: 'Error',
        description: 'Failed to load loyalty points',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async () => {
    if (!coupons.code.trim()) {
      setCoupons({ ...coupons, error: 'Please enter a coupon code' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/zenoti/coupons/validate?code=${coupons.code}`);
      const data = await response.json();
      
      if (data.valid) {
        setCoupons({ ...coupons, isValid: true, error: '' });
        toast({
          title: 'Valid Coupon',
          description: `Coupon code "${coupons.code}" is valid!`,
          variant: 'default',
        });
      } else {
        setCoupons({ ...coupons, isValid: false, error: data.error || 'Invalid coupon code' });
        toast({
          title: 'Invalid Coupon',
          description: data.error || 'The coupon code is invalid or expired',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCoupons({ ...coupons, isValid: false, error: 'Error validating coupon' });
      toast({
        title: 'Error',
        description: 'Failed to validate coupon code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateGiftCard = async () => {
    if (!giftCards.code.trim()) {
      setGiftCards({ ...giftCards, error: 'Please enter a gift card code' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/zenoti/gift-cards/${giftCards.code}`);
      const data = await response.json();
      
      if (data.status === 'active' && data.current_balance > 0) {
        setGiftCards({ 
          ...giftCards, 
          isValid: true, 
          value: data.current_balance,
          error: '' 
        });
        toast({
          title: 'Valid Gift Card',
          description: `Gift card has a balance of $${data.current_balance.toFixed(2)}`,
          variant: 'default',
        });
      } else if (data.status === 'expired') {
        setGiftCards({ ...giftCards, isValid: false, error: 'This gift card has expired' });
        toast({
          title: 'Expired Gift Card',
          description: 'This gift card has expired',
          variant: 'destructive',
        });
      } else if (data.current_balance <= 0) {
        setGiftCards({ ...giftCards, isValid: false, error: 'This gift card has a zero balance' });
        toast({
          title: 'Zero Balance',
          description: 'This gift card has a zero balance',
          variant: 'destructive',
        });
      } else {
        setGiftCards({ ...giftCards, isValid: false, error: 'Invalid gift card' });
        toast({
          title: 'Invalid Gift Card',
          description: 'The gift card code is invalid',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error validating gift card:', error);
      setGiftCards({ ...giftCards, isValid: false, error: 'Error validating gift card' });
      toast({
        title: 'Error',
        description: 'Failed to validate gift card code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createGiftCard = async () => {
    const { value, recipientName, recipientEmail, senderName, message, notifyRecipient } = giftCardForm;
    
    if (!recipientName || !recipientEmail || value <= 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/zenoti/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          sender_name: senderName,
          message,
          notify_recipient: notifyRecipient
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Gift Card Created',
          description: `Gift card created successfully with code: ${data.code}`,
          variant: 'default',
        });
        // Reset form
        setGiftCardForm({
          value: 50,
          recipientName: '',
          recipientEmail: '',
          senderName: '',
          message: '',
          notifyRecipient: true
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create gift card',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating gift card:', error);
      toast({
        title: 'Error',
        description: 'Failed to create gift card',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const redeemLoyaltyPoints = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID is required to redeem points',
        variant: 'destructive',
      });
      return;
    }
    
    if (loyaltyPoints.toRedeem <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter the number of points to redeem',
        variant: 'destructive',
      });
      return;
    }
    
    if (loyaltyPoints.toRedeem > loyaltyPoints.available) {
      toast({
        title: 'Error',
        description: 'You cannot redeem more points than you have available',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const payload: any = { points: loyaltyPoints.toRedeem };
      if (bookingId) payload.booking_id = bookingId;
      
      const response = await fetch(`/api/zenoti/loyalty/${userId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update available points
        setLoyaltyPoints({
          available: loyaltyPoints.available - loyaltyPoints.toRedeem,
          toRedeem: 0
        });
        
        toast({
          title: 'Points Redeemed',
          description: `Successfully redeemed ${loyaltyPoints.toRedeem} loyalty points`,
          variant: 'default',
        });
        
        if (onApply && bookingId) {
          onApply('loyalty', userId);
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to redeem loyalty points',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      toast({
        title: 'Error',
        description: 'Failed to redeem loyalty points',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyDiscount = async (discountId: string) => {
    if (!bookingId) {
      toast({
        title: 'Error',
        description: 'Booking ID is required to apply discount',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/zenoti/bookings/${bookingId}/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_id: discountId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Discount Applied',
          description: 'Discount has been successfully applied to your booking',
          variant: 'default',
        });
        
        if (onApply) {
          onApply('discount', discountId);
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to apply discount',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply discount',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!bookingId) {
      toast({
        title: 'Error',
        description: 'Booking ID is required to apply coupon',
        variant: 'destructive',
      });
      return;
    }
    
    if (!coupons.isValid) {
      toast({
        title: 'Invalid Coupon',
        description: 'Please validate the coupon first',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/zenoti/bookings/${bookingId}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_code: coupons.code }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Coupon Applied',
          description: 'Coupon has been successfully applied to your booking',
          variant: 'default',
        });
        
        if (onApply) {
          onApply('coupon', coupons.code);
        }
        
        // Reset coupon state
        setCoupons({ code: '', isValid: false, error: '' });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to apply coupon',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply coupon',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyGiftCard = async () => {
    if (!bookingId) {
      toast({
        title: 'Error',
        description: 'Booking ID is required to apply gift card',
        variant: 'destructive',
      });
      return;
    }
    
    if (!giftCards.isValid) {
      toast({
        title: 'Invalid Gift Card',
        description: 'Please validate the gift card first',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/zenoti/bookings/${bookingId}/gift-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gift_card_code: giftCards.code }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Gift Card Applied',
          description: 'Gift card has been successfully applied to your booking',
          variant: 'default',
        });
        
        if (onApply) {
          onApply('gift_card', giftCards.code);
        }
        
        // Reset gift card state
        setGiftCards({ code: '', value: 0, isValid: false, error: '' });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to apply gift card',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error applying gift card:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply gift card',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={standalone ? 'w-full' : 'w-full max-w-lg mx-auto'}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TagIcon className="mr-2 h-5 w-5 text-blue-500" />
          Marketing Features
        </CardTitle>
        <CardDescription>
          Apply special offers, redeem points, and more
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="discounts" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="discounts" className="flex flex-col items-center gap-1 py-2">
              <PercentIcon className="h-4 w-4" />
              <span className="text-xs">Discounts</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex flex-col items-center gap-1 py-2">
              <TicketIcon className="h-4 w-4" />
              <span className="text-xs">Coupons</span>
            </TabsTrigger>
            <TabsTrigger value="gift_cards" className="flex flex-col items-center gap-1 py-2">
              <Gift className="h-4 w-4" />
              <span className="text-xs">Gift Cards</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex flex-col items-center gap-1 py-2">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Loyalty</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex flex-col items-center gap-1 py-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-xs">Campaigns</span>
            </TabsTrigger>
          </TabsList>

          {/* Discounts Tab */}
          <TabsContent value="discounts" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Available Discounts</h3>
                <Button variant="outline" size="sm" onClick={fetchDiscounts} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : discounts.length > 0 ? (
                <div className="grid gap-2">
                  {discounts.map((discount: any) => (
                    <Card key={discount.id} className="p-4 bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{discount.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {discount.type === 'percentage' ? `${discount.value}% off` : 
                             discount.type === 'fixed' ? `$${discount.value} off` : 
                             'Free item'}
                          </p>
                          {discount.description && (
                            <p className="text-xs mt-1">{discount.description}</p>
                          )}
                        </div>
                        {bookingId && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => applyDiscount(discount.id)}
                            disabled={loading}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No discounts available at this time
                </div>
              )}
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Enter coupon code</h3>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={coupons.code}
                  onChange={(e) => setCoupons({ ...coupons, code: e.target.value })}
                />
                <Button 
                  variant="outline" 
                  onClick={validateCoupon}
                  disabled={loading || !coupons.code.trim()}
                >
                  Validate
                </Button>
              </div>
              
              {coupons.error && (
                <div className="flex items-center text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {coupons.error}
                </div>
              )}
              
              {coupons.isValid && (
                <div className="flex items-center text-green-500 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Coupon code is valid
                </div>
              )}
              
              {coupons.isValid && bookingId && (
                <Button 
                  className="w-full mt-2" 
                  onClick={applyCoupon}
                  disabled={loading}
                >
                  Apply Coupon to Booking
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Gift Cards Tab */}
          <TabsContent value="gift_cards" className="space-y-4">
            <Tabs defaultValue="redeem">
              <TabsList className="w-full">
                <TabsTrigger value="redeem" className="flex-1">Redeem a Gift Card</TabsTrigger>
                <TabsTrigger value="purchase" className="flex-1">Purchase a Gift Card</TabsTrigger>
              </TabsList>
              
              <TabsContent value="redeem" className="mt-4 space-y-4">
                <h3 className="text-sm font-medium">Enter gift card code</h3>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Gift card code"
                    value={giftCards.code}
                    onChange={(e) => setGiftCards({ ...giftCards, code: e.target.value })}
                  />
                  <Button 
                    variant="outline" 
                    onClick={validateGiftCard}
                    disabled={loading || !giftCards.code.trim()}
                  >
                    Validate
                  </Button>
                </div>
                
                {giftCards.error && (
                  <div className="flex items-center text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {giftCards.error}
                  </div>
                )}
                
                {giftCards.isValid && (
                  <div className="flex items-center text-green-500 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Gift card is valid - Balance: ${giftCards.value.toFixed(2)}
                  </div>
                )}
                
                {giftCards.isValid && bookingId && (
                  <Button 
                    className="w-full mt-2" 
                    onClick={applyGiftCard}
                    disabled={loading}
                  >
                    Apply Gift Card to Booking
                  </Button>
                )}
              </TabsContent>
              
              <TabsContent value="purchase" className="mt-4 space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="gift-card-value">Gift Card Value ($)</Label>
                    <Input
                      id="gift-card-value"
                      type="number"
                      value={giftCardForm.value}
                      onChange={(e) => setGiftCardForm({...giftCardForm, value: parseInt(e.target.value) || 0})}
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipient-name">Recipient Name</Label>
                    <Input
                      id="recipient-name"
                      value={giftCardForm.recipientName}
                      onChange={(e) => setGiftCardForm({...giftCardForm, recipientName: e.target.value})}
                      placeholder="Recipient's full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipient-email">Recipient Email</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      value={giftCardForm.recipientEmail}
                      onChange={(e) => setGiftCardForm({...giftCardForm, recipientEmail: e.target.value})}
                      placeholder="recipient@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sender-name">Sender Name (optional)</Label>
                    <Input
                      id="sender-name"
                      value={giftCardForm.senderName}
                      onChange={(e) => setGiftCardForm({...giftCardForm, senderName: e.target.value})}
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Personal Message (optional)</Label>
                    <Input
                      id="message"
                      value={giftCardForm.message}
                      onChange={(e) => setGiftCardForm({...giftCardForm, message: e.target.value})}
                      placeholder="Add a personal message"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="notify" 
                      checked={giftCardForm.notifyRecipient}
                      onCheckedChange={(checked) => setGiftCardForm({...giftCardForm, notifyRecipient: checked as boolean})}
                    />
                    <Label htmlFor="notify" className="text-sm">Notify recipient by email</Label>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={createGiftCard}
                    disabled={loading || !giftCardForm.recipientName || !giftCardForm.recipientEmail || giftCardForm.value <= 0}
                  >
                    Purchase Gift Card
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty" className="space-y-4">
            {userId ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Loyalty Points</h3>
                  <Button variant="outline" size="sm" onClick={fetchLoyaltyPoints} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Available Points</span>
                        <Badge variant="secondary" className="text-lg">{loyaltyPoints.available}</Badge>
                      </div>
                    </div>
                    
                    {loyaltyPoints.available > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Redeem Points</h4>
                        
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Points to redeem"
                            min="1"
                            max={loyaltyPoints.available}
                            value={loyaltyPoints.toRedeem || ''}
                            onChange={(e) => setLoyaltyPoints({
                              ...loyaltyPoints,
                              toRedeem: Math.min(parseInt(e.target.value) || 0, loyaltyPoints.available)
                            })}
                          />
                          <Button 
                            variant="outline" 
                            disabled={loading || loyaltyPoints.toRedeem <= 0}
                            onClick={redeemLoyaltyPoints}
                          >
                            Redeem
                          </Button>
                        </div>
                        
                        {loyaltyPoints.toRedeem > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {bookingId 
                              ? `This will apply ${loyaltyPoints.toRedeem} points to your current booking.` 
                              : `This will redeem ${loyaltyPoints.toRedeem} points for your account.`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Please log in to access your loyalty points
              </div>
            )}
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Active Campaigns</h3>
                <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : campaigns.length > 0 ? (
                <div className="grid gap-4">
                  {campaigns.map((campaign: any) => (
                    <Card key={campaign.id} className="p-4 overflow-hidden">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <Badge>{campaign.type}</Badge>
                        </div>
                        
                        {campaign.description && (
                          <p className="text-sm text-muted-foreground">{campaign.description}</p>
                        )}
                        
                        <div className="text-xs flex justify-between items-center text-muted-foreground">
                          <span>Valid until: {new Date(campaign.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No active campaigns at this time
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}