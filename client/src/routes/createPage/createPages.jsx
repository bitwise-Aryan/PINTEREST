import "./createPage.css";
import IKImage from "../../components/image/image";
import useAuthStore from "../../utils/authStore";
import { useNavigate } from "react-router-dom";
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
  const [lengthPreference, setLengthPreference] = useState("short");
  const [isGenerating, setIsGenerating] = useState(false);
  const [createError, setCreateError] = useState("");

  const descriptionRef = useRef(null); 
  const titleRef = useRef(null); 

  // Redirect unauthenticated users
  useEffect(() => {
    if (!currentUser) navigate("/auth");
  }, [navigate, currentUser]);

  // Handle file change and generate image preview URL
  useEffect(() => {
    if (file) {
      const img = new window.Image();
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
    onError: (error) => {
      console.error("Pin creation failed:", error);
      setCreateError(error.response?.data?.message || "Failed to create pin. Please try again.");
    }
  });

  const handleSubmit = async () => {
    setCreateError("");
    if (isEditing) {
      setIsEditing(false);
      return;
    }

    if (!file) {
      setCreateError("Please choose an image file for your pin.");
      return;
    }

    const titleVal = titleRef.current?.value || formRef.current?.title?.value;
    if (!titleVal || !titleVal.trim()) {
      setCreateError("Please provide a title for your pin.");
      return;
    }

    const formData = new FormData(formRef.current);
    formData.set("media", file);
    formData.append("textOptions", JSON.stringify(textOptions));
    formData.append("canvasOptions", JSON.stringify(canvasOptions));
    if (newBoard) {
      formData.append("newBoard", newBoard);
    }

    mutation.mutate(formData);
  };

  // Fetch boards for the current user
  const { data, isPending, error } = useQuery({
    queryKey: ["formBoards", currentUser?._id],
    queryFn: () =>
      apiRequest.get(`/boards/${currentUser._id}`).then((res) => res.data),
    enabled: !!currentUser?._id,
  });

  const handleNewBoard = () => setIsNewBoardOpen((prev) => !prev);
  
  const handleGenerateDescription = async () => {
    const title = titleRef.current?.value; 
    
    if (!title || title.trim() === "") {
      alert("Please enter a Title to generate content."); 
      return;
    }

    setIsGenerating(true);
    try {
      const res = await apiRequest.post("/pins/generate-description", {
        prompt: title,
        length: lengthPreference,
      });
      
      if (res.data.success) {
        if (descriptionRef.current) {
          descriptionRef.current.value = res.data.content; 
        }
      } else {
        alert(res.data.message || "Failed to generate content.");
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      alert(err.response?.data?.message || "An error occurred during content generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="createPage">
      <div className="createTop">
        <h1>{isEditing ? "Design your Pin" : "Create Pin"}</h1>
        <button onClick={handleSubmit} disabled={mutation.isPending || isGenerating}>
          {isEditing ? "Done" : mutation.isPending ? "Publishing..." : "Publish"}
        </button>
      </div>

      {createError && (
        <div style={{ color: "#e60023", textAlign: "center", margin: "10px 0", fontWeight: "500" }}>
          {createError}
        </div>
      )}

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
                  Use high-quality .jpg &lt; 20MB or .mp4 &lt; 200MB
                </div>
              </label>
              <input
                type="file"
                id="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  setCreateError("");
                  setFile(e.target.files[0]);
                }}
              />
            </>
          )}

          <form className="createForm" ref={formRef}>
            <div className="createFormItem">
              <label htmlFor="title">Title</label>
              <input 
                type="text" 
                name="title" 
                placeholder="Add a title" 
                id="title" 
                ref={titleRef}
              />
            </div>
            
            <div className="createFormItem lengthSelector">
              <label>Description Length:</label>
              <div>
                <label>
                  <input 
                    type="radio" 
                    name="length" 
                    value="short" 
                    checked={lengthPreference === "short"}
                    onChange={() => setLengthPreference("short")}
                  /> 
                  Short (To the point)
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="length" 
                    value="long" 
                    checked={lengthPreference === "long"}
                    onChange={() => setLengthPreference("long")}
                  /> 
                  Long (Detailed)
                </label>
              </div>
            </div>

            <div className="createFormItem">
              <div className="descriptionLabelContainer">
                <label htmlFor="description">Description</label>
                <button 
                  type="button" 
                  className="generateWithAiButton" 
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <textarea
                rows={6}
                name="description"
                placeholder="Add a detailed description"
                id="description"
                ref={descriptionRef}
              />
            </div>

            <div className="createFormItem">
              <label htmlFor="link">Link</label>
              <input type="text" name="link" placeholder="Add a link" id="link" />
            </div>

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