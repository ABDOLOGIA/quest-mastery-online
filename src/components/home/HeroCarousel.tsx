
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Card, CardContent } from '../ui/card';

const HeroCarousel = () => {
  const slides = [
    {
      image: '/lovable-uploads/20f3cb03-ba43-469c-bd02-803fcca6c566.png',
      title: 'Achieve Your Dreams',
      description: 'Every certification earned is a step closer to your goals. Excellence in education opens doors to limitless possibilities.',
      accent: 'Success Stories'
    },
    {
      image: '/lovable-uploads/34504a5f-fff8-45b0-bc9c-fd4960151cf4.png',
      title: 'Graduation Excellence',
      description: 'Join thousands of successful graduates who transformed their careers through dedicated learning and achievement.',
      accent: 'Academic Success'
    },
    {
      image: '/lovable-uploads/176e025c-8e10-406f-a0e5-8bc3476d60f3.png',
      title: 'Global Recognition',
      description: 'Our certifications are recognized worldwide, providing you with credentials that matter in the global marketplace.',
      accent: 'International Standards'
    },
    {
      image: '/lovable-uploads/4e7a843e-78d6-49e1-9fc0-c679ba86784d.png',
      title: 'Focused Learning',
      description: 'Dedicated study environments and personalized learning paths help you master every subject with confidence.',
      accent: 'Personal Growth'
    },
    {
      image: '/lovable-uploads/5569aaf3-8285-4711-b34a-f9ae48e11e89.png',
      title: 'Digital Excellence',
      description: 'Modern technology meets traditional education values, creating the perfect learning ecosystem for today\'s students.',
      accent: 'Innovation'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-cyan-400 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Journey to 
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Excellence</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover stories of achievement, dedication, and success from our learning community
          </p>
        </div>

        <Carousel 
          className="w-full max-w-6xl mx-auto"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-500 group">
                  <CardContent className="p-0 h-full">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-blue-500/80 text-white text-sm font-medium rounded-full backdrop-blur-sm">
                          {slide.accent}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                        {slide.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {slide.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12 bg-white/10 border-white/20 text-white hover:bg-white/20" />
          <CarouselNext className="hidden md:flex -right-12 bg-white/10 border-white/20 text-white hover:bg-white/20" />
        </Carousel>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span>Start Your Learning Journey Today</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
