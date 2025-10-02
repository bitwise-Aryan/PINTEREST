import GalleryItem from "../galleryitem/Galleryitems";
import "./gallery.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import apiRequest from "../../utils/apiRequest";
import axios from "axios";
import Skeleton from "../skeleton/skeleton";

// / UPDATED: Added savedUserId to the arguments and API call
const fetchPins = async ({ pageParam, search, userId, boardId, savedUserId }) => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_ENDPOINT}/pins?cursor=${pageParam}&search=${
      search || ""
    }&userId=${userId || ""}&boardId=${boardId || ""}&savedUserId=${savedUserId || ""}`
  );
  return res.data;
};

//  UPDATED: Added savedUserId to the component props
const Gallery = ({ search, userId, boardId, savedUserId }) => { 
  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    //  UPDATED: Added savedUserId to the queryKey
    queryKey: ["pins", search, userId, boardId, savedUserId], 
    queryFn: ({ pageParam = 0 }) =>
      //  UPDATED: Passed savedUserId to fetchPins
      fetchPins({ pageParam, search, userId, boardId, savedUserId }), 
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  });

  if (status === "pending") return <Skeleton />;
  if (status === "error") return "Something went wrong...";

  const allPins = data?.pages.flatMap((page) => page.pins) || [];

  return (
    <InfiniteScroll
      dataLength={allPins.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h4>Loading more pins</h4>}
      endMessage={<h3>All Posts Loaded!</h3>}
    >
      <div className="gallery">
        {allPins?.map((item) => (
          <GalleryItem key={item._id} item={item} />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default Gallery;