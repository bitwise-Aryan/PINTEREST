// import { IKImage } from "imagekitio-react";
// const Image = ({ path, src, alt, className, w, h }) => {
//   // Case 1: If 'path' is provided, assume it's a static asset (like an icon).
//   // We'll use a standard <img> tag for these, potentially loading from the public folder.
//   if (path) {
//     // Note: If you are serving these icons from your ImageKit account, 
//     // you should use IKImage and rely solely on 'path'. 
//     // However, since you are mixing 'src' (full URL) and 'path', 
//     // this separation is necessary. Assuming icons are local assets.
    
//     // For local assets, we need to know the base URL. If your icons are in 
//     // the public folder, this path should work:
//     return <img src={path} alt={alt} className={className} width={w} height={h} loading="lazy" />;
//   }
  
//   // Case 2: If 'src' is provided (a full ImageKit URL from the database), 
//   // use the IKImage component for optimization and transformations.
//   return (
//     <IKImage
//       urlEndpoint={import.meta.env.VITE_URL_IK_ENDPOINT}
//       src={src} // Use src for full ImageKit URLs
//       transformation={[
//         {
//           // We only apply height/width transformations to the dynamic images
//           height: h, 
//           width: w,
//         },
//       ]}
//       alt={alt}
//       loading="lazy"
//       className={className}
//       lqip={{ active: true, quality: 20 }}
//     />
//   );
// };

// export default Image;


// import { IKImage } from "imagekitio-react";

// const Image = ({ path, alt, className, w, h }) => {
//   // Check if the path starts with a slash or contains no protocol (http/https).
//   // This is the relative path from the database, which IKImage uses with urlEndpoint.
//   if (path && (path.startsWith("/") || !path.includes(":"))) {
    
//     // 1. DYNAMIC IMAGE (The Pin Image from ImageKit)
//     // We use the 'path' prop of IKImage for the relative file path.
//     // IKImage internally constructs the full URL using the urlEndpoint + path.
//     return (
//       <IKImage
//         urlEndpoint={import.meta.env.VITE_URL_IK_ENDPOINT}
//         path={path} // <<<<--- Use 'path' for the relative file path!
//         transformation={[
//           {
//             height: h,
//             width: w,
//           },
//         ]}
//         alt={alt}
//         loading="lazy"
//         className={className}
//         lqip={{ active: true, quality: 20 }}
//       />
//     );
//   }
  
//   // 2. STATIC IMAGE (Local asset or a full URL like a user avatar)
//   // This handles local assets (like /general/share.svg) or a full, already-formed URL.
//   // It also acts as a safeguard against the invalid URL error by ensuring 'path' is not empty.
//   if (path) {
//     return <img src={path} alt={alt} className={className} width={w} height={h} loading="lazy" />;
//   }

//   // 3. FALLBACK/ERROR PREVENTION
//   // Returns nothing if 'path' is null, undefined, or an empty string, preventing the error.
//   return null;
// };

// export default Image;


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
