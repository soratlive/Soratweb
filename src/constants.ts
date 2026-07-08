import { 
  Wind, 
  Umbrella, 
  Target, 
  Sun, 
  Flower2, 
  Lamp, 
  Bug, 
  Bird, 
  Footprints, 
  Cloud, 
  Database,
  Milk
} from 'lucide-react';

export const GAME_SLOTS = [
  { 
    id: 1, 
    name: 'पतंग', 
    icon: Wind, 
    color: 'text-blue-400',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/patang.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9wYXRhbmcuanBnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MzEwNDAzMiwiZXhwIjozMzMxOTEwNDAzMn0.Rx73DjInxdu_Jj_FOyKVv6XmRLzQcLKTp8NW_T4ilU0'
  },
  { 
    id: 2, 
    name: 'छत्री', 
    icon: Umbrella, 
    color: 'text-pink-400',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/chhatri.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9jaGhhdHJpLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMxMDM4MTksImV4cCI6MzMzMTkxMDM4MTl9.qskstM78lgL05sO-2IMnJyRNdp29651zBbjwj6y9otc'
  },
  { 
    id: 3, 
    name: 'बॉल', 
    icon: Target, 
    color: 'text-red-400',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/ball.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9iYWxsLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMxMDM3NTksImV4cCI6MzMzMTkxMDM3NTl9.mpvDdORluORcgQuiubtUY0cMAbGHMQwmvTPHAEbt19Y'
  },
  { 
    id: 4, 
    name: 'सूर्य', 
    icon: Sun, 
    color: 'text-yellow-400',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/surya.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3Jhd \/zdXJ5YS5qcGciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzMTA0MDc5LCJleHAiOjMzMzE5MTA0MDc5fQ.QHpRA1pBROMTh1pf8SQM_Ff7f7BvIBGzeXnryiYxlU8'
  },
  { 
    id: 5, 
    name: 'फूल', 
    icon: Flower2, 
    color: 'text-rose-400',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/flower.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9mbG93ZXIud2VicCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMxMDM5MjAsImV4cCI6MzMzMTkxMDM5MjB9.3vCvwhlb-EWmZM-duF6_E4a_oG7hY10cjwoopiYrgXE'
  },
  { 
    id: 6, 
    name: 'दिवा', 
    icon: Lamp, 
    color: 'text-orange-400',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/diva.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9kaXZhLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMxMDM4ODksImV4cCI6MzMzMTkxMDM4ODl9.xDMAuDfMhnZVeFLXVY7piHJpVUGBTczYYLGuXdTyGus'
  },
  { 
    id: 7, 
    name: 'फुलपाखरू', 
    icon: Bug, 
    color: 'text-purple-400',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/fulpakharu.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9mdWxwYWtoYXJ1LmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMxMDM5NTYsImV4cCI6MzMzMTkxMDM5NTZ9.XzfKh_9aKyxl_gxaK66b7nJZJC2xeYXJBDDVuErOQd4'
  },
  { 
    id: 8, 
    name: 'चिमणी', 
    icon: Bird, 
    color: 'text-sky-400',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/chimani.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9jaGltYW5pLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMxMDM4NTQsImV4cCI6MzMzMTkxMDM4NTR9.dVNj_X61hKwOXBhGeqhDASkzKmVRTCxRTahqQhPa2dA'
  },
  { 
    id: 9, 
    name: 'ससा', 
    icon: Footprints, 
    color: 'text-gray-300',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/sasaa.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9zYXNhYS5qcGciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzMTA0MDU2LCJleHAiOjMzMzE5MTA0MDU2fQ.RVV2FaoJXmhFGSJ7AxBgrpk6AKnpnu3hWNwz6EcHdew'
  },
  { 
    id: 10, 
    name: 'बकीट', 
    icon: Cloud, 
    color: 'text-white',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/bakit.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9iYWtpdC5qcGciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzMTAzNjgzLCJleHAiOjMzMzE5MTAzNjgzfQ.7VHLulVbuDldLjtukKT7lD7AOZ5-fMtu29cJRzGtJH8'
  },
  { 
    id: 11, 
    name: 'भोवरा', 
    icon: Database, 
    color: 'text-amber-600',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/bhovara.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9iaG92YXJhLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMxMDM3ODgsImV4cCI6MzMzMTkxMDM3ODh9.k5VWLsHPfx04TqRl1Z37qTpFn5_JuNM2BN0vzJkyTkA'
  },
  { 
    id: 12, 
    name: 'गाय', 
    icon: Milk, 
    color: 'text-green-200',
    imageUrl: 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/gaay.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9nYWF5LmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMxMDM5OTYsImV4cCI6MzMzMTkxMDM5OTZ9.YJElPcvz_dCx8zCnyo39BfdTIJw4iGC1ZElFGIXrF-4'
  },
];

export const INITIAL_BALANCE = 5000;
export const MULTIPLIER = 10;
export const CYCLE_DURATION = 30; // seconds
export const LOCK_DURATION = 5; // last 5 seconds

export const DEFAULT_LOGO_URL = 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/Untitled%20design%20(2).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9VbnRpdGxlZCBkZXNpZ24gKDIpLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODM1NDE0MjUsImV4cCI6MzMzMTk1NDE0MjV9.r-rWHLq2Iv8WASSCJi92-TOYYikqwAH3Ij9M2eDrmYY';

