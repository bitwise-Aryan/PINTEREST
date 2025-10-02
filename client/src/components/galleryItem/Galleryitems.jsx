



// import "./galleryItem.css";

// import { Link } from "react-router-dom"; 
// import Image from "../image/image"; 

// const GalleryItem = ({ item }) => {

// const optimizedHeight = (372 * item.height) / item.width

//   return (
//     <div
//       className="galleryItem"
//       style={{ gridRowEnd: `span ${Math.ceil(item.height / 100)}` }}
//     >
//      
//       <Image src={item.media} alt={item.title || "Pin Image"} w={372} h={optimizedHeight}/>
//     
//       <Link to={`/pin/${item._id}`} className="overlay" />
//       <button className="saveButton">Save</button>
//       <div className="overlayIcons">
//         <button>
//           <Image path="/general/share.svg" alt="Share" />
//         </button>
//         <button>
//           <Image path="/general/more.svg" alt="More" />
//         </button>
//       </div>
//     </div>
//   );
// };
  
// export default GalleryItem;



import "./galleryItem.css";

import { Link } from "react-router-dom"; 
import Image from "../image/image"; 

const GalleryItem = ({ item }) => {

const optimizedHeight = (372 * item.height) / item.width

  return (
    <div
      className="galleryItem"
      style={{ gridRowEnd: `span ${Math.ceil(item.height / 100)}` }}
    >
     
      <Image 
          path={item.media} 
          alt={item.title || "Pin Image"} 
          w={372} 
          h={optimizedHeight}
      />
    
      <Link to={`/pin/${item._id}`} className="overlay" />
      <button className="saveButton">Save</button>
      <div className="overlayIcons">
        <button>
          <Image path="/general/share.svg" alt="Share" />
        </button>
        <button>
          <Image path="/general/more.svg" alt="More" />
        </button>
      </div>
    </div>
  );
};
  
export default GalleryItem;