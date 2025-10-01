// import GalleryItem from "../galleryitem/Galleryitems";
// import "./gallery.css";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import InfiniteScroll from "react-infinite-scroll-component";
// import apiRequest from "../../utils/apiRequest";
// // import axios from "axios";
// import Skeleton from "../skeleton/skeleton";

// const fetchPins = async ({ pageParam, search, userId, boardId }) => {
//   const res = await axios.get(
//     `${import.meta.env.VITE_API_ENDPOINT}/pins?cursor=${pageParam}&search=${
//       search || ""
//     }&userId=${userId || ""}&boardId=${boardId || ""}`
//   );
//   return res.data;
// };
// const Gallery = ({ search, userId, boardId }) => {
//   const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
//     queryKey: ["pins", search, userId, boardId], // ✅ only once
//     queryFn: ({ pageParam = 0 }) =>
//       fetchPins({ pageParam, search, userId, boardId }),
//     initialPageParam: 0,
//     getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
//   });

//   if (status === "pending") return <Skeleton />;
//   if (status === "error") return "Something went wrong...";

//   const allPins = data?.pages.flatMap((page) => page.pins) || [];

//   return (
//     <InfiniteScroll
//       dataLength={allPins.length}
//       next={fetchNextPage}
//       hasMore={!!hasNextPage}
//       loader={<h4>Loading more pins</h4>}
//       endMessage={<h3>All Posts Loaded!</h3>}
//     >
//       <div className="gallery">
//         {allPins?.map((item) => (
//           <GalleryItem key={item._id} item={item} />
//         ))}
//       </div>
//     </InfiniteScroll>
//   );
// };

// export default Gallery;


import GalleryItem from "../galleryitem/Galleryitems"; // Assuming the file name is 'galleryitem.jsx'
import "./gallery.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import apiRequest from "../../utils/apiRequest"; // ✅ Use your configured API instance
// import axios from "axios"; // ❌ Standard axios import removed
import Skeleton from "../skeleton/skeleton";

// Use apiRequest for all backend communication (base URL and credentials handled automatically)
const fetchPins = async ({ pageParam, search, userId, boardId }) => {
  const res = await apiRequest.get(
    // The base URL (VITE_API_ENDPOINT) is prepended by apiRequest
    `/pins?cursor=${pageParam}&search=${
      search || ""
    }&userId=${userId || ""}&boardId=${boardId || ""}`
  );
  return res.data;
};

const Gallery = ({ search, userId, boardId }) => {
  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["pins", search, userId, boardId],
    queryFn: ({ pageParam = 0 }) =>
      fetchPins({ pageParam, search, userId, boardId }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  });

  // Check for loading state first
  if (status === "pending") return <Skeleton />;
  
  // Check for error state
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