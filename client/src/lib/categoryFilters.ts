/**
 * Category-specific filter configurations
 * Defines which filters are available for each category
 */

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  type: 'select' | 'range' | 'multiselect' | 'boolean';
  label: string;
  field: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface CategoryFilters {
  [categorySlug: string]: FilterConfig[];
}

// General filters available to all categories
export const generalFilters: FilterConfig[] = [
  {
    type: 'range',
    label: 'Price Range',
    field: 'price',
    min: 0,
    max: 10000,
    step: 10,
    unit: '$'
  },
  {
    type: 'select',
    label: 'Condition',
    field: 'condition',
    options: [
      { label: 'New', value: 'new' },
      { label: 'Excellent', value: 'excellent' },
      { label: 'Good', value: 'good' },
      { label: 'Fair', value: 'fair' }
    ]
  },
  {
    type: 'select',
    label: 'Brand',
    field: 'brand',
    options: [] // Will be populated dynamically from database
  },
  {
    type: 'select',
    label: 'Color',
    field: 'color',
    options: [
      { label: 'Black', value: 'black' },
      { label: 'White', value: 'white' },
      { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' },
      { label: 'Green', value: 'green' },
      { label: 'Yellow', value: 'yellow' },
      { label: 'Orange', value: 'orange' },
      { label: 'Purple', value: 'purple' },
      { label: 'Pink', value: 'pink' },
      { label: 'Brown', value: 'brown' },
      { label: 'Grey', value: 'grey' },
      { label: 'Silver', value: 'silver' },
      { label: 'Gold', value: 'gold' }
    ]
  }
];

// Category-specific filter configurations
export const categoryFilters: CategoryFilters = {
  // Clothing & Fashion
  'clothing-fashion': [
    {
      type: 'select',
      label: 'Size',
      field: 'clothingSize',
      options: [
        { label: 'XS', value: 'xs' },
        { label: 'S', value: 's' },
        { label: 'M', value: 'm' },
        { label: 'L', value: 'l' },
        { label: 'XL', value: 'xl' },
        { label: 'XXL', value: 'xxl' },
        { label: '6', value: '6' },
        { label: '8', value: '8' },
        { label: '10', value: '10' },
        { label: '12', value: '12' },
        { label: '14', value: '14' },
        { label: '16', value: '16' },
        { label: '18', value: '18' }
      ]
    },
    {
      type: 'select',
      label: 'Gender',
      field: 'clothingGender',
      options: [
        { label: 'Men', value: 'men' },
        { label: 'Women', value: 'women' },
        { label: 'Unisex', value: 'unisex' },
        { label: 'Kids', value: 'kids' }
      ]
    },
    {
      type: 'select',
      label: 'Type',
      field: 'clothingType',
      options: [
        { label: 'Shirt', value: 'shirt' },
        { label: 'Pants', value: 'pants' },
        { label: 'Dress', value: 'dress' },
        { label: 'Jacket', value: 'jacket' },
        { label: 'Shoes', value: 'shoes' },
        { label: 'Accessories', value: 'accessories' }
      ]
    },
    {
      type: 'select',
      label: 'Material',
      field: 'material',
      options: [
        { label: 'Cotton', value: 'cotton' },
        { label: 'Polyester', value: 'polyester' },
        { label: 'Wool', value: 'wool' },
        { label: 'Silk', value: 'silk' },
        { label: 'Denim', value: 'denim' },
        { label: 'Leather', value: 'leather' }
      ]
    }
  ],

  // Electronics
  'electronics': [
    {
      type: 'select',
      label: 'Storage Capacity',
      field: 'storageCapacity',
      options: [
        { label: '32GB', value: '32gb' },
        { label: '64GB', value: '64gb' },
        { label: '128GB', value: '128gb' },
        { label: '256GB', value: '256gb' },
        { label: '512GB', value: '512gb' },
        { label: '1TB', value: '1tb' },
        { label: '2TB', value: '2tb' }
      ]
    },
    {
      type: 'select',
      label: 'Screen Size',
      field: 'screenSize',
      options: [
        { label: '13 inch', value: '13"' },
        { label: '15 inch', value: '15"' },
        { label: '17 inch', value: '17"' },
        { label: '24 inch', value: '24"' },
        { label: '27 inch', value: '27"' },
        { label: '32 inch', value: '32"' }
      ]
    },
    {
      type: 'multiselect',
      label: 'Connectivity',
      field: 'connectivity',
      options: [
        { label: 'WiFi', value: 'wifi' },
        { label: 'Bluetooth', value: 'bluetooth' },
        { label: 'Cellular', value: 'cellular' },
        { label: 'USB-C', value: 'usb-c' },
        { label: 'HDMI', value: 'hdmi' }
      ]
    }
  ],

  // Vehicles
  'vehicles': [
    {
      type: 'select',
      label: 'Make',
      field: 'make',
      options: [
        { label: 'Toyota', value: 'toyota' },
        { label: 'Ford', value: 'ford' },
        { label: 'Holden', value: 'holden' },
        { label: 'Mazda', value: 'mazda' },
        { label: 'Hyundai', value: 'hyundai' },
        { label: 'Nissan', value: 'nissan' },
        { label: 'Volkswagen', value: 'volkswagen' },
        { label: 'BMW', value: 'bmw' },
        { label: 'Mercedes-Benz', value: 'mercedes-benz' },
        { label: 'Audi', value: 'audi' }
      ]
    },
    {
      type: 'range',
      label: 'Year',
      field: 'year',
      min: 1990,
      max: new Date().getFullYear() + 1,
      step: 1
    },
    {
      type: 'range',
      label: 'Kilometers',
      field: 'kilometers',
      min: 0,
      max: 500000,
      step: 5000,
      unit: 'km'
    },
    {
      type: 'select',
      label: 'Fuel Type',
      field: 'fuelType',
      options: [
        { label: 'Petrol', value: 'petrol' },
        { label: 'Diesel', value: 'diesel' },
        { label: 'Electric', value: 'electric' },
        { label: 'Hybrid', value: 'hybrid' },
        { label: 'LPG', value: 'lpg' }
      ]
    },
    {
      type: 'select',
      label: 'Transmission',
      field: 'transmission',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Automatic', value: 'automatic' },
        { label: 'CVT', value: 'cvt' }
      ]
    },
    {
      type: 'select',
      label: 'Body Type',
      field: 'bodyType',
      options: [
        { label: 'Sedan', value: 'sedan' },
        { label: 'Hatchback', value: 'hatchback' },
        { label: 'SUV', value: 'suv' },
        { label: 'Wagon', value: 'wagon' },
        { label: 'Coupe', value: 'coupe' },
        { label: 'Convertible', value: 'convertible' },
        { label: 'Ute', value: 'ute' },
        { label: 'Van', value: 'van' }
      ]
    },
    {
      type: 'select',
      label: 'Drivetrain',
      field: 'drivetrain',
      options: [
        { label: 'Front Wheel Drive (FWD)', value: 'fwd' },
        { label: 'Rear Wheel Drive (RWD)', value: 'rwd' },
        { label: 'All Wheel Drive (AWD)', value: 'awd' },
        { label: '4WD', value: '4wd' }
      ]
    }
  ],

  // Home & Garden
  'home-garden': [
    {
      type: 'select',
      label: 'Room Type',
      field: 'roomType',
      options: [
        { label: 'Bedroom', value: 'bedroom' },
        { label: 'Living Room', value: 'living-room' },
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Bathroom', value: 'bathroom' },
        { label: 'Dining Room', value: 'dining-room' },
        { label: 'Office', value: 'office' },
        { label: 'Garden', value: 'garden' },
        { label: 'Garage', value: 'garage' }
      ]
    },
    {
      type: 'select',
      label: 'Furniture Type',
      field: 'furnitureType',
      options: [
        { label: 'Chair', value: 'chair' },
        { label: 'Table', value: 'table' },
        { label: 'Bed', value: 'bed' },
        { label: 'Sofa', value: 'sofa' },
        { label: 'Wardrobe', value: 'wardrobe' },
        { label: 'Bookshelf', value: 'bookshelf' },
        { label: 'Desk', value: 'desk' }
      ]
    },
    {
      type: 'boolean',
      label: 'Assembly Required',
      field: 'assemblyRequired'
    }
  ],

  // Sports & Recreation
  'sports-recreation': [
    {
      type: 'select',
      label: 'Sport Type',
      field: 'sportType',
      options: [
        { label: 'Football', value: 'football' },
        { label: 'Tennis', value: 'tennis' },
        { label: 'Cricket', value: 'cricket' },
        { label: 'Basketball', value: 'basketball' },
        { label: 'Cycling', value: 'cycling' },
        { label: 'Swimming', value: 'swimming' },
        { label: 'Golf', value: 'golf' },
        { label: 'Fitness', value: 'fitness' }
      ]
    },
    {
      type: 'select',
      label: 'Activity Level',
      field: 'activityLevel',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'Professional', value: 'professional' }
      ]
    },
    {
      type: 'select',
      label: 'Equipment Type',
      field: 'equipmentType',
      options: [
        { label: 'Racket', value: 'racket' },
        { label: 'Ball', value: 'ball' },
        { label: 'Protective Gear', value: 'protective' },
        { label: 'Apparel', value: 'apparel' },
        { label: 'Accessories', value: 'accessories' }
      ]
    }
  ],

  // Books & Media
  'books-media': [
    {
      type: 'select',
      label: 'Format',
      field: 'format',
      options: [
        { label: 'Hardcover', value: 'hardcover' },
        { label: 'Paperback', value: 'paperback' },
        { label: 'eBook', value: 'ebook' },
        { label: 'Audiobook', value: 'audiobook' },
        { label: 'DVD', value: 'dvd' },
        { label: 'Blu-ray', value: 'bluray' },
        { label: 'CD', value: 'cd' },
        { label: 'Vinyl', value: 'vinyl' }
      ]
    },
    {
      type: 'select',
      label: 'Genre',
      field: 'genre',
      options: [
        { label: 'Fiction', value: 'fiction' },
        { label: 'Non-Fiction', value: 'non-fiction' },
        { label: 'Biography', value: 'biography' },
        { label: 'History', value: 'history' },
        { label: 'Science', value: 'science' },
        { label: 'Technology', value: 'technology' },
        { label: 'Self-Help', value: 'self-help' },
        { label: 'Children', value: 'children' }
      ]
    },
    {
      type: 'range',
      label: 'Publication Year',
      field: 'publicationYear',
      min: 1900,
      max: new Date().getFullYear(),
      step: 1
    },
    {
      type: 'select',
      label: 'Language',
      field: 'language',
      options: [
        { label: 'English', value: 'english' },
        { label: 'Spanish', value: 'spanish' },
        { label: 'French', value: 'french' },
        { label: 'German', value: 'german' },
        { label: 'Italian', value: 'italian' },
        { label: 'Chinese', value: 'chinese' },
        { label: 'Japanese', value: 'japanese' }
      ]
    }
  ],

  // Baby & Kids
  'baby-kids': [
    {
      type: 'select',
      label: 'Age Range',
      field: 'ageRange',
      options: [
        { label: '0-6 months', value: '0-6m' },
        { label: '6-12 months', value: '6-12m' },
        { label: '1-2 years', value: '1-2y' },
        { label: '2-4 years', value: '2-4y' },
        { label: '4-6 years', value: '4-6y' },
        { label: '6-8 years', value: '6-8y' },
        { label: '8-12 years', value: '8-12y' },
        { label: '12+ years', value: '12+y' }
      ]
    },
    {
      type: 'select',
      label: 'Educational Value',
      field: 'educationalValue',
      options: [
        { label: 'Motor Skills', value: 'motor-skills' },
        { label: 'Language', value: 'language' },
        { label: 'Math', value: 'math' },
        { label: 'Science', value: 'science' },
        { label: 'Creative', value: 'creative' },
        { label: 'Social', value: 'social' }
      ]
    }
  ],

  // Beauty & Health
  'beauty-health': [
    {
      type: 'select',
      label: 'Skin Type',
      field: 'skinType',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Dry', value: 'dry' },
        { label: 'Oily', value: 'oily' },
        { label: 'Combination', value: 'combination' },
        { label: 'Sensitive', value: 'sensitive' }
      ]
    },
    {
      type: 'select',
      label: 'Hair Type',
      field: 'hairType',
      options: [
        { label: 'Straight', value: 'straight' },
        { label: 'Wavy', value: 'wavy' },
        { label: 'Curly', value: 'curly' },
        { label: 'Coily', value: 'coily' }
      ]
    }
  ]
};

// Sorting options
export const sortOptions: FilterOption[] = [
  { label: 'Most Recent', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'views_desc' },
  { label: 'A-Z', value: 'title_asc' },
  { label: 'Z-A', value: 'title_desc' }
];

/**
 * Get filters for a specific category
 */
export function getFiltersForCategory(categorySlug: string): FilterConfig[] {
  const specificFilters = categoryFilters[categorySlug] || [];
  return [...generalFilters, ...specificFilters];
}

/**
 * Build query parameters from filter values
 */
export function buildFilterQuery(filters: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value.toString());
      }
    }
  });
  
  return params;
}

/**
 * Parse filter values from URL search params
 */
export function parseFilterQuery(searchParams: URLSearchParams): Record<string, any> {
  const filters: Record<string, any> = {};
  
  for (const [key, value] of searchParams.entries()) {
    if (filters[key]) {
      // Handle multiple values (convert to array)
      if (Array.isArray(filters[key])) {
        filters[key].push(value);
      } else {
        filters[key] = [filters[key], value];
      }
    } else {
      filters[key] = value;
    }
  }
  
  return filters;
}