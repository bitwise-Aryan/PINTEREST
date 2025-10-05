/*
Comments.jsx (plural) is the container or the list. Its main job is to fetch all the comments for a post and then loop through them. For each comment it gets from the database, it renders a single <Comment /> component. Think of it as the entire "Comments Section".

Comment.jsx (singular) represents one individual comment. Its job is to display the information for a single comment (the user's avatar, name, and the text). Because it represents a single item, it's the perfect place to put the logic for actions related to that specific item, such as the delete functionality.


*/

import "./comments.css";
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import Comment from "./comment";
import CommentForm from "./commentForm";
const Comments = ({ id }) => {
  const { isPending, error, data } = useQuery({//make our work easier does the job of both useState and useEffect of maintaining th state and calling the api both
    queryKey: ["comments", id],//query key is an array that fetches and cache the comments of each post ["comments", "postId123"] is a different query from ["comments", "postId456"].
    queryFn: () => apiRequest.get(`/comments/${id}`).then((res) => res.data),
  });
  if (isPending) return "Loading...";
  if (error) return "An error has occurred: " + error.message;
  console.log(data);
  return (
    <div className="comments">
      <div className="commentList">
        <span className="commentCount">{data.length === 0 ? "No comments" : data.length + " Comments"}</span>
        {/* COMMENT */}
        {data.map((comment) => (
          <Comment key={comment._id} comment={comment} postId={id} />
        ))}
      </div>
      <CommentForm id={id}/>
    </div>
  );
};
export default Comments;
