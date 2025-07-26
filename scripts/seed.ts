import { db } from "../server/db";
import { categories, products, users } from "../shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Insert sample users first
  const userData = [
    {
      id: "sample-user-1",
      email: "seller1@example.com",
      firstName: "Alice",
      lastName: "Johnson",
      role: "seller",
      location: "Sydney, NSW",
      isVerified: true,
    },
    {
      id: "sample-user-2", 
      email: "seller2@example.com",
      firstName: "Bob",
      lastName: "Smith",
      role: "seller",
      location: "Melbourne, VIC",
      isVerified: true,
    },
    {
      id: "sample-user-3",
      email: "seller3@example.com", 
      firstName: "Carol",
      lastName: "Davis",
      role: "seller",
      location: "Brisbane, QLD",
      isVerified: false,
    },
    {
      id: "sample-user-4",
      email: "seller4@example.com",
      firstName: "David",
      lastName: "Wilson", 
      role: "business",
      location: "Perth, WA",
      isVerified: true,
    },
    {
      id: "sample-user-5",
      email: "seller5@example.com",
      firstName: "Emma",
      lastName: "Brown",
      role: "seller", 
      location: "Adelaide, SA",
      isVerified: true,
    },
  ];

  try {
    const insertedUsers = await db.insert(users).values(userData).returning();
    console.log(`Inserted ${insertedUsers.length} users`);
  } catch (error) {
    console.log("Users already exist, skipping...");
  }

  // Insert categories
  const categoryData = [
    { name: "New Arrivals", slug: "new-arrivals", description: "Latest items added to the marketplace", parentId: null, isActive: true },
    { name: "Fashion", slug: "fashion", description: "Clothing, shoes, and accessories", parentId: null, isActive: true },
    { name: "Electronics", slug: "electronics", description: "Phones, computers, and gadgets", parentId: null, isActive: true },
    { name: "Home & Garden", slug: "home-garden", description: "Furniture, decor, and garden items", parentId: null, isActive: true },
    { name: "Books & Media", slug: "books-media", description: "Books, DVDs, games, and more", parentId: null, isActive: true },
    { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Exercise equipment and outdoor gear", parentId: null, isActive: true },
    { name: "Kids & Baby", slug: "kids-baby", description: "Toys, clothes, and baby items", parentId: null, isActive: true },
    { name: "Vehicles", slug: "vehicles", description: "Cars, bikes, and automotive", parentId: null, isActive: true },
  ];

  try {
    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`Inserted ${insertedCategories.length} categories`);
  } catch (error) {
    console.log("Categories already exist, skipping...");
  }

  // Insert sample products
  const productData = [
    {
      title: "Vintage Leather Jacket",
      description: "Classic brown leather jacket in excellent condition. Perfect for autumn weather.",
      price: "120.00",
      originalPrice: "300.00",
      condition: "excellent",
      status: "available",
      categoryId: 2, // Fashion
      sellerId: "sample-user-1",
      brand: "Zara",
      size: "M",
      color: "Brown",
      material: "Leather",
      images: ["/placeholder-jacket.jpg"],
      location: "Sydney, NSW",
      shippingCost: "15.00",
      isVerified: true,
      views: 45,
      likes: 12,
    },
    {
      title: "iPhone 12 Pro",
      description: "Unlocked iPhone 12 Pro in space gray. Minor wear but fully functional.",
      price: "850.00",
      originalPrice: "1200.00",
      condition: "good",
      status: "available",
      categoryId: 3, // Electronics
      sellerId: "sample-user-2",
      brand: "Apple",
      size: "128GB",
      color: "Space Gray",
      material: "Glass/Aluminum",
      images: ["/placeholder-phone.jpg"],
      location: "Melbourne, VIC",
      shippingCost: "20.00",
      isVerified: true,
      views: 78,
      likes: 23,
    },
    {
      title: "Vintage Denim Jeans",
      description: "High-waisted vintage jeans from the 90s. Perfect fit and great condition.",
      price: "45.00",
      originalPrice: "90.00",
      condition: "good",
      status: "available",
      categoryId: 2, // Fashion
      sellerId: "sample-user-3",
      brand: "Levi's",
      size: "30",
      color: "Blue",
      material: "Denim",
      images: ["/placeholder-jeans.jpg"],
      location: "Brisbane, QLD",
      shippingCost: "12.00",
      isVerified: false,
      views: 32,
      likes: 8,
    },
    {
      title: "MacBook Air M1",
      description: "2020 MacBook Air with M1 chip. Excellent performance for work and study.",
      price: "1200.00",
      originalPrice: "1599.00",
      condition: "excellent",
      status: "available",
      categoryId: 3, // Electronics
      sellerId: "sample-user-4",
      brand: "Apple",
      size: "13-inch",
      color: "Silver",
      material: "Aluminum",
      images: ["/placeholder-laptop.jpg"],
      location: "Perth, WA",
      shippingCost: "25.00",
      isVerified: true,
      views: 156,
      likes: 42,
    },
    {
      title: "Designer Handbag",
      description: "Authentic designer handbag in pristine condition. Comes with authenticity certificate.",
      price: "280.00",
      originalPrice: "450.00",
      condition: "excellent",
      status: "available",
      categoryId: 2, // Fashion
      sellerId: "sample-user-5",
      brand: "Coach",
      size: "Medium",
      color: "Black",
      material: "Leather",
      images: ["/placeholder-handbag.jpg"],
      location: "Adelaide, SA",
      shippingCost: "18.00",
      isVerified: true,
      views: 89,
      likes: 25,
    },
  ];

  try {
    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`Inserted ${insertedProducts.length} products`);
  } catch (error) {
    console.log("Products already exist, skipping...");
  }

  console.log("Database seeded successfully!");
}

seed().catch(console.error);