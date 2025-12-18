import React, { useEffect, useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  anchor?: "bottom" | "left" | "right" | "top";
}

const BottomSheet = ({ isOpen, onClose, children, anchor = "bottom" }: Props) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const anchorClasses = {
    bottom: "bottom-0 left-0 right-0 w-full rounded-t-3xl",
    top: "top-0 left-0 right-0 w-full rounded-b-3xl",
    left: "top-0 left-0 bottom-0 h-full w-64 rounded-r-3xl",
    right: "top-0 right-0 bottom-0 h-full w-64 rounded-l-3xl",
  };

  const translateClasses = {
    bottom: "translate-y-full",
    top: "-translate-y-full",
    left: "-translate-x-full",
    right: "translate-x-full",
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const prevActiveElement = document.activeElement as HTMLElement;
    if (isOpen && sheetRef.current) {
      sheetRef.current.focus();
    }
    return () => {
      if (prevActiveElement) {
        prevActiveElement.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {};
    const handleTouchMove = (e: TouchEvent) => {};
    const handleTouchEnd = (e: TouchEvent) => {};
    if (sheetRef.current) {
      sheetRef.current.addEventListener("touchstart", handleTouchStart);
      sheetRef.current.addEventListener("touchmove", handleTouchMove);
      sheetRef.current.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      if (sheetRef.current) {
        sheetRef.current.removeEventListener("touchstart", handleTouchStart);
        sheetRef.current.removeEventListener("touchmove", handleTouchMove);
        sheetRef.current.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>}
      <div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={`fixed ${anchorClasses[anchor]} bg-white p-6 shadow-lg z-50 transition-transform transform ${
          isOpen ? "translate-0" : translateClasses[anchor]
        }`}
        style={{ transitionDuration: "300ms", maxHeight: "85vh", overflow: "auto" }}
      >
        <button className="absolute top-4 right-4 btn btn-sm btn-circle btn-outline" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="h-full">{children}</div>
      </div>
    </>
  );
};

export default BottomSheet;
