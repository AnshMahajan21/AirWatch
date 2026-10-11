/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Atmospheric Bottom Sheet
 * Ref 1 inspired rounded sheet with grab handle, spring slide-up physics,
 * mobile drawer container (always expanded, non-collapsible for immediate timeline access),
 * and static card layout on desktop.
 */

import React from 'react';
import { motion } from 'motion/react';

interface BottomSheetProps {
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Drawer (visible on < md screens, always expanded without collapse toggle) */}
      <div className="block md:hidden">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="bg-stone-900/95 text-stone-100 rounded-[36px] shadow-2xl border border-white/20 backdrop-blur-2xl px-5 pt-3 pb-8"
        >
          {/* Subtle grab handle accent bar */}
          <div className="w-full flex justify-center py-2 -mt-1 pointer-events-none" aria-hidden="true">
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          </div>

          <div className="mt-2">
            {children}
          </div>
        </motion.div>
      </div>

      {/* Desktop Panel (clean embedded container on >= md) */}
      <div className="hidden md:block bg-stone-900/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/15 shadow-2xl text-stone-100">
        {children}
      </div>
    </div>
  );
};
