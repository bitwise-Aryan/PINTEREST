// import React, { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import { BrowserRouter, Route, Routes } from "react-router";
// import MainLayout from "./routes/layouts/mainLayout";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// import Homepage from "./routes/homepage/homepage";
// // import CreatePage from "./routes/createPage/createPage";
// import PostPage from "./routes/postPage/postPage";
// import ProfilePage from "./routes/profilePage/profilePage";
// import SearchPage from "./routes/searchPage/searchPage";
// // import AuthPage from "./routes/authPage/authPage";

// // const Homepage = React.lazy(() => import("./routes/homepage/homepage"));
// // // const CreatePage = React.lazy(() => import("./routes/createPage/createPage"));
// // const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
// // const ProfilePage = React.lazy(() =>
// //   import("./routes/profilePage/profilePage")
// // );
// // const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
// // const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));

// const queryClient = new QueryClient();

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <Routes>
//           <Route element={<MainLayout />}>
//             <Route path="/" element={<Homepage />} />
//             {/* <Route path="/create" element={<CreatePage />} /> */}
//             <Route path="/pin/:id" element={<PostPage />} />
//             <Route path="/:username" element={<ProfilePage />} />
//             <Route path="/search" element={<SearchPage />} />
//           </Route>
//           {/* <Route path="/auth" element={<AuthPage />} /> */}
//         </Routes>
//       </BrowserRouter>
//     </QueryClientProvider>
//   </StrictMode>
// );


import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// ✅ FIX 1: Use 'react-router-dom' for browser routing components
import { BrowserRouter, Route, Routes } from "react-router-dom"; 
import MainLayout from "./routes/layouts/mainLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";



import { IKContext } from "imagekitio-react"; 
const Homepage = React.lazy(() => import("./routes/homepage/homepage"));
// const CreatePage = React.lazy(() => import("./routes/createPage/createPage"));
const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
const ProfilePage = React.lazy(() =>
  import("./routes/profilePage/profilePage")
);
const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));

const queryClient = new QueryClient();

// Get the ImageKit URL Endpoint (ensure VITE_URL_IK_ENDPOINT is correct in your .env)
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_URL_IK_ENDPOINT; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* ✅ CRITICAL FIX: Wrap the application with IKContext */}
      <IKContext urlEndpoint={IMAGEKIT_URL_ENDPOINT}> 
        <BrowserRouter>
          {/* Note: If you switch back to React.lazy imports, you must add <Suspense> here */}
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Homepage />} />
              {/* <Route path="/create" element={<CreatePage />} /> */}
              <Route path="/pin/:id" element={<PostPage />} />
              <Route path="/:username" element={<ProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
            </Route>
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </BrowserRouter>
      </IKContext>
    </QueryClientProvider>
  </StrictMode>
);