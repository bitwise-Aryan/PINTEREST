// import "./editor.css";
// import Layers from "./Layers";
// import Options from "./Option";
// import Workspace from "./Workspace";

// const Editor = ({ previewImg }) => {
//   return (
//     <div className="editor">
//       <Layers previewImg={previewImg} />
//       <Workspace previewImg={previewImg} />
//       <Options previewImg={previewImg} />
//     </div>
//   );
// };

// export default Editor;


import "./editor.css";
import Layers from "./Layers";
import Options from "./Option"; // Note the capitalization consistency
import Workspace from "./Workspace";

const Editor = ({ previewImg }) => {
  return (
    <div className="editor">
      {/* Note: The 'Layers' and 'Options' components do not appear to use 
        the 'previewImg' prop directly in their current implementation, 
        but it is passed to them via the parent 'Editor'. I'm removing the 
        redundant prop passing to Layers and Options based on their code, 
        but leaving it if you need it for internal logic. 
      */}
      <Layers /> 
      <Workspace previewImg={previewImg} />
      <Options previewImg={previewImg} />
    </div>
  );
};

export default Editor;