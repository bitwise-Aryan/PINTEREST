import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../utils/apiRequest";

export function useLikeMutation(username) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pinId) => apiRequest.post(`/pins/${pinId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries(["dashboard", username], { exact: true });
      queryClient.refetchQueries(["dashboard", username], { exact: true });
    },
  });
}
