import Image from "../image/image";
import { format } from "timeago.js";
import useAuthStore from "../../utils/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { toast } from "react-toastify";

// API call function for deleting a comment
const deleteComment = async (commentId) => {
  const res = await apiRequest.delete(`/comments/${commentId}`);
  return res.data;
};

const Comment = ({ comment, postId }) => {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Setup mutation for deleting a comment
  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      // Invalidate and refetch the comments for this specific post
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment deleted!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete comment.");
    },
  });

  const handleDelete = () => {
    // You can add a confirmation dialog here if you want, for example:
    // if (window.confirm("Are you sure you want to delete this comment?")) {
    //   mutation.mutate(comment._id);
    // }
    mutation.mutate(comment._id);
  };

  return (
    <div className="comment">
      <Image path={comment.user.img || "/general/noAvatar.png"} alt="" />
      <div className="commentContent">
        <div className="commentHeader">
          <span className="commentUsername">{comment.user.displayName}</span>
          {/* Conditionally render delete button only for the comment's author */}
          {currentUser?._id === comment.user._id && (
            <button
              className="deleteCommentBtn"
              onClick={handleDelete}
              disabled={mutation.isPending}
              title="Delete comment"
            >
              {/* Make sure you have a trash icon at this path */}
              <img src="/general/trash.png" alt="Delete" />
            </button>
          )}
        </div>
        <p className="commentText">{comment.description}</p>
        <span className="commentTime">{format(comment.createdAt)}</span>
      </div>
    </div>
  );
};

export default Comment;
