import React from "react";
import { IKImage } from "imagekitio-react";

const Image = ({ path, alt = "", className, w, h, ...props }) => {
  if (!path) return null;

  // Local assets in /public (like /general/...) or full URLs
  if (path.startsWith("/general/") || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return (
      <img
        src={path}
        alt={alt}
        className={className}
        width={w}
        height={h}
        loading="lazy"
        {...props}
      />
    );
  }

  // Dynamic image from ImageKit
  return (
    <IKImage
      urlEndpoint={import.meta.env.VITE_URL_IK_ENDPOINT}
      path={path}
      transformation={
        w || h
          ? [
              {
                height: h,
                width: w,
              },
            ]
          : []
      }
      alt={alt}
      loading="lazy"
      className={className}
      lqip={{ active: true, quality: 20 }}
      {...props}
    />
  );
};

export default Image;
