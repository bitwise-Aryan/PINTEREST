// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import apiRequest from "../../utils/apiRequest";

// const followUser = async (username) => {
//   const res = await apiRequest.post(`/users/follow/${username}`);
//   return res.data;
// };

// const FollowButton = ({ isFollowing, username }) => {
//   const queryClient = useQueryClient();

//   const mutation = useMutation({
//     mutationFn: followUser,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["profile", username] });
//     },
//   });

//   return (
//     <button
//       onClick={() => mutation.mutate(username)}
//       disabled={mutation.isPending}
//     >
//       {isFollowing ? "Unfollow" : "Follow"}
//     </button>
//   );
// };

// export default FollowButton;


// FollowButton.jsx (No change needed)

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";

const followUser = async (username) => {
    // This uses the correct path: /users/follow/username
    const res = await apiRequest.post(`/users/follow/${username}`); 
    return res.data;
};

const FollowButton = ({ isFollowing, username }) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: followUser,
        onSuccess: () => {
            // Invalidate the profile to show the updated follower count/button state
            queryClient.invalidateQueries({ queryKey: ["profile", username] });
        },
    });

    return (
        <button
            onClick={() => mutation.mutate(username)}
            disabled={mutation.isPending}
        >
            {isFollowing ? "Unfollow" : "Follow"}
        </button>
    );
};

export default FollowButton;