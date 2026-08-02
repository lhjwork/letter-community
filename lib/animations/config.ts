import type { Variants, Transition } from "framer-motion";

// Common spring configs
export const springs = {
  gentle: { type: "spring", stiffness: 120, damping: 14 } as Transition,
  bouncy: { type: "spring", stiffness: 300, damping: 10 } as Transition,
  snappy: { type: "spring", stiffness: 500, damping: 30 } as Transition,
  slow: { type: "spring", stiffness: 80, damping: 20 } as Transition,
};

// Fade in from bottom
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Fade in with scale
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Stagger children container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Stagger child item
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Envelope open animation
export const envelopeOpen: Variants = {
  closed: {
    rotateX: 0,
    y: 0,
    scale: 1,
  },
  open: {
    rotateX: -180,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

// Letter slide out of envelope
export const letterSlideOut: Variants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.4 },
  },
};

// Card hover 3D tilt
export const cardHover = {
  rest: { scale: 1, rotateX: 0, rotateY: 0 },
  hover: { scale: 1.02, transition: { duration: 0.3 } },
};

// Modal entrance
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

// Heart burst particles
export const heartBurst: Variants = {
  initial: { scale: 0, opacity: 1 },
  animate: {
    scale: [0, 1.2, 0],
    opacity: [1, 1, 0],
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Tap scale effect
export const tapScale = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.05 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
};

// Fade in from left
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Fade in from right
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Scale up from center
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

// Card flip (for DailyPrompt)
export const cardFlip: Variants = {
  front: { rotateY: 0, opacity: 1 },
  back: {
    rotateY: 180,
    opacity: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

// Floating element (infinite)
export const floatingAnimation = {
  y: [0, -12, -6, -18, 0],
  rotate: [0, 2, -1, 1, 0],
  transition: {
    duration: 6,
    ease: "easeInOut",
    repeat: Infinity,
  },
};

// Stagger container with wider delay
export const staggerContainerWide: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// Button pop entrance
export const buttonPop: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
};

// Celebration bounce
export const celebrationBounce: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: -10 },
  visible: {
    opacity: 1,
    scale: [0, 1.2, 0.9, 1.05, 1],
    rotate: [0, -5, 3, -1, 0],
    transition: { duration: 0.7, ease: "easeOut" },
  },
};
