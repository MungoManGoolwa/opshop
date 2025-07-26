import { Link } from "wouter";
import { Recycle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Opshop Online</span>
            </div>
            <p className="text-gray-400 mb-4">
              Australia's most sustainable marketplace for pre-loved goods. Based in Goolwa, South Australia.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white">New Arrivals</Link></li>
              <li><a href="#" className="hover:text-white">Clothing</a></li>
              <li><a href="#" className="hover:text-white">Electronics</a></li>
              <li><a href="#" className="hover:text-white">Furniture</a></li>
              <li><a href="#" className="hover:text-white">Homewares</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Sell</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Start Selling</a></li>
              <li><Link href="/seller/dashboard" className="hover:text-white">Seller Dashboard</Link></li>
              <li><a href="#" className="hover:text-white">Pricing Guide</a></li>
              <li><a href="#" className="hover:text-white">Shipping Guide</a></li>
              <li><a href="#" className="hover:text-white">Seller Success Tips</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Opshop Online. All rights reserved. ABN: 12 345 678 901
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Secure payments powered by</span>
            <div className="flex space-x-2">
              <div className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-semibold">
                Stripe
              </div>
              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                PayPal
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
