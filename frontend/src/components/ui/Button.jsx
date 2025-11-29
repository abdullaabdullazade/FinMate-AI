import React from 'react'
import { motion } from 'framer-motion'

const Button = ({
    children,
    variant = 'primary', // primary, secondary, danger, ghost, outline
    size = 'md', // sm, md, lg
    className = '',
    isLoading = false,
    disabled = false,
    icon: Icon,
    onClick,
    type = 'button',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-[1.02] shadow-lg shadow-purple-500/25 focus:ring-purple-500',
        secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10 focus:ring-white/50',
        danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:scale-[1.02] shadow-lg shadow-red-500/25 focus:ring-red-500',
        ghost: 'text-white/70 hover:text-white hover:bg-white/5 focus:ring-white/20',
        outline: 'border-2 border-white/20 text-white hover:bg-white/5 focus:ring-white/50'
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-xs sm:text-sm',
        md: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
        lg: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg'
    }

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : Icon ? (
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${children ? 'mr-2' : ''}`} />
            ) : null}
            {children}
        </motion.button>
    )
}

export default Button
