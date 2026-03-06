'use client';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 8.464a5 5 0 000 7.072M5.636 5.636a9 9 0 000 12.728" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3">You're Offline</h1>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    No internet connection detected. If you've downloaded courses, navigate directly to them — they will load from your device.
                </p>

                <div className="space-y-3 mb-8">
                    <a
                        href="/dashboard"
                        className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Go to Dashboard
                    </a>
                    <a
                        href="/downloads"
                        className="block w-full bg-white text-blue-600 border-2 border-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    >
                        My Downloads
                    </a>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-gray-500 underline hover:text-gray-700"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
