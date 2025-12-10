"use client";

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useCallback, useEffect, useState, useRef } from "react";

export default function ResizableImageComponent(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props;

  const [resizingWidth, setResizingWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const dx = e.clientX - resizeStartRef.current.x;
      const newWidth = Math.max(100, resizeStartRef.current.width + dx); // 최소 너비 100px

      setResizingWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingWidth(null);
      resizeStartRef.current = null;

      // 리사이징이 끝나면 속성 업데이트
      if (imageRef.current) {
        updateAttributes({ width: imageRef.current.offsetWidth });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, updateAttributes]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 에디터의 다른 이벤트 방지

    if (!imageRef.current) return;

    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      width: imageRef.current.offsetWidth,
    };
  }, []);

  const textAlign = node.attrs.textAlign || "left";

  const containerStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    maxWidth: "100%",
  };

  const wrapperStyle: React.CSSProperties = {
    display: "block",
    overflow: "hidden", // float clear fix if needed, but usually not for the item itself
    clear: "none",
  };

  if (textAlign === "left") {
    wrapperStyle.float = "left";
    wrapperStyle.marginRight = "1rem";
    wrapperStyle.marginBottom = "0.5rem";
  } else if (textAlign === "right") {
    wrapperStyle.float = "right";
    wrapperStyle.marginLeft = "1rem";
    wrapperStyle.marginBottom = "0.5rem";
  } else if (textAlign === "center") {
    wrapperStyle.float = "none";
    wrapperStyle.margin = "0 auto";
    wrapperStyle.display = "flex";
    wrapperStyle.justifyContent = "center";
    wrapperStyle.marginBottom = "0.5rem";
  }

  return (
    <NodeViewWrapper style={wrapperStyle} className="resizable-image-wrapper">
      <div style={containerStyle}>
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt}
          style={{
            width: resizingWidth ? `${resizingWidth}px` : typeof node.attrs.width === "number" ? `${node.attrs.width}px` : node.attrs.width,
            maxWidth: "100%",
            height: "auto",
            display: "block",
          }}
          className={`transition-shadow duration-200 ${selected || isResizing ? "ring-2 ring-blue-500 rounded-sm" : ""}`}
        />
        {(selected || isResizing) && (
          <div
            className="absolute bottom-1 right-1 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize rounded-sm shadow-sm hover:scale-125 transition-transform"
            onMouseDown={handleMouseDown}
            style={{ zIndex: 50 }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}
