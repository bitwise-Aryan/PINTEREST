




// import Pin from "../models/pin.model.js";
// import User from "../models/user.model.js";
// import Like from "../models/like.model.js";
// import Save from "../models/save.model.js";
// import Board from "../models/board.model.js";
// import sharp from "sharp";
// import Imagekit from "imagekit";
// import jwt from "jsonwebtoken";

// export const getPins = async (req, res) => {
//     const pageNumber = Number(req.query.cursor) || 0;
//     const search = req.query.search;
//     const userId = req.query.userId;
//     const boardId = req.query.boardId;
//     // 💡 ADDED: Parameter to fetch saved pins
//     const savedUserId = req.query.savedUserId; 
//     const LIMIT = 21;

//     let query = {};

//     if (search) {
//         query = {
//             $or: [
//                 { title: { $regex: search, $options: "i" } },
//                 { tags: { $in: [search] } },
//             ],
//         };
//     } else if (userId) {
//         query = { user: userId };
//     } else if (boardId) {
//         query = { board: boardId };
//     } else if (savedUserId) { // 🚀 NEW LOGIC FOR SAVED PINS
//         // 1. Find all 'Save' documents for the user
//         const savedPins = await Save.find({ user: savedUserId }).select("pin");
//         // 2. Extract the array of Pin IDs
//         const pinIds = savedPins.map(save => save.pin);
//         // 3. Set the query to find Pins whose IDs are in that list
//         query = { _id: { $in: pinIds } };
//     } else {
//         query = {};
//     }
    
//     const pins = await Pin.find(query)
//         .limit(LIMIT)
//         .skip(pageNumber * LIMIT);

//     const hasNextPage = pins.length === LIMIT;

//     await new Promise((resolve) => setTimeout(resolve, 3000));

//     res
//         .status(200)
//         .json({ pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
// };

// export const getPin = async (req, res) => {
//     const { id } = req.params;
//     const pin = await Pin.findById(id).populate(
//         "user",
//         "username img displayName"
//     );

//     console.log(pin);
//     res.status(200).json(pin);
// };

// export const createPin = async (req, res) => {
//     const {
//         title,
//         description,
//         link,
//         board,
//         tags,
//         textOptions,
//         canvasOptions,
//         newBoard,
//     } = req.body;

//     const media = req.files.media;

//     if ((!title, !description, !media)) {
//         return res.status(400).json({ message: "All fields are required!" });
//     }

//     const parsedTextOptions = JSON.parse(textOptions || "{}");
//     const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");

//     const metadata = await sharp(media.data).metadata();

//     const originalOrientation =
//         metadata.width < metadata.height ? "portrait" : "landscape";
//     const originalAspectRatio = metadata.width / metadata.height;

//     let clientAspectRatio;
//     let width;
//     let height;

//     if (parsedCanvasOptions.size !== "original") {
//         clientAspectRatio =
//             parsedCanvasOptions.size.split(":")[0] /
//             parsedCanvasOptions.size.split(":")[1];
//     } else {
//         parsedCanvasOptions.orientation === originalOrientation
//             ? (clientAspectRatio = originalOrientation)
//             : (clientAspectRatio = 1 / originalAspectRatio);
//     }

//     width = metadata.width;
//     height = metadata.width / clientAspectRatio;

//     const imagekit = new Imagekit({
//         publicKey: process.env.IK_PUBLIC_KEY,
//         privateKey: process.env.IK_PRIVATE_KEY,
//         urlEndpoint: process.env.IK_URL_ENDPOINT,
//     });

//     const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375);
//     const textTopPosition = Math.round(
//         (parsedTextOptions.top * height) / parsedCanvasOptions.height
//     );

//     let croppingStrategy = "";

//     if (parsedCanvasOptions.size !== "original") {
//         if (originalAspectRatio > clientAspectRatio) {
//             croppingStrategy = ",cm-pad_resize";
//         }
//     } else {
//         if (
//             originalOrientation === "landscape" &&
//             parsedCanvasOptions.orientation === "portrait"
//         ) {
//             croppingStrategy = ",cm-pad_resize";
//         }
//     }

//     const transformationString = `w-${width},h-${height}${croppingStrategy},bg-${parsedCanvasOptions.backgroundColor.substring(
//         1
//     )}${
//         parsedTextOptions.text
//             ? `,l-text,i-${parsedTextOptions.text},fs-${
//                 parsedTextOptions.fontSize * 2.1
//             },lx-${textLeftPosition},ly-${textTopPosition},co-${parsedTextOptions.color.substring(
//                 1
//             )},l-end`
//             : ""
//     }`;

//     imagekit
//         .upload({
//             file: media.data,
//             fileName: media.name,
//             folder: "test",
//             transformation: {
//                 pre: transformationString,
//             },
//         })
//         .then(async (response) => {
//             // FIXED: ADD NEW BOARD
//             let newBoardId;

//             if (newBoard) {
//                 const res = await Board.create({
//                     title: newBoard,
//                     user: req.userId,
//                 });
//                 newBoardId = res._id;
//             }

//             const newPin = await Pin.create({
//                 user: req.userId,
//                 title,
//                 description,
//                 link: link || null,
//                 board: newBoardId || board || null,
//                 tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
//                 media: response.filePath,
//                 width: response.width,
//                 height: response.height,
//             });
//             return res.status(201).json(newPin);
//         })
//         .catch((err) => {
//             console.log(err);
//             return res.status(500).json(err);
//         });
// };

// export const interactionCheck = async (req, res) => {
//     const { id } = req.params;
//     const token = req.cookies.token;

//     const likeCount = await Like.countDocuments({ pin: id });

//     if (!token) {
//         return res.status(200).json({ likeCount, isLiked: false, isSaved: false });
//     }

//     jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
//         if (err) {
//             return res
//                 .status(200)
//                 .json({ likeCount, isLiked: false, isSaved: false });
//         }

//         const userId = payload.userId;

//         const isLiked = await Like.findOne({
//             user: userId,
//             pin: id,
//         });
//         const isSaved = await Save.findOne({
//             user: userId,
//             pin: id,
//         });

//         return res.status(200).json({
//             likeCount,
//             isLiked: isLiked ? true : false,
//             isSaved: isSaved ? true : false,
//         });
//     });
// };

// export const interact = async (req, res) => {
//     const { id } = req.params;

//     const { type } = req.body;

//     if (type === "like") {
//         const isLiked = await Like.findOne({
//             pin: id,
//             user: req.userId,
//         });

//         if (isLiked) {
//             await Like.deleteOne({
//                 pin: id,
//                 user: req.userId,
//             });
//         } else {
//             await Like.create({
//                 pin: id,
//                 user: req.userId,
//             });
//         }
//     } else {
//         const isSaved = await Save.findOne({
//             pin: id,
//             user: req.userId,
//         });

//         if (isSaved) {
//             await Save.deleteOne({
//                 pin: id,
//                 user: req.userId,
//             });
//         } else {
//             await Save.create({
//                 pin: id,
//                 user: req.userId,
//             });
//         }
//     }

//     return res.status(200).json({ message: "Successful" });
// };



import Pin from "../models/pin.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import Save from "../models/save.model.js";
import Board from "../models/board.model.js";
import sharp from "sharp";
import Imagekit from "imagekit";
import jwt from "jsonwebtoken";



export const getPins = async (req, res) => {
    const pageNumber = Number(req.query.cursor) || 0;
    const search = req.query.search;
    const userId = req.query.userId;
    const boardId = req.query.boardId;
    const savedUserId = req.query.savedUserId; 
    const LIMIT = 21;

    let query = {};

    if (search) {
        query = {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { tags: { $in: [search] } },
            ],
        };
    } else if (userId) {
        query = { user: userId };
    } else if (boardId) {
        query = { board: boardId };
    } else if (savedUserId) {
        const savedPins = await Save.find({ user: savedUserId }).select("pin");
        const pinIds = savedPins.map(save => save.pin);
        query = { _id: { $in: pinIds } };
    } else {
        query = {};
    }
    
    const pins = await Pin.find(query)
        .limit(LIMIT)
        .skip(pageNumber * LIMIT);

    const hasNextPage = pins.length === LIMIT;

    // Await for 3 seconds for simulated loading delay
    await new Promise((resolve) => setTimeout(resolve, 3000)); 

    res
        .status(200)
        .json({ pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
};

export const getPin = async (req, res) => {
    const { id } = req.params;
    const pin = await Pin.findById(id).populate(
        "user",
        "username img displayName"
    );

    console.log(pin);
    res.status(200).json(pin);
};



export const createPin = async (req, res) => {
    const {
        title,
        description,
        link,
        board,
        tags,
        textOptions,
        canvasOptions,
        newBoard,
    } = req.body;

    // Assuming req.files.media is available via a middleware like express-fileupload
    const media = req.files.media;

    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Authentication required to create a Pin." });
    }
    // FIX: Standardize on using req.user._id from the isAuthenticated middleware
    const authenticatedUserId = req.user._id;

    if ((!title, !description, !media)) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const parsedTextOptions = JSON.parse(textOptions || "{}");
    const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");

    // ... (Image manipulation logic remains the same) ...
    const metadata = await sharp(media.data).metadata();

    const originalOrientation =
        metadata.width < metadata.height ? "portrait" : "landscape";
    const originalAspectRatio = metadata.width / metadata.height;

    let clientAspectRatio;
    let width;
    let height;

    if (parsedCanvasOptions.size !== "original") {
        clientAspectRatio =
            parsedCanvasOptions.size.split(":")[0] /
            parsedCanvasOptions.size.split(":")[1];
    } else {
        clientAspectRatio =
            parsedCanvasOptions.orientation === originalOrientation
                ? originalAspectRatio
                : 1 / originalAspectRatio;
    }

    width = metadata.width;
    height = metadata.width / clientAspectRatio;

    const imagekit = new Imagekit({
        publicKey: process.env.IK_PUBLIC_KEY,
        privateKey: process.env.IK_PRIVATE_KEY,
        urlEndpoint: process.env.IK_URL_ENDPOINT,
    });

    const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375);
    const textTopPosition = Math.round(
        (parsedTextOptions.top * height) / parsedCanvasOptions.height
    );

    let croppingStrategy = "";

    if (parsedCanvasOptions.size !== "original") {
        if (originalAspectRatio > clientAspectRatio) {
            croppingStrategy = ",cm-pad_resize";
        }
    } else {
        if (
            originalOrientation === "landscape" &&
            parsedCanvasOptions.orientation === "portrait"
        ) {
            croppingStrategy = ",cm-pad_resize";
        }
    }

    const transformationString = `w-${width},h-${height}${croppingStrategy},bg-${parsedCanvasOptions.backgroundColor.substring(
        1
    )}${
        parsedTextOptions.text
            ? `,l-text,i-${parsedTextOptions.text},fs-${
                  parsedTextOptions.fontSize * 2.1
              },lx-${textLeftPosition},ly-${textTopPosition},co-${parsedTextOptions.color.substring(
                  1
              )},l-end`
            : ""
    }`;

    imagekit
        .upload({
            file: media.data,
            fileName: media.name,
            folder: "test",
            transformation: {
                pre: transformationString,
            },
        })
        .then(async (response) => {
            let newBoardId;

            if (newBoard) {
                const res = await Board.create({
                    title: newBoard,
                    user: authenticatedUserId, // FIX: Use req.user._id
                });
                newBoardId = res._id;
            }

            const newPin = await Pin.create({
                user: authenticatedUserId, // FIX: Use req.user._id
                title,
                description,
                link: link || null,
                board: newBoardId || board || null,
                tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
                media: response.filePath,
                width: response.width,
                height: response.height,
            });
            return res.status(201).json(newPin);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: "Image upload or pin creation failed.", error: err.message });
        });
};


export const interactionCheck = async (req, res) => {
    const { id } = req.params;
    const token = req.cookies.token;

    const likeCount = await Like.countDocuments({ pin: id });

    if (!token) {
        return res.status(200).json({ likeCount, isLiked: false, isSaved: false });
    }

    // This block is fine, as it verifies the token *inline* and extracts payload.userId
    // It doesn't rely on the isAuthenticated middleware.
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
        if (err) {
            // Token invalid or expired, treat as unauthenticated
            return res
                .status(200)
                .json({ likeCount, isLiked: false, isSaved: false });
        }
        
        // Note: Your old token used payload.userId. Your new one uses payload.id. 
        // For maximum compatibility with your old system's JWT, we'll keep using payload.userId here
        // or ensure your login/register token creation matches the field name used here.
        const userId = payload.userId || payload.id; 

        const isLiked = await Like.findOne({
            user: userId,
            pin: id,
        });
        const isSaved = await Save.findOne({
            user: userId,
            pin: id,
        });

        return res.status(200).json({
            likeCount,
            isLiked: isLiked ? true : false,
            isSaved: isSaved ? true : false,
        });
    });
};

export const interact = async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Authentication required for interaction." });
    }
    // FIX: Standardize on using req.user._id from the isAuthenticated middleware
    const authenticatedUserId = req.user._id;

    if (type === "like") {
        const isLiked = await Like.findOne({
            pin: id,
            user: authenticatedUserId, // FIX: Use req.user._id
        });

        if (isLiked) {
            await Like.deleteOne({
                pin: id,
                user: authenticatedUserId, // FIX: Use req.user._id
            });
        } else {
            await Like.create({
                pin: id,
                user: authenticatedUserId, // FIX: Use req.user._id
            });
        }
    } else {
        const isSaved = await Save.findOne({
            pin: id,
            user: authenticatedUserId, // FIX: Use req.user._id
        });

        if (isSaved) {
            await Save.deleteOne({
                pin: id,
                user: authenticatedUserId, // FIX: Use req.user._id
            });
        } else {
            await Save.create({
                pin: id,
                user: authenticatedUserId, // FIX: Use req.user._id
            });
        }
    }

    return res.status(200).json({ message: "Successful" });
};


// --- NEW FUNCTION ---
// @desc    Delete a pin
// @route   DELETE /api/pins/:id
// @access  Private (only the pin owner)
export const deletePin = async (req, res) => {
  try {
    const pinId = req.params.id;
    // FIX: Get the user ID from `req.user` to match the new middleware
    const userId = req.user._id.toString();

    // Find the pin to be deleted
    const pin = await Pin.findById(pinId);

    // 1. Check if the pin exists
    if (!pin) {
      return res.status(404).json({ message: "Pin not found." });
    }

    // 2. Check if the logged-in user is the owner of the pin
    if (pin.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this pin." });
    }

    // 3. Delete the file from ImageKit.io
    if (pin.imagekitFileId) {
        const imagekit = new Imagekit({
            publicKey: process.env.IK_PUBLIC_KEY,
            privateKey: process.env.IK_PRIVATE_KEY,
            urlEndpoint: process.env.IK_URL_ENDPOINT,
        });

        await imagekit.deleteFile(pin.imagekitFileId);
    }

    // 4. Clean up associated data (cascading delete)
    await Comment.deleteMany({ pin: pinId });
    await Like.deleteMany({ pin: pinId });
    await Save.deleteMany({ pin: pinId });
    
    // 5. Delete the pin itself
    await Pin.findByIdAndDelete(pinId);

    res.status(200).json({ message: "Pin deleted successfully." });

  } catch (error) {
    console.error("Error deleting pin:", error);
    res.status(500).json({ message: "Failed to delete pin.", error: error.message });
  }
};




