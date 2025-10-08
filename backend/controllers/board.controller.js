// // import Board from "../models/board.model.js";
// // import Pin from "../models/pin.model.js";
// // export const getUserBoards = async (req, res) => {
// //   const { userId } = req.params; 
// //   const boards = await Board.find({ user: userId });
// //   const boardsWithPinDetails = await Promise.all(
// //     boards.map(async (board) => {
// //       const pinCount = await Pin.countDocuments({ board: board._id });
// //       const firstPin = await Pin.findOne({ board: board._id });
// //       return {
// //         ...board.toObject(),
// //         pinCount,
// //         firstPin,
// //       };
// //     })
// //   );
// //   res.status(200).json(boardsWithPinDetails);
// // };


// // src/controllers/board.controller.js (Only the getUserBoards function is shown)

// import Board from "../models/board.model.js";
// import Pin from "../models/pin.model.js";

// export const getUserBoards = async (req, res) => {
//   const { userId } = req.params; 
  
//   // CRITICAL FIX: Check if the parameter is valid before querying Mongoose.
//   if (!userId || userId === 'undefined') {
//     // Return a clean error response instead of crashing the server
//     return res.status(400).json({ message: "Invalid user ID provided for fetching boards." });
//   }
 
//   try {
//     const boards = await Board.find({ user: userId });
    
//     if (boards.length === 0) {
//         return res.status(200).json([]);
//     }

//     const boardsWithPinDetails = await Promise.all(
//       boards.map(async (board) => {
//         const pinCount = await Pin.countDocuments({ board: board._id });
//         const firstPin = await Pin.findOne({ board: board._id });
//         return {
//           ...board.toObject(),
//           pinCount,
//           firstPin,
//         };
//       })
//     );
//     
//     res.status(200).json(boardsWithPinDetails);
    
//   } catch (error) {
//       console.error("Error in getUserBoards:", error);
//       // Catching Mongoose CastError for invalid format
//       if (error.name === 'CastError') {
//           return res.status(400).json({ message: "Invalid ID format in URL parameter." });
//       }
//       res.status(500).json({ message: "Internal server error while fetching boards." });
//   }
// };


import Board from "../models/board.model.js";
import Pin from "../models/pin.model.js";

export const getUserBoards = async (req, res) => {
  const { userId } = req.params;
  if (!userId || userId === "undefined") {
    return res.status(400).json({ message: "Invalid user ID provided for fetching boards." });
  }

  try {
    const boards = await Board.find({ user: userId });
    if (boards.length === 0) return res.status(200).json([]);

    const boardsWithPinDetails = await Promise.all(
      boards.map(async (board) => {
        const pinCount = await Pin.countDocuments({ board: board._id });
        const firstPin = await Pin.findOne({ board: board._id });
        return {
          ...board.toObject(),
          pinCount,
          firstPin,
        };
      })
    );

    res.status(200).json(boardsWithPinDetails);
  } catch (error) {
    console.error("Error in getUserBoards:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format in URL parameter." });
    }
    res.status(500).json({ message: "Internal server error while fetching boards." });
  }
};
