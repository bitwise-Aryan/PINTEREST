
// import React, { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// // ✅ FIX 1: Use 'react-router-dom' for browser routing components
// import { BrowserRouter, Route, Routes } from "react-router-dom"; 
// import MainLayout from "./routes/layouts/mainLayout";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";



// import { IKContext } from "imagekitio-react"; 
// const Homepage = React.lazy(() => import("./routes/homepage/homepage"));
// // In main.jsx

// // const CreatePage = React.lazy(() => 
// //   // Change 'createPage' to 'CreatePage' to match the file name on disk
// //   import("./routes/createPage/createPage") 
// // );
// const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
// const ProfilePage = React.lazy(() =>
//   import("./routes/profilePage/profilePage")
// );
// const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
// const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));

// const queryClient = new QueryClient();

// // Get the ImageKit URL Endpoint (ensure VITE_URL_IK_ENDPOINT is correct in your .env)
// const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_URL_IK_ENDPOINT; 

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <QueryClientProvider client={queryClient}>
//       {/* ✅ CRITICAL FIX: Wrap the application with IKContext */}
//       <IKContext urlEndpoint={IMAGEKIT_URL_ENDPOINT}> 
//         <BrowserRouter>
//           {/* Note: If you switch back to React.lazy imports, you must add <Suspense> here */}
//           <Routes>
//             <Route element={<MainLayout />}>
//               <Route path="/" element={<Homepage />} />
//               {/* <Route path="/create" element={<CreatePage />} /> */}
//               <Route path="/pin/:id" element={<PostPage />} />
//               <Route path="/:username" element={<ProfilePage />} />
//               <Route path="/search" element={<SearchPage />} />
//             </Route>
//             <Route path="/auth" element={<AuthPage />} />
//           </Routes>
//         </BrowserRouter>
//       </IKContext>
//     </QueryClientProvider>
//   </StrictMode>
// );


// import { StrictMode } from "react"; // Fixed: Removed 'React,' to resolve 'already declared' error
// import { createRoot } from "react-dom/client";
// import "./index.css";
// // NOTE: Using 'react-router-dom' for modern React Router components
// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import MainLayout from "./routes/layouts/mainLayout";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import React, { Suspense } from "react"; // Explicitly import React for lazy/Suspense
// import { IKContext } from "imagekitio-react"; 


// // import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // --- Lazy Loaded Components ---
// const Homepage = React.lazy(() => import("./routes/homepage/homepage"));
// // Ensure the CreatePage path matches the file system case (e.g., 'createPages' folder)
// const CreatePage = React.lazy(() => import("./routes/createPage/createPages")); 
// const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
// const ProfilePage = React.lazy(() =>
//   import("./routes/profilePage/profilePage")
// );
// const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
// const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));

// // --- Configuration ---
// const queryClient = new QueryClient();
// const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_URL_IK_ENDPOINT; 

// // --- Render ---
// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <QueryClientProvider client={queryClient}>
//       <IKContext urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
//         <BrowserRouter>
//           {/* Suspense is REQUIRED when using React.lazy */}
//           <Suspense fallback={<div>Loading...</div>}>
//             <Routes>
//               <Route element={<MainLayout />}>
//                 <Route path="/" element={<Homepage />} />
//                 <Route path="/create" element={<CreatePage />} />
//                 <Route path="/pin/:id" element={<PostPage />} />
//                 <Route path="/profile/:username" element={<ProfilePage />} />
//                 <Route path="/search" element={<SearchPage />} />
//               </Route>
//               <Route path="/auth" element={<AuthPage />} />
//             </Routes>
//           </Suspense>
//         </BrowserRouter>
//       </IKContext>
//     </QueryClientProvider>
//   </StrictMode>
// );





import { StrictMode } from "react"; // Fixed: Removed 'React,' to resolve 'already declared' error
import { createRoot } from "react-dom/client";
import "./index.css";
// NOTE: Using 'react-router-dom' for modern React Router components
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./routes/layouts/mainLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react"; // Explicitly import React for lazy/Suspense
import { IKContext } from "imagekitio-react"; 

// --- Lazy Loaded Components ---
const Homepage = React.lazy(() => import("./routes/homepage/homepage"));
// Ensure the CreatePage path matches the file system case (e.g., 'createPages' folder)
const CreatePage = React.lazy(() => import("./routes/createPage/createPages")); 
const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
const ProfilePage = React.lazy(() =>
  import("./routes/profilePage/profilePage")
);
const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));

// --- Configuration ---
const queryClient = new QueryClient();
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_URL_IK_ENDPOINT; 

// --- Render ---
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <IKContext urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
        <BrowserRouter>
          {/* Suspense is REQUIRED when using React.lazy */}
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Homepage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/pin/:id" element={<PostPage />} />
                {/* 🌟 FIX: Added '/profile' to match the navigation path like /profile/username 🌟 */}
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/search" element={<SearchPage />} />
              </Route>
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </IKContext>
    </QueryClientProvider>
  </StrictMode>
);