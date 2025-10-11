

// import "./galleryItem.css";
// import { Link, useParams } from "react-router-dom";
// import Image from "../image/image";
// import { useLikeMutation } from "../../hooks/useLikeMutation";

// const GalleryItem = ({ item }) => {
//   const { username } = useParams();
//   const likeMutation = useLikeMutation(username);

//   const optimizedHeight = (372 * item.height) / item.width;

//   const handleLike = () => {
//     likeMutation.mutate(item._id);
//   };

//   return (
//     <div
//       className="galleryItem"
//       style={{ gridRowEnd: `span ${Math.ceil(item.height / 100)}` }}
//     >
//       <Image 
//         path={item.media} 
//         alt={item.title || "Pin Image"} 
//         w={372} 
//         h={optimizedHeight}
//       />
//       <Link to={`/pin/${item._id}`} className="overlay" />
//       <button className="saveButton">Save</button>
//       <div className="overlayIcons">
//         <button onClick={handleLike} disabled={likeMutation.isLoading}>
//           <Image path="/general/share.svg" alt="Share" />
//           {/* Optionally add like count icon or number */}
//         </button>
//         <button>
//           <Image path="/general/more.svg" alt="More" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default GalleryItem;



import "./galleryItem.css";
import { Link, useParams } from "react-router-dom";
import Image from "../image/image";
import { useLikeMutation } from "../../hooks/useLikeMutation";
import PostInteractions from "../postInteractions/postInteractions";

const GalleryItem = ({ item }) => {
  const { username } = useParams();
  const likeMutation = useLikeMutation(username);

  const optimizedHeight = (372 * item.height) / item.width;

  const handleLike = () => {
    likeMutation.mutate(item._id);
  };

  return (
    <div
      className="galleryItem"
      style={{ gridRowEnd: `span ${Math.ceil(item.height / 100)}` }}
    >
      {/* --- Display Image --- */}
      <Image
        path={item.media}
        alt={item.title || "Pin Image"}
        w={372}
        h={optimizedHeight}
      />

      {/* --- Overlay link to pin detail page --- */}
      <Link to={`/pin/${item._id}`} className="overlay" />

      {/* --- Interaction buttons --- */}
      <div className="overlayIcons">
        <button onClick={handleLike} disabled={likeMutation.isLoading}>
          <Image
            path="/general/heart.svg"
            alt="Like"
            className={likeMutation.isLoading ? "disabled" : ""}
          />
        </button>

        <button>
          <Image path="/general/more.svg" alt="More" />
        </button>
      </div>

      {/* --- Like / Save / Share / Delete section --- */}
   <PostInteractions
  postId={item._id}
  pinOwner={item.user}
  imageUrl={item.imageUrl}  // Use the full URL from backend
/>

    </div>
  );
};

export default GalleryItem;
