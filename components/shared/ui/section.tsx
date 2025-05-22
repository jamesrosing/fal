"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';


export interface SectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  background?: 'black' | 'zinc-900' | 'white';
  containerWidth?: 'default' | 'narrow' | 'wide';
}

export function Section({
  title,
  subtitle,
  description,
  className,
  children,
  background = 'white',
  containerWidth = 'default'
}: SectionProps) {
  const containerClasses = {
    default: 'max-w-7xl',
    narrow: 'max-w-5xl',
    wide: 'max-w-screen-2xl'
  }

  const bgClasses = {
    black: 'bg-black text-white',
    'zinc-900': 'bg-zinc-900 text-white',
    white: 'bg-white text-zinc-900'
  }

  return (
    <section
      className={cn(
        'py-16 md:py-24',
        bgClasses[background],
        className
      )}
    >
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', containerClasses[containerWidth])}>
        {(title || subtitle || description) && (
          <div className="mb-12 text-center">
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-sm md:text-base font-medium uppercase tracking-wider mb-2"
              >
                {subtitle}
              </motion.p>
            )}
            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                {title}
              </motion.h2>
            )}
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-lg md:text-xl max-w-3xl mx-auto"
              >
                {description}
              </motion.p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
} 