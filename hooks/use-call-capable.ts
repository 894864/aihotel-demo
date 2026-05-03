"use client";

import { useEffect, useState } from "react";

export function useCallCapable() {
  const [canCall, setCanCall] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: none) and (pointer: coarse)");
    const userAgentCanCall = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const update = () => setCanCall(media.matches || userAgentCanCall);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return canCall;
}
