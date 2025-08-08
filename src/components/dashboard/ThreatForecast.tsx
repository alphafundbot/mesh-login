
"use client";

import React from 'react';
import HudForecastPanel from './HudForecastPanel';
import RationaleForecastPanel from './RationaleForecastPanel';
import { motion } from 'framer-motion';

export default function ThreatForecast() {
    return (
        <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <HudForecastPanel />
            <RationaleForecastPanel />
        </motion.div>
    )
}
