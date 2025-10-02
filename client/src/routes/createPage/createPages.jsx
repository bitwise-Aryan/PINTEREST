// import "./createPage.css";
// import IKImage from "../../components/image/image";
// import useAuthStore from "../../utils/authStore";
// import { useNavigate } from "react-router";
// import { useEffect, useRef, useState } from "react";
// import Editor from "../../components/editor/editor";
// import useEditorStore from "../../utils/editorStore";
// import apiRequest from "../../utils/apiRequest";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import BoardForm from "./BoardForm";

// // FIXED: CHANGE DIRECT REQUEST TO MUTATION
// const addPost = async (post) => {
//   const res = await apiRequest.post("/pins", post);
//   return res.data;
// };

// const CreatePage = () => {
//   const { currentUser } = useAuthStore();
//   const navigate = useNavigate();
//   const formRef = useRef();
//   const { textOptions, canvasOptions, resetStore } = useEditorStore();

//   const [file, setFile] = useState(null);
//   const [previewImg, setPreviewImg] = useState({
//     url: "",
//     width: 0,
//     height: 0,
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   // FIXED: ADD NEW BOARD
//   const [newBoard, setNewBoard] = useState("");
//   const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);

//   useEffect(() => {
//     if (!currentUser) {
//       navigate("/auth");
//     }
//   }, [navigate, currentUser]);

//   useEffect(() => {
//     if (file) {
//       const img = new Image();
//       img.src = URL.createObjectURL(file);
//       img.onload = () => {
//         setPreviewImg({
//           url: URL.createObjectURL(file),
//           width: img.width,
//           height: img.height,
//         });
//       };
//     }
//   }, [file]);


//   // FIXED: CHANGE DIRECT REQUEST TO MUTATION
//   const mutation = useMutation({
//     mutationFn: addPost,
//     onSuccess: (data) => {
//       resetStore();
//       navigate(`/pin/${data._id}`);
//     },
//   });

//   const handleSubmit = async () => {
//     if (isEditing) {
//       setIsEditing(false);
//     } else {
//       const formData = new FormData(formRef.current);
//       formData.append("media", file);
//       formData.append("textOptions", JSON.stringify(textOptions));
//       formData.append("canvasOptions", JSON.stringify(canvasOptions));
//       // FIXED: ADD NEW BOARD
//       formData.append("newBoard", newBoard);

//       // FIXED: CHANGE DIRECT REQUEST TO MUTATION
//       // try {
//       //   const res = await apiRequest.post("/pins", formData, {
//       //     headers: {
//       //       "Content-Type": "multipart/form-data",
//       //     },
//       //   });
//       //   navigate(`/pin/${res.data._id}`)
//       // } catch (err) {
//       //   console.log(err);
//       // }
//       mutation.mutate(formData);
//     }
//   };


//   // FIXED: FETCH EXISTING BOARDS
//   const { data, isPending, error } = useQuery({
//     queryKey: ["formBoards"],
//     queryFn: () => apiRequest.get(`/boards`).then((res) => res.data),
//   });

//   // FIXED: ADD NEW BOARD
//   const handleNewBoard = () => {
//     setIsNewBoardOpen((prev) => !prev);
//   };

//   return (
//     <div className="createPage">
//       <div className="createTop">
//         <h1>{isEditing ? "Design your Pin" : "Create Pin"}</h1>
//         <button onClick={handleSubmit}>{isEditing ? "Done" : "Publish"}</button>
//       </div>
//       {isEditing ? (
//         <Editor previewImg={previewImg} />
//       ) : (
//         <div className="createBottom">
//           {previewImg.url ? (
//             <div className="preview">
//               <img src={previewImg.url} alt="" />
//               <div className="editIcon" onClick={() => setIsEditing(true)}>
//                 <IKImage path="/general/edit.svg" alt="" />
//               </div>
//             </div>
//           ) : (
//             <>
//               <label htmlFor="file" className="upload">
//                 <div className="uploadTitle">
//                   <IKImage path="/general/upload.svg" alt="" />
//                   <span>Choose a file</span>
//                 </div>
//                 <div className="uploadInfo">
//                   We recommend using high quality .jpg files less than 20 MB or
//                   .mp4 files less than 200 MB.
//                 </div>
//               </label>
//               <input
//                 type="file"
//                 id="file"
//                 hidden
//                 onChange={(e) => setFile(e.target.files[0])}
//               />
//             </>
//           )}
//           <form className="createForm" ref={formRef}>
//             <div className="createFormItem">
//               <label htmlFor="title">Title</label>
//               <input
//                 type="text"
//                 placeholder="Add a title"
//                 name="title"
//                 id="title"
//               />
//             </div>
//             <div className="createFormItem">
//               <label htmlFor="description">Description</label>
//               <textarea
//                 rows={6}
//                 type="text"
//                 placeholder="Add a detailed description"
//                 name="description"
//                 id="description"
//               />
//             </div>
//             <div className="createFormItem">
//               <label htmlFor="link">Link</label>
//               <input
//                 type="text"
//                 placeholder="Add a link"
//                 name="link"
//                 id="link"
//               />
//             </div>
//             {/* <div className="createFormItem">
//               <label htmlFor="board">Board</label>
//               <select name="board" id="board">
//                 <option value="">Choose a board</option>
//                 <option value="1">Board 1</option>
//                 <option value="2">Board 2</option>
//                 <option value="3">Board 3</option>
//               </select>
//             </div> */}
//             {/* FIXED: SELECT OR ADD BOARD */}
//             {(!isPending || !error) && (
//               <div className="createFormItem">
//                 <label htmlFor="board">Board</label>
//                 <select name="board" id="board">
//                   <option value="">Choose a board</option>
//                   {data?.map((board) => (
//                     <option value={board._id} key={board._id}>
//                       {board.title}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="newBoard">
//                   {newBoard && (
//                     <div className="newBoardContainer">
//                       <div className="newBoardItem">{newBoard}</div>
//                     </div>
//                   )}
//                   <div className="createBoardButton" onClick={handleNewBoard}>
//                     Create new board
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div className="createFormItem">
//               <label htmlFor="tags">Tagged topics</label>
//               <input type="text" placeholder="Add tags" name="tags" id="tags" />
//               <small>Don&apos;t worry, people won&apos;t see your tags</small>
//             </div>
//           </form>
//           {isNewBoardOpen && (
//             <BoardForm
//               setIsNewBoardOpen={setIsNewBoardOpen}
//               setNewBoard={setNewBoard}
//             />
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreatePage;


import "./createPage.css";
import IKImage from "../../components/image/image";
import useAuthStore from "../../utils/authStore";
import { useNavigate } from "react-router-dom"; // Use react-router-dom for React Router components
import { useEffect, useRef, useState } from "react";
import Editor from "../../components/editor/editor";
import useEditorStore from "../../utils/editorStore";
import apiRequest from "../../utils/apiRequest";
import { useMutation, useQuery } from "@tanstack/react-query";
import BoardForm from "./BoardForm";

const addPost = async (post) => {
  const res = await apiRequest.post("/pins", post);
  return res.data;
};

const CreatePage = () => {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const formRef = useRef();
  const { textOptions, canvasOptions, resetStore } = useEditorStore();

  const [file, setFile] = useState(null);
  const [previewImg, setPreviewImg] = useState({ url: "", width: 0, height: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [newBoard, setNewBoard] = useState("");
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!currentUser) navigate("/auth");
  }, [navigate, currentUser]);

  // Handle file change and generate image preview URL
  useEffect(() => {
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setPreviewImg({
          url: URL.createObjectURL(file),
          width: img.width,
          height: img.height,
        });
      };
    }
  }, [file]);

  // Mutation to handle post creation
  const mutation = useMutation({
    mutationFn: addPost,
    onSuccess: (data) => {
      resetStore();
      navigate(`/pin/${data._id}`);
    },
  });

  const handleSubmit = async () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      const formData = new FormData(formRef.current);
      formData.append("media", file);
      formData.append("textOptions", JSON.stringify(textOptions));
      formData.append("canvasOptions", JSON.stringify(canvasOptions));
      formData.append("newBoard", newBoard);

      mutation.mutate(formData);
    }
  };

  // Fetch boards for the current user
  const { data, isPending, error } = useQuery({
    queryKey: ["formBoards", currentUser?._id],
    queryFn: () =>
      apiRequest.get(`/boards/${currentUser._id}`).then((res) => res.data),
    enabled: !!currentUser, // Only run the query if currentUser is available
  });

  const handleNewBoard = () => setIsNewBoardOpen((prev) => !prev);

  return (
    <div className="createPage">
      <div className="createTop">
        <h1>{isEditing ? "Design your Pin" : "Create Pin"}</h1>
        <button onClick={handleSubmit} disabled={mutation.isPending}>
          {isEditing ? "Done" : mutation.isPending ? "Publishing..." : "Publish"}
        </button>
      </div>

      {isEditing ? (
        <Editor previewImg={previewImg} />
      ) : (
        <div className="createBottom">
          {previewImg.url ? (
            <div className="preview">
              <img src={previewImg.url} alt="" />
              <div className="editIcon" onClick={() => setIsEditing(true)}>
                <IKImage path="/general/edit.svg" alt="" />
              </div>
            </div>
          ) : (
            <>
              <label htmlFor="file" className="upload">
                <div className="uploadTitle">
                  <IKImage path="/general/upload.svg" alt="" />
                  <span>Choose a file</span>
                </div>
                <div className="uploadInfo">
                  {/* FIX: Use &lt; entity to escape the less-than sign in JSX */}
                  Use high-quality .jpg &lt; 20MB or .mp4 &lt; 200MB
                </div>
              </label>
              <input
                type="file"
                id="file"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </>
          )}

          <form className="createForm" ref={formRef}>
            <div className="createFormItem">
              <label htmlFor="title">Title</label>
              <input type="text" name="title" placeholder="Add a title" id="title" />
            </div>
            <div className="createFormItem">
              <label htmlFor="description">Description</label>
              <textarea
                rows={6}
                name="description"
                placeholder="Add a detailed description"
                id="description"
              />
            </div>
            <div className="createFormItem">
              <label htmlFor="link">Link</label>
              <input type="text" name="link" placeholder="Add a link" id="link" />
            </div>

            {/* Board Selection / New Board */}
            {!isPending && !error && (
              <div className="createFormItem">
                <label htmlFor="board">Board</label>
                <select name="board" id="board">
                  <option value="">Choose a board</option>
                  {data?.map((board) => (
                    <option value={board._id} key={board._id}>
                      {board.title}
                    </option>
                  ))}
                </select>
                <div className="newBoard">
                  {newBoard && (
                    <div className="newBoardContainer">
                      <div className="newBoardItem">{newBoard}</div>
                    </div>
                  )}
                  <div className="createBoardButton" onClick={handleNewBoard}>
                    Create new board
                  </div>
                </div>
              </div>
            )}

            <div className="createFormItem">
              <label htmlFor="tags">Tagged topics</label>
              <input type="text" name="tags" placeholder="Add tags" id="tags" />
              <small>People won’t see your tags</small>
            </div>
          </form>

          {isNewBoardOpen && (
            <BoardForm setIsNewBoardOpen={setIsNewBoardOpen} setNewBoard={setNewBoard} />
          )}
        </div>
      )}
    </div>
  );
};

export default CreatePage;