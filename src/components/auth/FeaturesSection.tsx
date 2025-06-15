
import React from 'react';
import { BookOpen, Users, Trophy } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mt-12 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <div className="bg-black/60 backdrop-blur-lg border border-yellow-500/20 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mr-4">
              <BookOpen className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-bold text-yellow-400">MASTER ESSENTIAL SKILLS</h3>
          </div>
          <div className="space-y-3 text-gray-200">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm">Focuses on building <span className="text-yellow-400 font-semibold">strong students</span> who are able to face the world</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm">Master the skills you need to <span className="text-yellow-400 font-semibold">maximize your potential</span></p>
            </div>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-lg border border-yellow-500/20 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-bold text-yellow-400">JOIN YOUR REAL WORLD EXCELLENCE</h3>
          </div>
          <div className="space-y-3 text-gray-200">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm">Put all your <span className="text-yellow-400 font-semibold">knowledge here</span></p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm">Study hard and <span className="text-yellow-400 font-semibold">pass all your exams</span></p>
            </div>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-lg border border-yellow-500/20 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mr-4">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-bold text-yellow-400">ACCESS TO SUCCESS</h3>
          </div>
          <div className="space-y-3 text-gray-200">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm">In order to be successful you need to <span className="text-yellow-400 font-semibold">pass a lot of exams</span> in your life</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm">Success means <span className="text-yellow-400 font-semibold">solving problems</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-200 text-lg mb-4">
          That's exactly what you can do, join <span className="text-yellow-400 font-bold">YourExam.net</span> and solve your <span className="text-yellow-400 font-bold">PROBLEMS</span>
        </p>
      </div>
    </div>
  );
};

export default FeaturesSection;
