'use client';

import FontAwesomeLocal from '@/components/FontAwesomeLocal';

export default function FontAwesomeTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <FontAwesomeLocal />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Test Font Awesome Local</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <i className="fa fa-home text-4xl text-blue-500 mb-2"></i>
            <p>Home</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <i className="fa fa-user text-4xl text-green-500 mb-2"></i>
            <p>User</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <i className="fa fa-cog text-4xl text-purple-500 mb-2"></i>
            <p>Settings</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <i className="fa fa-search text-4xl text-orange-500 mb-2"></i>
            <p>Search</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <i className="fa fa-microphone text-4xl text-red-500 mb-2"></i>
            <p>Microphone</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <i className="fa fa-video text-4xl text-indigo-500 mb-2"></i>
            <p>Video</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <i className="fa fa-image text-4xl text-pink-500 mb-2"></i>
            <p>Image</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <i className="fa fa-download text-4xl text-teal-500 mb-2"></i>
            <p>Download</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Si vous voyez les icônes ci-dessus, Font Awesome fonctionne correctement !
          </p>
        </div>
      </div>
    </div>
  );
}
























