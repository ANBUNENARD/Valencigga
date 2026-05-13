/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X, ArrowRight, Star, Instagram, Twitter, Facebook } from 'lucide-react';
import { cn } from './lib/utils';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, query, getDocs, limit, setDoc, doc, serverTimestamp } from 'firebase/firestore';

// --- Types ---
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  featured?: boolean;
}

// --- Components ---

const AnnouncementBar = () => (
  <div className="bg-black text-brand-gold text-[10px] tracking-[0.2em] uppercase py-2.5 flex justify-center items-center font-semibold z-[60] relative">
    Free worldwide shipping on all limited collections — Join the VIP list
  </div>
);

const Navbar = ({ cartCount, onCartClick }: { cartCount: number; onCartClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsub();
    };
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request') {
        console.warn("Login popup was closed before completion.");
      } else if (err.code === 'auth/popup-blocked') {
        alert("The login popup was blocked by your browser. Please enable popups for this site.");
      } else {
        console.error("Login error:", err);
      }
    }
  };
  const logout = () => signOut(auth);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 lg:px-12 flex flex-col",
      isScrolled ? "bg-brand-cream/90 backdrop-blur-md border-b border-black/10" : "bg-transparent"
    )}>
      <AnnouncementBar />
      <div className="flex items-baseline justify-between py-6 w-full">
        <div className="flex items-center gap-10 text-[11px] uppercase tracking-[0.2em] font-bold">
          <a href="#shop" className="border-b border-black pb-0.5">Shop</a>
          <a href="#collections" className="opacity-40 hover:opacity-100 transition-opacity hidden md:block">Collections</a>
          <a href="#about" className="opacity-40 hover:opacity-100 transition-opacity hidden md:block">Heritage</a>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-xl lg:text-3xl font-serif tracking-[0.2em] text-brand-dark font-bold uppercase">VALLENCIGGA</h1>
        </div>

        <div className="flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-bold">
          {user ? (
            <button onClick={logout} className="opacity-40 hover:opacity-100 transition-opacity hidden md:block">
              Logout
            </button>
          ) : (
            <button onClick={login} className="opacity-40 hover:opacity-100 transition-opacity hidden md:block">
              Members
            </button>
          )}
          <button 
            onClick={onCartClick}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <span className="opacity-40">Cart</span>
            <span className="font-serif">({cartCount.toString().padStart(2, '0')})</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col pt-24">
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[700px] border-b border-black/10">
        {/* Left Column: Editorial Headline */}
        <div className="md:col-span-7 flex flex-col justify-center px-6 lg:px-20 relative py-12">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] tracking-[0.5em] uppercase text-black/40 font-bold whitespace-nowrap hidden lg:block">
            Maison Vallencigga / Est. 2026
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-brand-gold">The New Presence</p>
            <h2 className="text-[60px] md:text-[90px] xl:text-[120px] font-serif leading-[0.85] tracking-tighter uppercase font-bold text-brand-dark">
              Luxury <br/>
              Redefined
            </h2>
            <p className="max-w-sm text-sm md:text-base leading-relaxed text-black/70 pt-8">
              Crafted from premium Italian pebble leather. A minimalist statement in high-status street fashion. Designed for those who define the room before entering it.
            </p>
            <div className="pt-12 flex flex-col sm:flex-row items-center gap-12">
              <button className="w-full sm:w-auto bg-black text-white px-12 py-6 text-[12px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 transition-all shadow-xl">
                Explore The Drop
              </button>
              <button className="text-[11px] border-b border-black py-1 uppercase tracking-[0.2em] font-bold hover:opacity-50 transition-opacity">
                View Lookbook
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Product Spotlight */}
        <div className="md:col-span-5 bg-white border-l border-black/5 flex flex-col relative py-12 md:py-0 overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-8 md:p-12">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
               animate={{ opacity: 1, scale: 1, rotate: 0 }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="w-full aspect-[4/5] bg-brand-beige relative flex flex-col items-center justify-center shadow-3xl"
            >
                <div className="absolute inset-0 border-[24px] border-white/20"></div>
                <img 
                  src="https://images.unsplash.com/photo-1584917469277-33008b479261?q=80&w=2000&auto=format&fit=crop" 
                  alt="Featured Bag"
                  className="w-[80%] h-[80%] object-contain drop-shadow-2xl brightness-90 hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-10 right-10 text-right">
                    <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Model: V-01 Noir</p>
                    <p className="text-2xl font-serif text-brand-dark italic">$2,450</p>
                </div>
            </motion.div>
          </div>

          {/* Scarcity Feature Box */}
          <div className="absolute top-20 left-0 -translate-x-1/2 z-20">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="bg-black text-brand-gold p-8 shadow-2xl skew-x-[-2deg]"
            >
                <p className="text-[10px] tracking-[0.3em] uppercase mb-1 font-bold">Inventory Status</p>
                <p className="text-3xl font-serif text-white italic">Only 05 Left</p>
            </motion.div>
          </div>

          <div className="p-12 pt-0 grid grid-cols-2 gap-4 hidden md:grid">
            <div className="border border-black/5 p-5 text-center bg-brand-cream/50">
                <p className="text-[9px] uppercase tracking-widest opacity-40 mb-1 font-bold">Material</p>
                <p className="text-[11px] font-bold uppercase text-brand-dark">Pebble Leather</p>
            </div>
            <div className="border border-black/5 p-5 text-center bg-brand-cream/50">
                <p className="text-[9px] uppercase tracking-widest opacity-40 mb-1 font-bold">Hardware</p>
                <p className="text-[11px] font-bold uppercase text-brand-dark">Brushed Silver</p>
            </div>
          </div>
        </div>
      </main>

      {/* Ticker Section */}
      <div className="h-24 md:h-32 bg-brand-cream border-b border-black/10 grid grid-cols-1 md:grid-cols-4">
        <div className="border-r border-black/10 flex items-center justify-center gap-4 px-8 hidden md:flex">
            <div className="w-10 h-10 rounded-full bg-brand-beige overflow-hidden">
               <img src="https://i.pravatar.cc/150?u=elena" alt="Elena" className="w-full h-full object-cover grayscale" />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-tighter">@ElenaFay Approved</p>
                <p className="text-[9px] opacity-40 italic uppercase tracking-widest">Elite Series Feature</p>
            </div>
        </div>
        <div className="md:col-span-2 flex items-center px-12 overflow-hidden bg-white/50">
            <div className="flex items-center gap-16 whitespace-nowrap animate-marquee">
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-30">The Mono Collection</span>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-brand-gold">Sold out in Paris</span>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-30">New York Flagship Drop 12.12</span>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold">Limit 01 per client</span>
                {/* Repetition for marquee effect */}
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-30">The Mono Collection</span>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-brand-gold">Sold out in Paris</span>
            </div>
        </div>
        <div className="bg-black text-white flex items-center justify-center flex-col px-8">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-brand-gold/70">Next Release In</p>
            <p className="text-2xl font-serif italic text-white tracking-widest">02 : 14 : 55</p>
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({ product, onAdd }: { product: Product; onAdd: (p: Product) => void; key?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-beige mb-6 border border-black/5 p-4">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-x-8 bottom-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <button 
            onClick={() => onAdd(product)}
            className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 shadow-2xl"
          >
            Reserve Now
          </button>
        </div>
      </div>
      <div className="flex justify-between items-start px-2">
        <div>
          <h3 className="text-brand-dark text-xs uppercase tracking-[0.1em] mb-1 font-bold group-hover:opacity-50 transition-opacity">
            {product.name}
          </h3>
          <p className="text-brand-dark/40 text-[9px] uppercase tracking-widest font-bold">{product.category}</p>
        </div>
        <span className="text-brand-dark text-sm font-serif italic">${product.price}</span>
      </div>
    </motion.div>
  );
};

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-20">
    <div className="flex flex-col gap-4">
      <span className="text-[11px] uppercase tracking-[0.5em] text-brand-gold font-bold">{subtitle}</span>
      <h2 className="text-4xl md:text-7xl font-serif text-brand-dark font-bold uppercase tracking-tight leading-none italic">
        {title}
      </h2>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'The Noir Tote',
      price: 1250,
      description: 'Sleek black architectural tote in full-grain leather.',
      category: 'Handbags',
      images: ['https://images.unsplash.com/photo-1584917469277-33008b479261?q=80&w=2000&auto=format&fit=crop'],
      featured: true
    },
    {
      id: '2',
      name: 'Argento Pouch',
      price: 850,
      description: 'Metallic silver evening clutch with magnetic closure.',
      category: 'Clutches',
      images: ['https://images.unsplash.com/photo-1566150905458-1bf1fd111c36?q=80&w=2000&auto=format&fit=crop'],
      featured: true
    },
    {
      id: '3',
      name: 'Eclipse Crossbody',
      price: 950,
      description: 'Round minimalist crossbody for modern essentials.',
      category: 'Crossbody',
      images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=2000&auto=format&fit=crop'],
      featured: true
    },
    {
      id: '4',
      name: 'Titan Duffle',
      price: 1800,
      description: 'Premium travel companion designed for the elite enthusiast.',
      category: 'Travel',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2000&auto=format&fit=crop'],
      featured: true
    }
  ];

  const seedDatabase = async () => {
    if (!auth.currentUser) {
      alert("Please login first.");
      return;
    }
    setIsSeeding(true);
    try {
      for (const p of mockProducts) {
        const { id, ...data } = p;
        const path = `products/${id}`;
        try {
          await setDoc(doc(db, 'products', id), {
            ...data,
            stock: 10,
            material: 'Premium Leather',
            createdAt: serverTimestamp() // Use server timestamp to match rules better if checked
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
      alert('Database seeded successfully. Refreshing...');
      window.location.reload();
    } catch (e: any) {
      console.error("Seeding failed:", e);
      alert(`Seeding failed: ${e.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const path = 'products';
      try {
        const q = query(collection(db, path), limit(10));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        if (fetched.length === 0) {
           console.warn("Firestore 'products' collection is empty. Falling back to mock data.");
           setProducts(mockProducts);
        } else {
           setProducts(fetched);
        }
      } catch (e) {
        console.warn("Using mock data as database is restricted or inaccessible:", e);
        // We log the error but don't re-throw to allow fallback
        try {
          handleFirestoreError(e, OperationType.LIST, path);
        } catch (loggedErr) {
          // Error is already logged by handleFirestoreError
        }
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (p: Product) => {
    setCart([...cart, p]);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(p => p.id !== id));
  };

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const cartTotal = cart.reduce((acc, curr) => acc + curr.price, 0);

  const handleCheckout = () => {
    setIsCheckoutLoading(true);
    // Simulate payment gateway
    setTimeout(() => {
      setIsCheckoutLoading(false);
      setCheckoutSuccess(true);
      setCart([]);
    }, 2000);
  };

  return (
    <div className="bg-brand-cream min-h-screen text-brand-dark font-sans selection:bg-brand-gold selection:text-black">
      <Navbar cartCount={cart.length} onCartClick={() => {
        setCheckoutSuccess(false);
        setIsCartOpen(true);
      }} />
      
      <main>
        <Hero />
        {/* Admin Badge */}
        {auth.currentUser?.email === 'ljcayco@gmail.com' && (
          <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
            <button 
              onClick={seedDatabase}
              disabled={isSeeding}
              className="bg-brand-gold text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-2xl skew-x-[-10deg] hover:bg-white transition-colors disabled:opacity-50"
            >
              {isSeeding ? 'Seeding...' : 'Seed Data'}
            </button>
            <div className="bg-black text-brand-gold px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-2xl skew-x-[-10deg] flex items-center gap-2 border border-brand-gold/30">
              <Star size={10} fill="currentColor" /> System Admin
            </div>
          </div>
        )}

        {/* Featured Section */}
        <section id="shop" className="py-32 px-6 lg:px-20">
          <div className="container mx-auto">
            <SectionHeader title="Editorial Selects" subtitle="Automne / Hiver 2026" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
              {products.map(p => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          </div>
        </section>

        {/* Brand Story Section */}
        <section id="about" className="py-40 px-6 lg:px-20 border-t border-black/5 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 hidden lg:block select-none opacity-5">
             <h2 className="text-[300px] font-serif font-bold uppercase leading-none tracking-tighter">Maison</h2>
          </div>
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <SectionHeader title="The Heritage" subtitle="Craftsmanship" />
              <p className="text-lg md:text-2xl text-brand-dark/80 leading-relaxed max-w-2xl font-serif italic mb-16">
                "Our pieces do not just carry your belongings; they curate your atmosphere. 
                VALLENCIGGA signifies a distinct departure from the generic—a minimalist 
                manifesto in high-status architectural fashion."
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 border-t border-black/10 pt-16">
                <div>
                  <h4 className="text-brand-dark text-[11px] uppercase tracking-[0.3em] font-bold mb-4">Mastery</h4>
                  <p className="text-black/50 text-xs leading-relaxed uppercase tracking-wider font-medium">Italian architectural leather. Hand-stitched precision.</p>
                </div>
                <div>
                  <h4 className="text-brand-dark text-[11px] uppercase tracking-[0.3em] font-bold mb-4">Preservation</h4>
                  <p className="text-black/50 text-xs leading-relaxed uppercase tracking-wider font-medium">Sustainable tanning processes with zero toxic runoff.</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative aspect-[4/5] bg-brand-beige overflow-hidden shadow-3xl"
            >
               <div className="absolute inset-0 border-[30px] border-white/30 z-20" />
               <img 
                src="https://images.unsplash.com/photo-1549439602-43ebcb232811?q=80&w=2070&auto=format&fit=crop" 
                alt="Craftsmanship" 
                className="w-full h-full object-cover grayscale transition-transform duration-[2000ms] hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </section>

        {/* Instagam Gallery */}
        <section className="py-32 px-6 lg:px-20 bg-brand-cream overflow-hidden border-t border-black/5">
           <div className="flex items-end justify-between mb-20">
             <div>
                <h3 className="text-[11px] uppercase tracking-[0.5em] text-brand-gold font-bold mb-4">Elite Community</h3>
                <h2 className="text-4xl font-serif italic text-brand-dark lowercase tracking-tight italic">@VALLENCIGGA_OFFICIAL</h2>
             </div>
             <a href="#" className="text-[11px] uppercase tracking-widest border-b border-black font-bold pb-2 hover:opacity-50 transition-all">View Gallery</a>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-square bg-brand-beige group relative cursor-pointer overflow-hidden shadow-sm">
                   <img 
                    src={`https://picsum.photos/seed/editorial-${i}/800/800`} 
                    alt="Instagram post" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 grayscale hover:grayscale-0 duration-700"
                    referrerPolicy="no-referrer"
                   />
                   <div className="absolute inset-0 bg-brand-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
           </div>
        </section>
      </main>

      <footer className="py-32 px-6 lg:px-20 bg-black text-white selection:bg-brand-gold selection:text-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 mb-32">
            <div className="lg:col-span-5">
              <h2 className="text-4xl font-serif tracking-[0.3em] font-bold mb-12 text-white uppercase">VALLENCIGGA</h2>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed mb-12 font-medium tracking-wide">
                Subscribe to receive early access to limited edition drops, invitations to exclusive events, 
                and private collection previews within the Maison.
              </p>
              <div className="flex max-w-sm border-b border-white/20 pb-4 focus-within:border-brand-gold transition-colors">
                <input 
                  type="email" 
                  placeholder="The VIP List (Email Address)" 
                  className="bg-transparent border-none text-xs flex-grow outline-none placeholder:text-white/30 uppercase tracking-widest font-bold"
                />
                <button className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold">Subscribe</button>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <h4 className="text-[11px] uppercase tracking-[0.5em] font-bold text-brand-gold mb-10">Maison</h4>
              <ul className="space-y-6 text-[11px] tracking-[0.2em] font-medium uppercase">
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">The Heritage</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Craftsmanship</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Sustainability</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-[11px] uppercase tracking-[0.5em] font-bold text-brand-gold mb-10">Client Care</h4>
              <ul className="space-y-6 text-[11px] tracking-[0.2em] font-medium uppercase">
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Concierge</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Size Guide</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-[11px] uppercase tracking-[0.5em] font-bold text-brand-gold mb-10">Archives</h4>
              <div className="flex gap-8 items-center">
                <Instagram size={20} strokeWidth={1.5} className="text-white/40 hover:text-white cursor-pointer transition-colors" />
                <Twitter size={20} strokeWidth={1.5} className="text-white/40 hover:text-white cursor-pointer transition-colors" />
                <Facebook size={20} strokeWidth={1.5} className="text-white/40 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-16 border-t border-white/5 gap-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">© 2026 VALLENCIGGA LUXURY • ARCHITECTURAL APPAREL</p>
            <div className="flex gap-12 text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">
               <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-screen w-full md:w-[500px] bg-brand-cream z-[120] p-10 lg:p-16 shadow-3xl text-brand-dark flex flex-col border-l border-black/10"
            >
              <div className="flex items-center justify-between mb-16">
                <div>
                  <h2 className="text-2xl font-serif italic tracking-tight font-bold mb-1 italic">Maison Bag</h2>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-black/30 font-bold">Volume / ({cart.length})</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="hover:opacity-50 transition-opacity p-2 border border-black/5">
                  <X size={24} strokeWidth={1} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto space-y-12 no-scrollbar pr-2">
                {checkoutSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center gap-8"
                  >
                    <div className="w-24 h-24 rounded-full border border-black/10 flex items-center justify-center bg-white shadow-xl">
                      <Star size={36} className="text-brand-gold" fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif italic mb-4 font-bold">Order Authenticated</h3>
                      <p className="text-xs text-black/50 uppercase tracking-widest max-w-[280px] leading-relaxed font-bold">
                        Welcome to the legacy. Your Vallencigga masterpiece is undergoing final inspection.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-8 bg-black text-brand-gold px-12 py-5 text-[11px] uppercase tracking-[0.3em] font-bold shadow-2xl skew-x-[-5deg]"
                    >
                      Return to Maison
                    </button>
                  </motion.div>
                ) : cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-8 opacity-20 py-20">
                    <ShoppingBag size={64} strokeWidth={0.5} />
                    <p className="text-[11px] uppercase tracking-[0.5em] font-bold">Archive Empty</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={`${item.id}-${idx}`} 
                      className="flex gap-8 items-start pb-8 border-b border-black/5"
                    >
                      <div className="w-28 aspect-[4/5] bg-brand-beige p-2 border border-black/5 overflow-hidden">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-grow pt-2">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xs uppercase tracking-widest font-bold max-w-[150px] leading-tight">{item.name}</h3>
                          <span className="text-sm font-serif italic font-bold">${item.price}</span>
                        </div>
                        <p className="text-[9px] text-black/30 uppercase tracking-[0.2em] mb-6 font-bold">{item.category}</p>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-[9px] uppercase tracking-[0.3em] border-b border-black/10 pb-0.5 hover:border-black transition-colors font-bold"
                        >
                          Withdraw
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {cart.length > 0 && !checkoutSuccess && (
                <div className="pt-16 border-t border-black/10 mt-auto bg-brand-cream z-10">
                  <div className="flex justify-between items-baseline mb-12">
                    <span className="text-[11px] uppercase tracking-[0.4em] text-black/30 font-bold">Estimation</span>
                    <span className="text-4xl font-serif font-bold italic tracking-tighter">${cartTotal}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckoutLoading}
                    className="w-full bg-black text-white py-6 text-[12px] uppercase tracking-[0.4em] font-bold hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-3xl overflow-hidden relative"
                  >
                    {isCheckoutLoading ? (
                      <>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full"
                        />
                        <span className="text-brand-gold">Verifying Signature...</span>
                      </>
                    ) : (
                      'Authenticate & Purchase'
                    )}
                  </button>
                  <p className="text-center text-[10px] uppercase tracking-[0.3em] text-black/20 mt-8 font-bold">
                    Secure Maison Checkout • Encrypted
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
