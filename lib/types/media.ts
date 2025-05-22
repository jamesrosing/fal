export interface MediaAsset {
id: string;
public_id: string;
type: 'image' | 'video';
title?: string;
alt_text?: string;
width?: number;
height?: number;
format?: string;
tags?: string[];
metadata?: Record<string, any>;
created_at: string;
updated_at: string;
url?: string;
secure_url?: string;
}

export interface Gallery {
id: string;
name: string;
slug: string;
description?: string;
cover_image?: string;
created_at: string;
updated_at: string;
}

export interface Album {
id: string;
gallery_id: string;
name: string;
slug: string;
description?: string;
cover_image?: string;
created_at: string;
updated_at: string;
}

export interface Case {
id: string;
album_id: string;
title: string;
slug: string;
description?: string;
cover_image?: string;
before_image?: string;
after_image?: string;
procedure_date?: string;
created_at: string;
updated_at: string;
metadata?: Record<string, any>;
}

export interface MediaUploadResult {
asset: MediaAsset;
error?: string | null;
}

export interface CloudinaryUploadParams {
file: File;
folder?: string;
publicId?: string;
tags?: string[];
resourceType?: 'image' | 'video' | 'raw' | 'auto';
transformation?: any[];
}

export interface MediaSearchParams {
type?: 'image' | 'video' | 'all';
tags?: string[];
search?: string;
folder?: string;
page?: number;
limit?: number;
}