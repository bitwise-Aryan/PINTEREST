
// import { StrictMode } from "react"; // Fixed: Removed 'React,' to resolve 'already declared' error
// import { createRoot } from "react-dom/client";
// import "./index.css";
// // NOTE: Using 'react-router-dom' for modern React Router components
// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import MainLayout from "./routes/layouts/mainLayout";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import React, { Suspense } from "react"; // Explicitly import React for lazy/Suspense
// import { IKContext } from "imagekitio-react"; 

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
//                 {/*  FIX: Added '/profile' to match the navigation path like /profile/username  */}
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


// import { StrictMode } from "react"; 
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import MainLayout from "./routes/layouts/mainLayout";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import React, { Suspense } from "react"; 
// import { IKContext } from "imagekitio-react"; 

// // --- Lazy Loaded Components ---
// const Homepage = React.lazy(() => import("./routes/homepage/homepage"));
// const CreatePage = React.lazy(() => import("./routes/createPage/createPages")); 
// const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
// const ProfilePage = React.lazy(() =>
//   import("./routes/profilePage/profilePage")
// );
// const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
// const AuthPage = React.lazy(() => import("./routes/authPage/AuthPage"));

// // --- NEW LAZY LOADED COMPONENTS FOR AUTH FLOW ---
// const ForgotPassword = React.lazy(() => import("./routes/ForgotPassword/ForgotPassword"));
// const ResetPassword = React.lazy(() => import("./routes/ResetPassword/ResetPassword"));
// const OtpVerification = React.lazy(() => import("./routes/OtpVerification/OtpVerification"));


// // --- Configuration ---
// const queryClient = new QueryClient();
// const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_URL_IK_ENDPOINT; 

// // --- Render ---
// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <QueryClientProvider client={queryClient}>
//       <IKContext urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
//         <BrowserRouter>
//           {/* Suspense is REQUIRED when using React.lazy */}
//           <Suspense fallback={<div>Loading...</div>}>
//             <Routes>
//               
//               {/* Routes using the Main Layout */}
//               <Route element={<MainLayout />}>
//                 <Route path="/" element={<Homepage />} />
//                 <Route path="/create" element={<CreatePage />} />
//                 <Route path="/pin/:id" element={<PostPage />} />
//                 <Route path="/profile/:username" element={<ProfilePage />} />
//                 <Route path="/search" element={<SearchPage />} />
//               </Route>
//               
//               {/* Standalone Authentication Routes (No MainLayout) */}
//               <Route path="/auth" element={<AuthPage />} />

//               {/* NEW: Forgot Password Route */}
//               <Route path="/password/forgot" element={<ForgotPassword />} />

//               {/* NEW: Reset Password Route (Requires token in URL) */}
//               <Route path="/password/reset/:token" element={<ResetPassword />} />

//               {/* NEW: OTP Verification Route (Requires email and phone/placeholder in URL) */}
//               <Route path="/otp-verification/:email/:phone" element={<OtpVerification />} />

//             </Routes>
//           </Suspense>
//         </BrowserRouter>
//       </IKContext>
//     </QueryClientProvider>
//   </StrictMode>
// );


// src/main.jsx - No changes needed, confirming structure

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./routes/layouts/mainLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { IKContext } from "imagekitio-react";

// --- Lazy Loaded Components ---
const Homepage = React.lazy(() => import("./routes/homepage/homepage"));
const CreatePage = React.lazy(() => import("./routes/createPage/createPages"));
const PostPage = React.lazy(() => import("./routes/postPage/postPage"));
const ProfilePage = React.lazy(() => import("./routes/profilePage/profilePage"));
const SearchPage = React.lazy(() => import("./routes/searchPage/searchPage"));
const AuthPage = React.lazy(() => import("./routes/authPage/authPage"));
const ForgotPassword = React.lazy(() => import("./routes/ForgotPassword/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./routes/ResetPassword/ResetPassword"));
const OtpVerification = React.lazy(() => import("./routes/OtpVerification/OtpVerification"));
const ExplorePage = React.lazy(() => import("./routes/explorePage/explorePage")); // Correctly added

// --- Configuration ---
const queryClient = new QueryClient();
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_URL_IK_ENDPOINT;

// --- Render ---
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <IKContext urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Homepage />} />
                <Route path="/explore" element={<ExplorePage />} /> {/* Correctly added */}
                <Route path="/create" element={<CreatePage />} />
                <Route path="/pin/:id" element={<PostPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/search" element={<SearchPage />} />
              </Route>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/password/forgot" element={<ForgotPassword />} />
              <Route path="/password/reset/:token" element={<ResetPassword />} />
              <Route path="/otp-verification/:email/:phone" element={<OtpVerification />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </IKContext>
    </QueryClientProvider>
  </StrictMode>
);