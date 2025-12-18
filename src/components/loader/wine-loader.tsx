import React from "react";

const WineLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#2A1A1F] to-[#1A1A1A] overflow-hidden">
      <div className="relative">
        <div className="relative w-44 h-64 transform-gpu animate-wiggle">
          {/* Wine Glass Container */}
          <div className="absolute w-36 h-56 left-1/2 -translate-x-1/2 transform-gpu preserve-3d">
            {/* Glass Bowl (V-shape) */}
            <div className="absolute w-full h-40 top-0 left-0">
              {/* V-shape Bowl */}
              <div className="absolute w-full h-full border-[1.5px] border-white/40 rounded-b-[50%] rounded-t-none overflow-hidden backdrop-blur-md bg-gradient-to-br from-[#F2E5D5] to-[#F8D7B7] shadow-[0_0_15px_rgba(255,255,255,0.1)] transform-gpu rotate-x-[-8deg]">
                {/* Enhanced Glass Reflections */}
                {/* <div className="absolute inset-0">
                  <div className="absolute left-3 top-0 w-1/3 h-full bg-gradient-to-r from-white/50 to-transparent " />
                  <div className="absolute right-3 top-0 w-1/3 h-full bg-gradient-to-l from-white/40 to-transparent " />
                  <div className="absolute top-2 left-0 w-full h-1/3 bg-gradient-to-b from-white/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/10 to-transparent" />
                </div> */}

                {/* Refined Wine Fill Animation with Ripple Effect */}
                <div className="absolute bottom-0 w-full animate-wineFill">
                  <div className="w-full h-48 bg-gradient-to-br from-[#8B1F2E] via-[#6B1A24] to-[#4E151B] shadow-inner transform-gpu">
                    <div className="absolute top-0 left-0 w-full h-[12px] bg-gradient-to-r from-white/40 via-white/30 to-white/40 animate-ripple" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stem */}
            <div className="absolute w-1.5 h-16 bottom-4 left-1/2 -translate-x-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-white/30 to-white/50 rounded-full mt-4">
                <div className="absolute left-0 w-[1px] h-full bg-white/60" />
                <div className="absolute right-0 w-[1px] h-full bg-black/20" />
              </div>
            </div>

            {/* Base */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <div className="relative w-20 h-4">
                {/* Base Top Surface */}
                <div className="absolute top-0 w-full h-full bg-gradient-to-r from-white/40 via-white/30 to-white/40 rounded-full transform-gpu rotate-x-[8deg]" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/90 font-serif text-lg tracking-wider animate-fadeIn animate-bounce">
          Loading...
        </div>
      </div>
    </div>
  );
};

export default WineLoader;
