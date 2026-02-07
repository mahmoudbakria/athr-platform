export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface ActionState {
    success: boolean
    message?: string | null
    error?: string | null
}

export interface Item {
    id: string
    created_at: string
    title: string
    description: string | null
    city: string | null
    category_id: string | null
    image_url?: string | null
    images: string[]
    status: 'pending' | 'active' | 'rejected' | 'donated' | 'deleted'
    user_id?: string
    contact_phone?: string
    needs_repair: boolean
    is_urgent: boolean
    rejection_reason: string | null
    condition?: 'new' | 'like_new' | 'used' | null
    delivery_available?: boolean
    tags: string[] | null
    sub_category_id: number | null
    latitude?: number | null
    longitude?: number | null
    categories?: {
        name: string
        slug: string
    } | null
    sub_categories?: {
        name: string
    } | null
    profiles?: {
        id: string
        full_name: string | null
        avatar_url: string | null
    } | null
}

export interface SubCategory {
    id: number
    name: string
    category_id: string
    created_at: string
}

export interface Profile {
    id: string
    full_name: string | null
    role: 'admin' | 'moderator' | 'user'
    phone: string | null
    email?: string
    created_at: string
    points: number
    volunteer_points?: number
    avatar_url: string | null
    is_banned: boolean
    show_avatar?: boolean
}

export interface Category {
    id: string
    name: string
    icon: string | null
    slug: string
    item_count?: number
}

export interface SystemSetting {
    key: string
    value: boolean
}

export interface VolunteerDelivery {
    id: string
    user_id: string
    from_city: string
    to_city: string
    delivery_date: string
    delivery_time: string | null
    car_type: string
    max_weight_kg: number | null
    notes: string | null
    contact_phone?: string | null
    status: 'pending' | 'approved' | 'rejected' | 'cancelled'
    created_at: string
    profiles?: {
        full_name: string | null
        phone: string | null
        email?: string
        avatar_url?: string | null
    } | null
}
export interface AdminStats {
    growth: {
        date: string
        items: number
        users: number
        appeals: number
        volunteers: number
    }[]
    items_status: {
        status: string
        count: number
    }[]
    appeals_status: {
        status: string
        count: number
    }[]
    volunteers_status: {
        status: string
        count: number
    }[]
    categories: {
        name: string
        count: number
    }[]
}

export interface ProfileStats {
    totalDonated: number
    totalUploaded: number
    totalPoints: number
    volunteerPoints?: number
}

export interface GamificationConfig {
    enabled: boolean
    volunteerEnabled: boolean
    pointsPerUpload: number
    pointsPerDonation: number
    pointsPerVolunteer: number
}
