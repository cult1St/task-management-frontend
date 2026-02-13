import Link from "next/link";

export default function Home() {
  
  return (
    <div id="webcrumbs">
      <div className="w-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl overflow-hidden shadow-xl">
        <header className="flex justify-between items-center py-5 px-8 bg-blue-600 text-white">
          <div className="flex items-center">
            <svg
              className="w-10 h-10 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
                fill="white"
              />
              <path
                d="M8 12C8 12.5523 7.55228 13 7 13C6.44772 13 6 12.5523 6 12C6 11.4477 6.44772 11 7 11C7.55228 11 8 11.4477 8 12Z"
                fill="blue"
              />
              <path
                d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z"
                fill="blue"
              />
              <path
                d="M18 12C18 12.5523 17.5523 13 17 13C16.4477 13 16 12.5523 16 12C16 11.4477 16.4477 11 17 11C17.5523 11 18 11.4477 18 12Z"
                fill="blue"
              />
            </svg>
            <h1 className="text-2xl font-bold">WealthChat</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li className="hover:-translate-y-1 transition-transform">
                <a
                  href="https://webcrumbs.cloud/placeholder"
                  className="font-medium hover:text-blue-200 transition-colors"
                >
                  Features
                </a>
              </li>
              <li className="hover:-translate-y-1 transition-transform">
                <a
                  href="https://webcrumbs.cloud/placeholder"
                  className="font-medium hover:text-blue-200 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li className="hover:-translate-y-1 transition-transform">
                <a
                  href="https://webcrumbs.cloud/placeholder"
                  className="font-medium hover:text-blue-200 transition-colors"
                >
                  Support
                </a>
              </li>
              <li className="hover:-translate-y-1 transition-transform">
                <Link
                  href="/login"
                  className="bg-white text-blue-600 px-4 py-1 rounded-full font-medium hover:bg-blue-100 transition-colors"
                >Login</Link>
              
              </li>
            </ul>
          </nav>
          {/* Next: "Add dropdown menu for mobile view" */}
        </header>

        <main className="grid grid-cols-2 gap-8 py-16 px-12">
          <div className="flex flex-col justify-center">
            <h2 className="text-5xl font-bold text-blue-900 mb-6 leading-tight">
              Connect with your team, anywhere, anytime
            </h2>
            <p className="text-lg text-blue-700 mb-8">
              Experience seamless communication with our intuitive chat platform
              designed for teams of all sizes. Share ideas, files, and
              collaborate in real-time.
            </p>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-blue-300/50">
                Get Started Free
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transform hover:-translate-y-1 transition-all duration-200">
                Watch Demo
              </button>
            </div>
            <div className="mt-12 flex items-center">
              <div className="flex -space-x-4">
                <img
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                  alt="User"
                />
                <img
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                  src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                  alt="User"
                />
                <img
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                  alt="User"
                />
              </div>
              <p className="ml-4 text-blue-800">
                <span className="font-bold">5,000+</span> teams already use
                WealthChat
              </p>
            </div>
            {/* Next: "Add customer testimonials section" */}
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-200 rounded-full opacity-50"></div>
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-blue-300 rounded-full opacity-40"></div>

            <div className="relative bg-white p-5 rounded-2xl shadow-xl border border-blue-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-blue-100">
                <div className="flex items-center space-x-3">
                  <span className="p-2 bg-blue-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-bold text-blue-900">Team Chat</h3>
                    <p className="text-sm text-blue-500">5 members online</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <img
                    className="w-10 h-10 rounded-full mr-3"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                    alt="User"
                  />
                  <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
                    <p className="font-medium text-blue-900">Sarah Johnson</p>
                    <p className="text-blue-700">
                      Hey team! I just uploaded the latest design files to the
                      shared folder.
                    </p>
                    <p className="text-xs text-blue-400 mt-1">10:23 AM</p>
                  </div>
                </div>

                <div className="flex items-start justify-end">
                  <div className="bg-blue-600 rounded-lg p-3 max-w-[80%] text-white">
                    <p>Thanks Sarah! I'll take a look at them right now.</p>
                    <p className="text-xs text-blue-200 mt-1">10:25 AM</p>
                  </div>
                  <img
                    className="w-10 h-10 rounded-full ml-3"
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                    alt="User"
                  />
                </div>

                <div className="flex items-start">
                  <img
                    className="w-10 h-10 rounded-full mr-3"
                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                    alt="User"
                  />
                  <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
                    <p className="font-medium text-blue-900">
                      Michael Williams
                    </p>
                    <p className="text-blue-700">
                      I have some feedback on the homepage. Can we schedule a
                      quick call today?
                    </p>
                    <p className="text-xs text-blue-400 mt-1">10:30 AM</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full p-4 pr-16 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-2 top-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            {/* Next: "Add video call interface mockup" */}
          </div>
        </main>

        <div className="bg-blue-700 py-12 px-16 text-white">
          <div className="grid grid-cols-4 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4">Key Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center hover:translate-x-1 transition-transform">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>Real-time messaging</span>
                </li>
                <li className="flex items-center hover:translate-x-1 transition-transform">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>Voice & video calls</span>
                </li>
                <li className="flex items-center hover:translate-x-1 transition-transform">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>File sharing</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li className="hover:translate-x-1 transition-transform">
                  <a
                    href="https://webcrumbs.cloud/placeholder"
                    className="hover:text-blue-200 transition-colors"
                  >
                    About us
                  </a>
                </li>
                <li className="hover:translate-x-1 transition-transform">
                  <a
                    href="https://webcrumbs.cloud/placeholder"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li className="hover:translate-x-1 transition-transform">
                  <a
                    href="https://webcrumbs.cloud/placeholder"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li className="hover:translate-x-1 transition-transform">
                  <a
                    href="https://webcrumbs.cloud/placeholder"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li className="hover:translate-x-1 transition-transform">
                  <a
                    href="https://webcrumbs.cloud/placeholder"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li className="hover:translate-x-1 transition-transform">
                  <a
                    href="https://webcrumbs.cloud/placeholder"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Get the App</h3>
              <div className="space-y-3">
                <button className="flex items-center bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors transform hover:-translate-y-1 transition-transform w-full">
                  <svg
                    className="w-6 h-6 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.5227 7.39595C17.2909 7.64672 17.1317 7.9833 17.07 8.34375C17.0082 8.7042 17.0459 9.07307 17.1794 9.41445C17.3128 9.75584 17.5377 10.0581 17.8312 10.2927C18.1247 10.5273 18.4765 10.6862 18.85 10.7531C18.8528 10.5417 18.8528 10.3302 18.85 10.1187C18.8524 9.51854 18.6336 8.93861 18.2323 8.48779C17.831 8.03697 17.2759 7.74923 16.679 7.67656C15.5956 7.54437 14.5533 7.12056 13.6675 6.44766C12.8821 6.93723 12.2252 7.60945 11.7497 8.40555C11.2742 9.20166 10.9953 10.0972 10.9375 11.0219C11.5405 10.9678 12.1447 10.9198 12.7498 10.8781C13.4377 10.8297 14.1193 11.0647 14.6202 11.5341C15.1212 12.0035 15.3955 12.6659 15.3747 13.3547C15.3539 14.0435 15.0404 14.6885 14.5093 15.1283C13.9782 15.568 13.2857 15.7645 12.5981 15.675C11.9105 15.5855 11.2903 15.2178 10.8585 14.6501C10.4267 14.0824 10.2181 13.3586 10.2745 12.6359C9.66887 12.6745 9.0641 12.7197 8.46019 12.7714C8.35437 13.9269 8.61488 15.0847 9.20349 16.0957C9.7921 17.1068 10.6834 17.9223 11.7577 18.4426C12.8321 18.9629 14.0431 19.1654 15.2398 19.0219C16.4365 18.8783 17.5661 18.3947 18.4961 17.6326C19.4261 16.8705 20.1185 15.8613 20.4911 14.7288C20.8637 13.5963 20.9011 12.3878 20.5988 11.236C20.2965 10.0842 19.6671 9.0379 18.7855 8.2236C18.3713 7.88878 17.8857 7.64419 17.3623 7.50789L17.5227 7.39595Z" />
                    <path d="M10.0016 13.3359C10.0016 13.3359 5.78895 13.875 3.27645 14.9984C3.27645 14.9984 2.06895 15.5859 2.12645 17.2172C2.20145 19.2609 2.16395 21.6797 3.73895 21.8766C5.31395 22.0734 6.51145 21.157 9.15145 18.9422C11.7915 16.7273 12.7023 14.9859 12.7023 14.9859L10.0016 13.3359Z" />
                    <path d="M9.99855 13.3359L7.29855 11.6859C7.29855 11.6859 8.20949 9.94594 10.8495 7.7311C13.4895 5.51625 14.687 4.59994 16.262 4.7969C17.837 4.99387 17.7995 7.41262 17.8745 9.45637C17.932 11.0877 16.7245 11.6753 16.7245 11.6753C14.212 12.7987 9.99855 13.3381 9.99855 13.3381" />
                    <path d="M9.19309 16.3594C9.67934 16.1594 10.0156 15.7219 10.0156 15.2094C10.0156 14.697 9.67934 14.2594 9.19309 14.0594C8.70684 13.8594 8.12059 14.0031 7.79934 14.4219C7.47809 14.8406 7.47809 15.4125 7.79934 15.8313C8.12059 16.25 8.70684 16.3938 9.19309 16.1938"></path>
                  </svg>
                  <span>Google Play</span>
                </button>
                <button className="flex items-center bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors transform hover:-translate-y-1 transition-transform w-full">
                  <svg
                    className="w-6 h-6 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14.94 5.19A4.18 4.18 0 0 0 16 2.75a4.06 4.06 0 0 0-2.7 1.39 3.8 3.8 0 0 0-1 2.37 3.76 3.76 0 0 0 2.64-1.32z" />
                    <path d="M16.83 6.69c-1.46 0-2.09.69-3.11.69s-1.82-.68-3-.72a4.48 4.48 0 0 0-3.85 2.33c-1.63 2.83-.42 7 1.17 9.29.79 1.13 1.71 2.39 2.91 2.35s1.61-.76 3-.76 1.82.76 3.06.73 2.06-1.13 2.84-2.27a9.88 9.88 0 0 0 1.29-2.63 4.21 4.21 0 0 1-2.51-3.8 4.28 4.28 0 0 1 2-3.62 4.31 4.31 0 0 0-3.8-2.09z" />
                  </svg>
                  <span>App Store</span>
                </button>
              </div>
            </div>
            {/* Next: "Add social media links" */}
          </div>
        </div>
      </div>
    </div>
  );
}
