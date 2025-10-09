import GalleryItem from "../galleryitem/Galleryitems";
import "./gallery.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import Skeleton from "../skeleton/skeleton";

const fetchPins = async ({ pageParam, search, userId, boardId, savedUserId }) => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_ENDPOINT}/pins?cursor=${pageParam}&search=${
      search || ""
    }&userId=${userId || ""}&boardId=${boardId || ""}&savedUserId=${savedUserId || ""}`
  );
  return res.data;
};

// The component now accepts an optional 'pins' prop, which we rename to 'staticPins'
const Gallery = ({ search, userId, boardId, savedUserId, pins: staticPins }) => {
  
  // This hook is for infinite scrolling on other pages
  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["pins", search, userId, boardId, savedUserId],
    queryFn: ({ pageParam = 0 }) =>
      fetchPins({ pageParam, search, userId, boardId, savedUserId }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    // This line disables this query if we provide a list of pins directly
    enabled: !staticPins, 
  });

  // --- THIS IS THE NEW LOGIC ---
  // If a specific list of pins (staticPins) is provided, render them and stop.
  if (staticPins) {
    return (
      <div className="gallery">
        {staticPins.map((item) => (
          <GalleryItem key={item._id} item={item} />
        ))}
      </div>
    );
  }

  // This is the original logic that runs on your homepage/profile for infinite scroll
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