import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  delay = 0,
  noPadding = false,
  onClick,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card ${!noPadding ? 'p-4 sm:p-6' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card
