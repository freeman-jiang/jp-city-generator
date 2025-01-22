"use client";
// import { BreakpointConfig, evaluateBreakpoint } from "@/lib/client";
import { motion } from "framer-motion";

interface ProgressiveLoadProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export const ProgressiveLoad = ({
  children,
  delay = 0,
  duration = 0.75,
  className,
}: ProgressiveLoadProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: delay / 2000, duration: duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
