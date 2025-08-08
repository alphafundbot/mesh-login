
"use client";

import { motion } from "framer-motion";
import HudEscalationMatrix from "./HudEscalationMatrix";
import OverrideMomentum from "./OverrideMomentum";
import RationaleForecastPanel from "./RationaleForecastPanel";
import HudForecastPanel from "./HudForecastPanel";

export default function VisualIntegrityDashboard() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="grid grid-cols-1 gap-6 auto-rows-max">
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={cardVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <HudEscalationMatrix />
      </motion.div>
      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={cardVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <OverrideMomentum />
      </motion.div>
      <motion.div
        initial="hidden"
        animate="visible"
        custom={2}
        variants={cardVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <HudForecastPanel />
      </motion.div>
      <motion.div
        initial="hidden"
        animate="visible"
        custom={3}
        variants={cardVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <RationaleForecastPanel />
      </motion.div>
    </div>
  );
}
