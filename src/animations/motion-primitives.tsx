"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform, useInView, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// Standard cubic-bezier easing for premium experience (similar to Apple/Linear)
export const premiumEase = [0.16, 1, 0.3, 1] as const;
export const springRelaxed = { type: "spring", stiffness: 80, damping: 15, mass: 1 };
export const springSnappy = { type: "spring", stiffness: 150, damping: 12, mass: 0.6 };

interface TransitionProps {
  duration?: number;
  delay?: number;
  ease?: number[] | string;
  type?: "tween" | "spring";
  stiffness?: number;
  damping?: number;
}

interface AnimationPrimitiveProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

// Fade In Primitive
export function FadeIn({ children, duration = 0.5, delay = 0, className, ...props }: AnimationPrimitiveProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: premiumEase }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

// Slide In Primitive
export function SlideIn({
  children,
  direction = "up",
  distance = 30,
  duration = 0.6,
  delay = 0,
  className,
  ...props
}: AnimationPrimitiveProps & { direction?: "up" | "down" | "left" | "right"; distance?: number }) {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: premiumEase }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

// Scale In Primitive
export function ScaleIn({ children, duration = 0.5, delay = 0, className, ...props }: AnimationPrimitiveProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: premiumEase }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

// Stagger Container Primitive
export function StaggerContainer({
  children,
  staggerChildren = 0.08,
  delayChildren = 0,
  className,
  ...props
}: Omit<AnimationPrimitiveProps, "duration" | "delay"> & { staggerChildren?: number; delayChildren?: number }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

export const staggerChildVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: premiumEase } },
};

// Scroll Reveal Primitive
export function ScrollReveal({
  children,
  direction = "up",
  distance = 25,
  duration = 0.6,
  delay = 0,
  once = true,
  className,
  ...props
}: AnimationPrimitiveProps & { direction?: "up" | "down" | "left" | "right"; distance?: number; once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px -10% 0px" });

  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directions[direction] }}
      transition={{ duration, delay, ease: premiumEase }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

// Magnet Pull Primitive
export function Magnet({
  children,
  range = 40,
  strength = 0.3,
  className,
  ...props
}: {
  children: React.ReactNode;
  range?: number;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springSnappy);
  const springY = useSpring(y, springSnappy);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < range) {
      x.set(distanceX * strength);
      y.set(distanceY * strength);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn("inline-block", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
