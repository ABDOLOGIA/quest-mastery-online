
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SuccessStory {
  image: string;
  title: string;
  description: string;
  quote: string;
}

interface SuccessStoriesCarouselProps {
  onSwitchToRegister: () => void;
}

const SuccessStoriesCarousel: React.FC<SuccessStoriesCarouselProps> = ({ onSwitchToRegister }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Success stories data with uploaded images
  const successStories: SuccessStory[] = [
    {
      image: '/lovable-uploads/38cce33a-d8e0-4689-bf0b-16697ac67160.png',
      title: 'Certificate of Excellence',
      description: 'Transform your career with recognized certifications. Every exam you pass brings you closer to your professional goals.',
      quote: '"Success is not just about passing exams, it\'s about mastering knowledge that changes your life."'
    },
    {
      image: '/lovable-uploads/05cff9ed-fc1f-417a-abd4-445b42ab51fa.png',
      title: 'Graduation Achievement',
      description: 'Join thousands of successful graduates who have transformed their careers through dedicated learning and excellence.',
      quote: '"The future belongs to those who prepare for it today through continuous learning."'
    },
    {
      image: '/lovable-uploads/602297ea-2b1d-42a9-bf6f-4ad6d2e492b5.png',
      title: 'Focused Study Environment',
      description: 'Create the perfect learning space for success. Dedicated study time leads to extraordinary results.',
      quote: '"Every hour spent studying is an investment in your future success."'
    },
    {
      image: '/lovable-uploads/7d2601f9-e4ef-4739-bbd4-f679dbf4189e.png',
      title: 'Digital Learning Excellence',
      description: 'Master modern examination platforms and excel in digital assessments with confidence and skill.',
      quote: '"Technology and determination combine to create unstoppable success."'
    },
    {
      image: '/lovable-uploads/18a2de41-44bf-4e53-865b-84606c4b31ca.png',
      title: 'Student Success Story',
      description: 'Real students achieving real success through dedication and smart preparation. Your journey to excellence starts here.',
      quote: '"With the right mindset and preparation, every student can achieve extraordinary results."'
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % successStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % successStories.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  return (
    <div className="w-full max-w-6xl mt-16 relative z-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">Success Stories</h2>
        <p className="text-gray-200 text-lg">Discover how students achieve excellence through dedication and smart studying</p>
      </div>

      <div className="relative bg-black/70 backdrop-blur-lg border border-yellow-500/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative h-96 md:h-80">
          {successStories.map((story, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                <div className="relative">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/70"></div>
                </div>
                <div className="p-8 flex flex-col justify-center bg-gradient-to-br from-black/80 to-black/90">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-4 drop-shadow-lg">{story.title}</h3>
                  <p className="text-gray-100 mb-6 leading-relaxed text-lg font-medium drop-shadow-md">{story.description}</p>
                  <blockquote className="text-yellow-300 italic text-lg border-l-4 border-yellow-500 pl-4 bg-black/40 p-4 rounded-r-lg backdrop-blur-sm">
                    <span className="text-2xl font-bold text-yellow-400">"</span>
                    <span className="font-semibold">{story.quote.slice(1, -1)}</span>
                    <span className="text-2xl font-bold text-yellow-400">"</span>
                  </blockquote>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-500/30 hover:bg-yellow-500/50 border border-yellow-500/50 rounded-full flex items-center justify-center text-yellow-400 transition-all duration-300 backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-500/30 hover:bg-yellow-500/50 border border-yellow-500/50 rounded-full flex items-center justify-center text-yellow-400 transition-all duration-300 backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {successStories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-yellow-400 scale-125' 
                  : 'bg-yellow-400/30 hover:bg-yellow-400/60'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="text-center mt-12">
        <div className="inline-flex flex-col items-center gap-4">
          <h3 className="text-2xl font-bold text-yellow-400">Ready to Start Your Success Journey?</h3>
          <p className="text-gray-200 max-w-2xl">
            Join thousands of students who have transformed their careers through our comprehensive examination platform. 
            Your success story starts with a single step.
          </p>
          <Button 
            onClick={onSwitchToRegister}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Start Your Journey Today
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessStoriesCarousel;
