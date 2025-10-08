import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../utils/apiRequest";

export function useCommentMutation(username) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentData) => apiRequest.post("/comments", commentData),
    onSuccess: () => {
      queryClient.invalidateQueries(["dashboard", username], { exact: true });
      queryClient.refetchQueries(["dashboard", username], { exact: true });
    },
  });
}
