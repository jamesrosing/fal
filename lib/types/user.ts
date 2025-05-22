export interface User {
id: string;
email: string;
first_name?: string;
last_name?: string;
phone?: string;
avatar_url?: string;
role: 'user' | 'admin' | 'editor';
created_at: string;
updated_at: string;
last_login?: string;
}

export interface UserProfile {
id: string;
user_id: string;
bio?: string;
date_of_birth?: string;
address?: {
line1?: string;
line2?: string;
city?: string;
state?: string;
postal_code?: string;
country?: string;
};
preferences?: {
newsletter?: boolean;
marketing_emails?: boolean;
sms_notifications?: boolean;
};
created_at: string;
updated_at: string;
}

export interface Appointment {
id: string;
user_id: string;
service_id: string;
provider_id?: string;
status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
start_time: string;
end_time: string;
notes?: string;
created_at: string;
updated_at: string;
}

export interface Service {
id: string;
name: string;
description?: string;
duration: number; // in minutes
price?: number;
category_id?: string;
created_at: string;
updated_at: string;
}

export interface Provider {
id: string;
name: string;
title?: string;
bio?: string;
avatar_url?: string;
specialties?: string[];
created_at: string;
updated_at: string;
}