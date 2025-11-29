import React from 'react'

const Input = ({
    label,
    type = 'text',
    className = '',
    error,
    icon: Icon,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-white/70 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-white/40" />
                    </div>
                )}
                <input
                    type={type}
                    className={`
            block w-full bg-white/5 border border-white/10 rounded-xl 
            text-white placeholder-white/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
            transition-all duration-200
            ${Icon ? 'pl-10' : 'pl-4'}
            ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
            py-2.5 sm:py-3 text-sm sm:text-base
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1.5 ml-1 text-xs sm:text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    )
}

export default Input
