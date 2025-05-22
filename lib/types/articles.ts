export interface Article {
id: string;
title: string;
slug: string;
content: string;
excerpt?: string;
featured_image?: string;
author_id?: string;
category_id: string;
status: 'draft' | 'published' | 'archived';
published_at?: string;
created_at: string;
updated_at: string;
tags?: string[];
metadata?: Record<string, any>;
seo?: {
title?: string;
description?: string;
keywords?: string[];
og_image?: string;
};
}

export interface ArticleCategory {
id: string;
name: string;
slug: string;
description?: string;
parent_id?: string;
created_at: string;
updated_at: string;
}

export interface ArticleTag {
id: string;
name: string;
slug: string;
created_at: string;
updated_at: string;
}

export interface Author {
id: string;
name: string;
bio?: string;
avatar?: string;
email?: string;
created_at: string;
updated_at: string;
}

export interface ArticleComment {
id: string;
article_id: string;
user_id: string;
content: string;
status: 'pending' | 'approved' | 'rejected';
created_at: string;
updated_at: string;
}

export interface ArticleSearchParams {
category?: string;
tag?: string;
search?: string;
author?: string;
status?: 'draft' | 'published' | 'archived';
page?: number;
limit?: number;
}