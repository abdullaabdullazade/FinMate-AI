import React from 'react'

const Badge = ({
    children,
    variant = 'default', // default, success, warning, error, info
    className = '',
    size = 'md' // sm, md
}) => {
    const variants = {
        default: 'bg-white/10 text-white/80 border-white/10',
        success: 'bg-green-500/20 text-green-200 border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
        error: 'bg-red-500/20 text-red-200 border-red-500/30',
        info: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
        purple: 'bg-purple-500/20 text-purple-200 border-purple-500/30'
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs sm:text-sm'
    }

    return (
        <span className={`
      inline-flex items-center justify-center rounded-full font-medium border
      ${variants[variant]} 
      ${sizes[size]}
      ${className}
    `}>
            {children}
        </span>
    )
}

export default Badge
