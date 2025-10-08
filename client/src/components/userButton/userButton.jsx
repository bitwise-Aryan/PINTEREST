// // import { useState } from "react";
// // import "./userButton.css";
// // import Image from "../image/image";
// // import apiRequest from "../../utils/apiRequest";
// // import { Link, useNavigate } from "react-router";
// // import useAuthStore from "../../utils/authStore";
// // const UserButton = () => {
// //   const [open, setOpen] = useState(false);
// //   const navigate = useNavigate();
// //   // TEMP
// //   // const currentUser = true;
// //   const { currentUser, removeCurrentUser } = useAuthStore();
// //   console.log(currentUser);
// //   const handleLogout = async () => {
// //     try {
// //       await apiRequest.post("/users/auth/logout", {});
// //       removeCurrentUser();
// //       navigate("/auth");
// //     } catch (err) {
// //       console.log(err);
// //     }
// //   };
// //   return currentUser ? (
// //     <div className="userButton">
// //       <Image path={currentUser.img || "/general/noAvatar.png"} alt="" />
// //       <div onClick={() => setOpen((prev) => !prev)}>
// //         <Image path="/general/arrow.svg" alt="" className="arrow" />
// //       </div>
// //       {open && (
// //         <div className="userOptions">
// //           <Link to={`/profile/${currentUser.username}`} className="userOption">
// //             Profile
// //           </Link>
// //           <div className="userOption">Setting</div>
// //           <div className="userOption" onClick={handleLogout}>
// //             Logout
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   ) : (
// //     <Link to="/auth" className="loginLink">
// //       Login / Sign Up
// //     </Link>
// //   );
// // };

// // export default UserButton;


// import { useState } from "react";
// import "./userButton.css";
// import Image from "../image/image";
// import apiRequest from "../../utils/apiRequest";
// // NOTE: Must import Link from "react-router-dom" if using React Router v6+
// import { Link, useNavigate } from "react-router-dom"; 
// import useAuthStore from "../../utils/authStore";

// const UserButton = () => {
//   const [open, setOpen] = useState(false);
//   const navigate = useNavigate();
//   
//   const { currentUser, removeCurrentUser } = useAuthStore();
//   
//   const handleLogout = async () => {
//     try {
//         // This endpoint path is correct for your integrated backend routes
//       await apiRequest.post("/users/auth/logout", {}); 
//       removeCurrentUser();
//       navigate("/auth");
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   
//   return currentUser ? (
//     <div className="userButton">
//       <Image path={currentUser.img || "/general/noAvatar.png"} alt="" />
//       <div onClick={() => setOpen((prev) => !prev)}>
//         <Image path="/general/arrow.svg" alt="" className="arrow" />
//       </div>
//       {open && (
//         <div className="userOptions">
//           <Link to={`/profile/${currentUser.username}`} className="userOption">
//             Profile
//           </Link>
//           <div className="userOption">Setting</div>
//           <div className="userOption" onClick={handleLogout}>
//             Logout
//           </div>
//         </div>
//       )}
//     </div>
//   ) : (
//     <Link to="/auth" className="loginLink">
//       Login / Sign Up
//     </Link>
//   );
// };

// export default UserButton;


// src/components/userButton/UserButton.jsx (Confirmed Correct)

import { useState } from "react";
import "./userButton.css";
import Image from "../image/image";
import apiRequest from "../../utils/apiRequest";
import { Link, useNavigate } from "react-router-dom"; 
import useAuthStore from "../../utils/authStore";

const UserButton = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const { currentUser, removeCurrentUser } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await apiRequest.post("/users/auth/logout", {}); 
      removeCurrentUser();
      navigate("/auth");
    } catch (err) {
      console.log(err);
    }
  };
  
  return currentUser ? (
    <div className="userButton">
      <Image path={currentUser.img || "/general/noAvatar.png"} alt="" />
      <div onClick={() => setOpen((prev) => !prev)}>
        <Image path="/general/arrow.svg" alt="" className="arrow" />
      </div>
      {open && (
        <div className="userOptions">
          <Link 
                to={`/profile/${currentUser.username}`} 
                className="userOption"
            >
            Profile
          </Link>
          <div className="userOption">Setting</div>
          <div className="userOption" onClick={handleLogout}>
            Logout
          </div>
        </div>
      )}
    </div>
  ) : (
    <Link to="/auth" className="loginLink">
      Login / Sign Up
    </Link>
  );
};

export default UserButton;