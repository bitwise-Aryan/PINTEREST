// // import EmojiPicker from "emoji-picker-react";
// // import { useState } from "react";
// // import apiRequest from "../../utils/apiRequest";
// // import { useMutation, useQueryClient } from "@tanstack/react-query";

// // const addComment = async (comment) => {
// //   const res = await apiRequest.post("/comments", comment);
// //   return res.data;
// // };

// // const CommentForm = ({ id }) => {
// //   const [open, setOpen] = useState(false);
// //   const [desc, setDesc] = useState("");

// //   const handleEmojiClick = (emoji) => {
// //     setDesc((prev) => prev + " " + emoji.emoji);
// //     setOpen(false);
// //   };

// //   const queryClient = useQueryClient();

// //   const mutation = useMutation({
// //     mutationFn: addComment,
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["comments", id] });
// //       setDesc("");
// //       setOpen(false);
// //     },
// //   });

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     mutation.mutate({
// //       description: desc,
// //       pin: id,
// //     });
// //   };

// //   return (
// //     <form className="commentForm" onSubmit={handleSubmit}>
// //       <input
// //         type="text"
// //         placeholder="Add a comment"
// //         onChange={(e) => setDesc(e.target.value)}
// //         value={desc}
// //       />
// //       <div className="emoji">
// //         <div onClick={() => setOpen((prev) => !prev)}>😊</div>
// //         {open && (
// //           <div className="emojiPicker">
// //             <EmojiPicker onEmojiClick={handleEmojiClick} />
// //           </div>
// //         )}
// //       </div>
// //     </form>
// //   );
// // };

// // export default CommentForm;


// import EmojiPicker from "emoji-picker-react";
// import { useState } from "react";
// import apiRequest from "../../utils/apiRequest";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import useAuthStore from "../../utils/authStore"; 
// import { toast } from "react-toastify";

// const addComment = async (comment) => {
//   const res = await apiRequest.post("/comments", comment);
//   return res.data;
// };

// const CommentForm = ({ id }) => {
//   const [open, setOpen] = useState(false);
//   const [desc, setDesc] = useState("");
//   const { currentUser } = useAuthStore();
//   const queryClient = useQueryClient();

//   const handleEmojiClick = (emoji) => {
//     setDesc((prev) => prev + " " + emoji.emoji);
//     setOpen(false);
//   };

//   const mutation = useMutation({
//     mutationFn: addComment,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["comments", id] });
//       setDesc("");
//       setOpen(false);
      
//       toast.success("Comment added successfully!"); 
//     },
//     onError: () => {
//       toast.error("Failed to post comment.");
//     }
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Check if user is logged in
//     if (!currentUser) {
//         toast.warn("Kindly login/signup if you wish to comment."); 
//         return;
//     }
    
//     // Check if description is empty
//     if (!desc.trim()) {
//         toast.warn("Comment cannot be empty.");
//         return;
//     }

//     mutation.mutate({
//       description: desc.trim(),
//       pin: id,
//     });
//   };

//   return (
//     <form className="commentForm" onSubmit={handleSubmit}>
//       <input
//         type="text"
//         placeholder={currentUser ? "Add a comment" : "Login to comment..."}
//         onChange={(e) => setDesc(e.target.value)}
//         value={desc}
//         disabled={mutation.isPending || !currentUser}
//       />
//       <button 
//         type="submit" 
//         disabled={mutation.isPending || !desc.trim() || !currentUser}
//       >
//         {mutation.isPending ? "Sending..." : "Post"}
//       </button>

//       <div className="emoji">
//         <div onClick={() => setOpen((prev) => !prev)}>😊</div>
//         {open && (
//           <div className="emojiPicker">
//             <EmojiPicker onEmojiClick={handleEmojiClick} />
//           </div>
//         )}
//       </div>
//     </form>
//   );
// };

// export default CommentForm;


import EmojiPicker from "emoji-picker-react";
import { useState } from "react";
import { useParams } from "react-router";
import useAuthStore from "../../utils/authStore";
import { toast } from "react-toastify";
import { useCommentMutation } from "../../hooks/useCommentMutation"; // <-- Use .js file extension

const CommentForm = ({ id }) => {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const { currentUser } = useAuthStore();
  const { username } = useParams();
  const commentMutation = useCommentMutation(username);

  const handleEmojiClick = (emoji) => {
    setDesc((prev) => prev + " " + emoji.emoji);
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.warn("Kindly login/signup if you wish to comment.");
      return;
    }
    if (!desc.trim()) {
      toast.warn("Comment cannot be empty.");
      return;
    }
    commentMutation.mutate({
      description: desc.trim(),
      pin: id,
    }, {
      onSuccess: () => {
        setDesc("");
        setOpen(false);
        toast.success("Comment added successfully!");
      },
      onError: () => {
        toast.error("Failed to post comment.");
      }
    });
  };

  return (
    <form className="commentForm" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={currentUser ? "Add a comment" : "Login to comment..."}
        onChange={(e) => setDesc(e.target.value)}
        value={desc}
        disabled={commentMutation.isPending || !currentUser}
      />
      <button
        type="submit"
        disabled={commentMutation.isPending || !desc.trim() || !currentUser}
      >
        {commentMutation.isPending ? "Sending..." : "Post"}
      </button>
      <div className="emoji">
        <div onClick={() => setOpen((prev) => !prev)}>😊</div>
        {open && (
          <div className="emojiPicker">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </form>
  );
};

export default CommentForm;
