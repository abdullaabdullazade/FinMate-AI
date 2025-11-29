import React from 'react'

const Loading = ({ fullScreen = false, text = 'Yüklənir...' }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p className="text-white/80 font-medium animate-pulse">{text}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3"></div>
            <p className="text-white/60 text-sm">{text}</p>
        </div>
    )
}

export default Loading
