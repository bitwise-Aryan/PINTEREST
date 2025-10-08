


import "./profilePage.css";
import Image from "../../components/image/image";
import { useState } from "react";
import Gallery from "../../components/gallery/gallery";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import apiRequest from "../../utils/apiRequest";
import FollowButton from "./FollowButton";

const ProfilePage = () => {
  const [type, setType] = useState("saved");
  const { username } = useParams();
  const queryClient = useQueryClient();

  // Fetch profile data
  const { isPending, error, data } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => apiRequest.get(`/users/${username}`).then((res) => res.data),
    retry: false,
  });

  // Fetch dashboard data with polling and ensure updated reference
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useQuery({
    queryKey: ["dashboard", username],
    queryFn: () =>
      apiRequest
        .get(`/users/${username}/dashboard`)
        .then((res) => JSON.parse(JSON.stringify(res.data.data))), // deep clone prevents stale compare
    retry: false,
    enabled: !!username,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    cacheTime: 0,
    structuralSharing: false,
    gcTime: 0,
  });

  // Call after like/comment mutation to refresh dashboard counts immediately
  const refreshDashboard = () => {
    queryClient.invalidateQueries(["dashboard", username]);
    queryClient.refetchQueries(["dashboard", username]);
  };

  if (isPending) return <div className="loading">Loading profile...</div>;

  if (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 404) return <div className="error">User not found!</div>;
    if (status === 403)
      return <div className="error">This account has not been verified yet.</div>;

    return <div className="error">An error occurred: {message}</div>;
  }

  if (!data) return <div className="error">User not found!</div>;

  return (
    <div className="profilePage">
      <Image
        className="profileImg"
        w={100}
        h={100}
        path={data.img || "/general/noAvatar.png"}
        alt=""
      />
      <h1 className="profileName">{data.displayName}</h1>
      <span className="profileUsername">@{data.username}</span>
      <div className="followCounts">
        {data.followerCount} followers · {data.followingCount} followings
      </div>
      <div className="profileInteractions">
        <Image path="/general/share.svg" alt="" />
        <div className="profileButtons">
          <button>Message</button>
          <FollowButton isFollowing={data.isFollowing} username={data.username} />
        </div>
        <Image path="/general/more.svg" alt="" />
      </div>

      {/* DASHBOARD SECTION */}
      <div className="profileDashboardWrapper">
        {dashboardLoading ? (
          <div className="dashboard-loading">Loading dashboard...</div>
        ) : dashboardError ? (
          <div className="dashboard-error">
            Failed to load dashboard: {dashboardError.message}
          </div>
        ) : dashboardData ? (
          <div className="profileDashboard">
            <div className="dashboardItem">
              <span className="dashboardLabel">No of Pins User created</span>
              <span className="dashboardValue">{dashboardData.postsCount}</span>
            </div>
            <div className="dashboardItem">
              <span className="dashboardLabel">Likes on user pins</span>
              <span className="dashboardValue">{dashboardData.likesCount}</span>
            </div>
            <div className="dashboardItem">
              <span className="dashboardLabel">Comments on user pins</span>
              <span className="dashboardValue">{dashboardData.commentsCount}</span>
            </div>
          </div>
        ) : null}
      </div>
      {/* END DASHBOARD SECTION */}

      <div className="profileOptions">
        <span
          onClick={() => setType("created")}
          className={type === "created" ? "active" : ""}
        >
          Created
        </span>
        <span
          onClick={() => setType("saved")}
          className={type === "saved" ? "active" : ""}
        >
          Saved
        </span>
      </div>

      {type === "created" ? (
        <Gallery userId={data._id} refreshDashboard={refreshDashboard} />
      ) : (
        <Gallery savedUserId={data._id} />
      )}
    </div>
  );
};

export default ProfilePage;
