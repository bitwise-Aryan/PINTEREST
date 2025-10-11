
// import Image from "../image/image";
// import "./postInteractions.css";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import apiRequest from "../../utils/apiRequest";
// import { useState } from "react";
// import useAuthStore from "../../utils/authStore";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { Link } from "react-router-dom";

// // API function to delete a pin
// const deletePin = async (id) => {
//   const res = await apiRequest.delete(`/pins/${id}`);
//   return res.data;
// };

// // API function for like/save
// const interact = async (id, type) => {
//   const res = await apiRequest.post(`/pins/interact/${id}`, { type });
//   return res.data;
// };

// // The component now accepts `pinOwner`
// const PostInteractions = ({ postId, pinOwner }) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const { currentUser } = useAuthStore();
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();

//   // --- DELETE PIN LOGIC ---
//   const deleteMutation = useMutation({
//     mutationFn: deletePin,
//     onSuccess: () => {
//       // Refetch the pins on the user's profile page so it updates
//       queryClient.invalidateQueries({ queryKey: ["pins", null, currentUser._id] });
//       toast.success("Pin deleted successfully!");
//       // Navigate to the user's profile after deletion
//       navigate(`/profile/${currentUser.username}`);
//     },
//     onError: (err) => {
//       toast.error(err.response?.data?.message || "Failed to delete pin.");
//     }
//   });

//   const handleDelete = () => {
//     if (window.confirm("Are you sure you want to permanently delete this pin?")) {
//       deleteMutation.mutate(postId);
//     }
//     setMenuOpen(false); // Close menu after action
//   };


//   // --- LIKE/SAVE LOGIC (Existing) ---
//   const interactMutation = useMutation({
//     mutationFn: ({ id, type }) => interact(id, type),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["interactionCheck", postId] });
//     },
//   });

//   const { isPending, error, data } = useQuery({
//     queryKey: ["interactionCheck", postId],
//     queryFn: () =>
//       apiRequest
//         .get(`/pins/interaction-check/${postId}`)
//         .then((res) => res.data),
//   });

//   // Check if the current user is the owner of the pin
//   const isOwner = currentUser?._id === pinOwner?._id;

//   if (isPending || error) return null;

//   return (
//     <div className="postInteractions">
//       <div className="interactionIcons">
//         <svg
//           width="20"
//           height="20"
//           viewBox="0 0 24 24"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//           onClick={() => interactMutation.mutate({ id: postId, type: "like" })}
//         >
//           <path
//             d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
//             stroke={data.isLiked ? "#e50829" : "#000000"}
//             strokeWidth="2"
//             fill={data.isLiked ? "#e50829" : "none"}
//           />
//         </svg>
//         {data.likeCount}
//         <Image path="/general/share.svg" alt="" />

//         <Link to={`/pin/${postId}/similar`} className="similarButton" title="Find visually similar pins">
//           ✨
//         </Link>

//         {/* --- THREE DOTS MENU --- */}
//         <div className="moreMenuContainer">
//           <Image
//             path="/general/more.svg"
//             alt="More options"
//             onClick={() => setMenuOpen((prev) => !prev)}
//           />
//           {menuOpen && (
//             <div className="moreMenu">
//               {isOwner && (
//                 <button
//                   onClick={handleDelete}
//                   disabled={deleteMutation.isPending}
//                   className="deleteButton"
//                 >
//                        ___delete pin
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//       <button
//         disabled={interactMutation.isPending}
//         onClick={() => interactMutation.mutate({ id: postId, type: "save" })}
//       >
//         {data.isSaved ? "Saved" : "Save"}
//       </button>
//     </div>
//   );
// };

// export default PostInteractions;
import Image from "../image/image";
import "./postInteractions.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { useState } from "react";
import useAuthStore from "../../utils/authStore";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

// ✅ Helper: fetch image from URL and convert to File (for Web Share API)
const fetchImageAsFile = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const fileName = imageUrl.split("/").pop();
  return new File([blob], fileName, { type: blob.type });
};

// ✅ API: delete pin
const deletePin = async (id) => {
  const res = await apiRequest.delete(`/pins/${id}`);
  return res.data;
};

// ✅ API: like/save interact
const interact = async (id, type) => {
  const res = await apiRequest.post(`/pins/interact/${id}`, { type });
  return res.data;
};

const PostInteractions = ({ postId, pinOwner, imageUrl }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: deletePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins", null, currentUser._id] });
      toast.success("Pin deleted successfully!");
      navigate(`/profile/${currentUser.username}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete pin.");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to permanently delete this pin?")) {
      deleteMutation.mutate(postId);
    }
    setMenuOpen(false);
  };

  // ✅ Like/Save logic
  const interactMutation = useMutation({
    mutationFn: ({ id, type }) => interact(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactionCheck", postId] });
    },
  });

  const { isPending, error, data } = useQuery({
    queryKey: ["interactionCheck", postId],
    queryFn: () => apiRequest.get(`/pins/interaction-check/${postId}`).then((res) => res.data),
  });

  if (isPending || error) return null;

  const isOwner = currentUser?._id === pinOwner?._id;

  // ✅ Correctly use your ImageKit URL endpoint
  const imageToShare =
    imageUrl?.startsWith("http")
      ? imageUrl
      : `${import.meta.env.VITE_URL_IK_ENDPOINT}/${imageUrl}`;

  // ✅ Share Handler
  const handleShare = async () => {
    try {
      // Try native share (mobile)
      if (navigator.canShare && navigator.canShare({ files: [] })) {
        const file = await fetchImageAsFile(imageToShare);
        await navigator.share({
          title: "Check this post!",
          text: "Found this amazing image on our website!",
          files: [file],
        });
      } else {
        // Fallback for desktop: open WhatsApp/Facebook options
        setShareOpen((prev) => !prev);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="postInteractions">
      <div className="interactionIcons">
        {/* ❤️ Like */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => interactMutation.mutate({ id: postId, type: "like" })}
          style={{ cursor: "pointer" }}
        >
          <path
            d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
            stroke={data.isLiked ? "#e50829" : "#000"}
            strokeWidth="2"
            fill={data.isLiked ? "#e50829" : "none"}
          />
        </svg>
        {data.likeCount}

        {/* 📤 Share */}
        <div className="shareMenuContainer">
          <Image
            path="/general/share.svg"
            alt="Share"
            className="shareIcon"
            onClick={handleShare}
          />
          {shareOpen && (
            <div className="shareMenu">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(imageToShare)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share on WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageToShare)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share on Facebook
              </a>
            </div>
          )}
        </div>

        {/* ✨ Similar Pins */}
        <Link to={`/pin/${postId}/similar`} className="similarButton" title="Find visually similar pins">
          ✨
        </Link>

        {/* ⋮ Delete Menu */}
        <div className="moreMenuContainer">
          <Image
            path="/general/more.svg"
            alt="More options"
            onClick={() => setMenuOpen((prev) => !prev)}
          />
          {menuOpen && (
            <div className="moreMenu">
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="deleteButton"
                >
                  Delete Pin
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 💾 Save */}
      <button
        disabled={interactMutation.isPending}
        onClick={() => interactMutation.mutate({ id: postId, type: "save" })}
      >
        {data.isSaved ? "Saved" : "Save"}
      </button>
    </div>
  );
};

export default PostInteractions;
