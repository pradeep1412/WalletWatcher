"use client";

import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

export function Confetti() {
  const [windowDimension, setDimension] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateWindowDimensions = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);

    return () => {
      window.removeEventListener("resize", updateWindowDimensions);
    };
  }, []);

  if (typeof window === "undefined") {
    return null;
  }

  return (
    <ReactConfetti
      width={windowDimension.width}
      height={windowDimension.height}
      numberOfPieces={200}
      recycle={false}
    />
  );
}
