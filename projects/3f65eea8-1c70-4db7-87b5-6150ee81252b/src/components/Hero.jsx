import { useState } from 'react'
import { Play } from './Icons'

function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <section className="relative pt-28 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Your fitness.{' '}
              <span className="text-primary-600">Tracked, analyzed, improved.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
              FitTrackr turns your workouts into insights — so you train smarter, not just harder.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="btn-primary text-lg px-8 py-4">
                Start for Free
              </button>
              <button
                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2"
                onClick={() => setIsVideoOpen(true)}
              >
                <Play className="w-5 h-5 fill-current" />
                See how it works
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              No credit card required · Free forever plan available
            </p>
          </div>

          {/* Right Content - Dashboard Mockup */}
          <div className="relative mt-12 lg:mt-0">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-transparent to-accent-100 rounded-3xl transform rotate-3"></div>

            {/* Mockup Container */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-100">
              {/* Browser Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-gray-100 rounded-md flex items-center px-3">
                    <span className="text-xs text-gray-400">app.fittrackr.com/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-primary-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-primary-600">12</div>
                    <div className="text-xs text-gray-500">Workouts</div>
                  </div>
                  <div className="bg-accent-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-accent-600">2.4k</div>
                    <div className="text-xs text-gray-500">Calories</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">98%</div>
                    <div className="text-xs text-gray-500">Goals Met</div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm font-semibold text-gray-700">Weekly Progress</div>
                    <div className="text-xs text-gray-400">Last 7 days</div>
                  </div>
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 45, 80, 70, 90, 75].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary-500 rounded-t-sm"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-600">
                        <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">Morning Run</div>
                      <div className="text-xs text-gray-400">Today, 6:30 AM · 5.2 km</div>
                    </div>
                    <div className="text-sm font-semibold text-accent-600">+320 cal</div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent-600">
                        <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">Weight Training</div>
                      <div className="text-xs text-gray-400">Yesterday, 5:00 PM · 45 min</div>
                    </div>
                    <div className="text-sm font-semibold text-accent-600">+280 cal</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div
              className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 animate-bounce"
              style={{ animationDuration: '3s' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent-600">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">Goal Complete!</div>
                  <div className="text-xs text-gray-400">Weekly target hit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              onClick={() => setIsVideoOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <p className="text-lg font-medium">Video Demo Coming Soon</p>
                <p className="text-sm text-gray-400 mt-2">See how FitTrackr can transform your fitness journey</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Hero