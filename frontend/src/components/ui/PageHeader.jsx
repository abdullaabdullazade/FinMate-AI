import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const PageHeader = ({
    title,
    subtitle,
    backUrl,
    actions,
    className = ''
}) => {
    const navigate = useNavigate()

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 ${className}`}>
            <div className="flex items-center gap-3">
                {backUrl && (
                    <button
                        onClick={() => backUrl === -1 ? navigate(-1) : navigate(backUrl)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl sm:text-3xl font-bold text-white"
                    >
                        {title}
                    </motion.h1>
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-white/60 text-sm sm:text-base mt-1"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>
            </div>

            {actions && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                >
                    {actions}
                </motion.div>
            )}
        </div>
    )
}

export default PageHeader
