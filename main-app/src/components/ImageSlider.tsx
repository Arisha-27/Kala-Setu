import { useState, useEffect } from "react";
// 👇 1. Import useNavigate
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-artisan-marketplace.jpg";
import potteryImage from "@/assets/artisan-pottery.jpg";
import textileImage from "@/assets/artisan-textiles.jpg";
import jewelryImage from "@/assets/artisan-jewelry.jpg";
import woodworkImage from "@/assets/artisan-woodwork.jpg";

const slides = [
  {
    id: 1,
    image: heroImage,
    title: "Discover Authentic Indian Crafts",
    subtitle: "Connect directly with master artisans across India",
    description: "Each piece tells a story of heritage, skill, and passion"
  },
  {
    id: 2,
    image: potteryImage,
    title: "Traditional Pottery Masters",
    subtitle: "From Khurja to Kumartuli",
    description: "Handcrafted ceramics with centuries-old techniques"
  },
  {
    id: 3,
    image: textileImage,
    title: "Handloom Heritage",
    subtitle: "Silk, cotton, and traditional weaves",
    description: "Supporting textile artisans across rural India"
  },
  {
    id: 4,
    image: jewelryImage,
    title: "Exquisite Jewelry Craft",
    subtitle: "Silver, brass, and traditional ornaments",
    description: "Timeless designs from skilled metalworkers"
  },
  {
    id: 5,
    image: woodworkImage,
    title: "Master Woodcarvers",
    subtitle: "Intricate sculptures and functional art",
    description: "Preserving the art of traditional woodworking"
  }
];

const ImageSlider = () => {
  // 👇 2. Initialize the hook
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[600px] lg:h-[700px] overflow-hidden rounded-xl">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${index === currentSlide ? "translate-x-0" :
              index < currentSlide ? "-translate-x-full" : "translate-x-full"
            }`}
        >
          <div className="relative w-full h-full">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                  <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl lg:text-2xl text-white/90 mb-2 font-medium">
                    {slide.subtitle}
                  </p>
                  <p className="text-lg text-white/80 mb-8 leading-relaxed">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* 👇 3. Add onClick to Navigate */}
                    <Button
                      variant="glass"
                      size="lg"
                      className="text-lg px-8 py-3 text-white border-white/20"
                      onClick={() => navigate("/customer/artisans")}
                    >
                      Explore Artisans
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="glass"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white border-white/20 hover:bg-white/20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="glass"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white border-white/20 hover:bg-white/20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                  ? "bg-white shadow-glow"
                  : "bg-white/40 hover:bg-white/60"
                }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;