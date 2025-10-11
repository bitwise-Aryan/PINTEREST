


import { IKImage } from "imagekitio-react";

// 1. Accept `...props` to catch any other props like onClick
const Image = ({ path, alt, className, w, h, ...props }) => {
  // Check if the path starts with a slash or contains no protocol (http/https).
  // This is the relative path from the database, which IKImage uses with urlEndpoint.
  if (path && (path.startsWith("/") || !path.includes(":"))) {
    
    // DYNAMIC IMAGE (The Pin Image from ImageKit)
    return (
      <IKImage
        urlEndpoint={import.meta.env.VITE_URL_IK_ENDPOINT}
        path={path}
        transformation={[
          {
            height: h,
            width: w,
          },
        ]}
        alt={alt}
        loading="lazy"
        className={className}
        lqip={{ active: true, quality: 20 }}
        {...props} // 2. Spread the rest of the props (like onClick) here
      />
    );
  }
  
  // STATIC IMAGE (Local asset or a full URL like a user avatar)
  if (path) {
    // 3. Spread the rest of the props here as well
    return <img src={path} alt={alt} className={className} width={w} height={h} loading="lazy" {...props} />;
  }

  // FALLBACK/ERROR PREVENTION
  return null;
};

export default Image;
