// app/api/chat/marketing-functions.ts

// OpenAI function schema definitions for Zenoti marketing features
export const marketingFunctions = [
    // Discounts
    {
      name: 'get_discounts',
      description: 'Get available discounts from the system',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'apply_discount',
      description: 'Apply a discount to a booking',
      parameters: {
        type: 'object',
        properties: {
          booking_id: {
            type: 'string',
            description: 'ID of the booking to apply the discount to',
          },
          discount_id: {
            type: 'string',
            description: 'ID of the discount to apply',
          },
        },
        required: ['booking_id', 'discount_id'],
      },
    },
    
    // Coupons
    {
      name: 'validate_coupon',
      description: 'Validate a coupon code',
      parameters: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The coupon code to validate',
          },
        },
        required: ['code'],
      },
    },
    {
      name: 'apply_coupon',
      description: 'Apply a coupon to a booking',
      parameters: {
        type: 'object',
        properties: {
          booking_id: {
            type: 'string',
            description: 'ID of the booking to apply the coupon to',
          },
          coupon_code: {
            type: 'string',
            description: 'The coupon code to apply',
          },
        },
        required: ['booking_id', 'coupon_code'],
      },
    },
    
    // Campaigns
    {
      name: 'get_campaigns',
      description: 'Get active marketing campaigns',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'all'],
            description: 'Filter campaigns by status (default: active)',
          },
        },
        required: [],
      },
    },
    
    // Gift Cards
    {
      name: 'create_gift_card',
      description: 'Create a new gift card',
      parameters: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            description: 'The monetary value of the gift card',
          },
          recipient_name: {
            type: 'string',
            description: 'Name of the gift card recipient',
          },
          recipient_email: {
            type: 'string',
            description: 'Email of the gift card recipient',
          },
          sender_name: {
            type: 'string',
            description: 'Name of the gift card sender',
          },
          message: {
            type: 'string',
            description: 'Optional personal message',
          },
          notify_recipient: {
            type: 'boolean',
            description: 'Whether to send notification email to the recipient',
          },
        },
        required: ['value', 'recipient_name', 'recipient_email'],
      },
    },
    {
      name: 'get_gift_card',
      description: 'Get gift card details by code',
      parameters: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The gift card code to retrieve',
          },
        },
        required: ['code'],
      },
    },
    {
      name: 'apply_gift_card',
      description: 'Apply a gift card to a booking',
      parameters: {
        type: 'object',
        properties: {
          booking_id: {
            type: 'string',
            description: 'ID of the booking to apply the gift card to',
          },
          gift_card_code: {
            type: 'string',
            description: 'The gift card code to apply',
          },
          amount: {
            type: 'number',
            description: 'Optional specific amount to use from the gift card',
          },
        },
        required: ['booking_id', 'gift_card_code'],
      },
    },
    
    // Prepaid Cards
    {
      name: 'get_user_prepaid_cards',
      description: 'Get prepaid cards for a user',
      parameters: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            description: 'ID of the user to get prepaid cards for',
          },
        },
        required: ['user_id'],
      },
    },
    {
      name: 'apply_prepaid_card',
      description: 'Apply a prepaid card to a booking',
      parameters: {
        type: 'object',
        properties: {
          booking_id: {
            type: 'string',
            description: 'ID of the booking to apply the prepaid card to',
          },
          prepaid_card_id: {
            type: 'string',
            description: 'ID of the prepaid card to apply',
          },
        },
        required: ['booking_id', 'prepaid_card_id'],
      },
    },
    
    // Loyalty Points
    {
      name: 'get_loyalty_account',
      description: 'Get loyalty account details for a user',
      parameters: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            description: 'ID of the user to get loyalty account for',
          },
        },
        required: ['user_id'],
      },
    },
    {
      name: 'redeem_loyalty_points',
      description: 'Redeem loyalty points for a user',
      parameters: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            description: 'ID of the user to redeem points for',
          },
          points: {
            type: 'number',
            description: 'Number of points to redeem',
          },
          booking_id: {
            type: 'string',
            description: 'Optional booking ID to apply the points to',
          },
        },
        required: ['user_id', 'points'],
      },
    },
    
    // Abandoned Checkouts
    {
      name: 'get_abandoned_checkouts',
      description: 'Get list of abandoned checkouts',
      parameters: {
        type: 'object',
        properties: {
          from_date: {
            type: 'string',
            description: 'Start date for filtering in YYYY-MM-DD format',
          },
          to_date: {
            type: 'string',
            description: 'End date for filtering in YYYY-MM-DD format',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return',
          },
          offset: {
            type: 'number',
            description: 'Number of results to skip for pagination',
          },
        },
        required: [],
      },
    },
    {
      name: 'recover_abandoned_checkout',
      description: 'Attempt to recover an abandoned checkout',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID of the abandoned checkout to recover',
          },
        },
        required: ['id'],
      },
    },
    
    // Target Segments
    {
      name: 'get_target_segments',
      description: 'Get customer target segments',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'get_segment_members',
      description: 'Get members of a specific target segment',
      parameters: {
        type: 'object',
        properties: {
          segment_id: {
            type: 'string',
            description: 'ID of the segment to get members for',
          },
        },
        required: ['segment_id'],
      },
    },
  ];
  
  // Export combined function definitions (original + marketing)
  export function getCombinedFunctionDefinitions(originalFunctions: any[]) {
    return [...originalFunctions, ...marketingFunctions];
  }