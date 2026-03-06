"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-2xl font-bold text-[#1F2A2A] mb-3">
          You&apos;re Offline
        </h1>
        <p className="text-gray-500 mb-6">
          It looks like you&apos;ve lost your internet connection. Some features
          require a network connection to work. Please check your connection and
          try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#1F2A2A] text-white rounded-lg font-medium hover:bg-[#2a3a3a] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
