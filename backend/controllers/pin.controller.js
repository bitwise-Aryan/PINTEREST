




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
import { Pinecone } from '@pinecone-database/pinecone';
import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc";



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
                { aiTags: { $in: [search] } }, // <-- ADD THIS LINE
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


// Initialize Pinecone Client
const pc = new Pinecone({
    // environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pc.index('pinterest-pins'); // Use the index name you created

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

    const media = req.files.media;

    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Authentication required to create a Pin." });
    }
    const authenticatedUserId = req.user._id;

    if (!title || !description || !media) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const parsedTextOptions = JSON.parse(textOptions || "{}");
    const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");

    // Your existing image manipulation logic
    const metadata = await sharp(media.data).metadata();
    const originalOrientation = metadata.width < metadata.height ? "portrait" : "landscape";
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

    // Your existing ImageKit upload logic
    imagekit.upload({
        file: media.data,
        fileName: media.name,
        folder: "test",
        transformation: {
            pre: transformationString,
        },
    })
    .then(async (response) => {
        
        // --- START: NEW CLARIFAI AI TAGGING LOGIC ---

        console.log("CLARIFAI_USER_ID:", process.env.CLARIFAI_USER_ID);
console.log("CLARIFAI_APP_ID:", process.env.CLARIFAI_APP_ID);
console.log("CLARIFAI_API_KEY (first 8 chars):", process.env.CLARIFAI_API_KEY && process.env.CLARIFAI_API_KEY.slice(0,8));
        let generatedAiTags = [];
        let imageVector = []; // <-- Variable to hold our vector
        try {
            if (!process.env.CLARIFAI_API_KEY) {
                throw new Error("Clarifai API Key is missing");
            }
              
            const stub = ClarifaiStub.grpc();
            const metadata = new grpc.Metadata();
            metadata.set("authorization", "Key " + process.env.CLARIFAI_API_KEY);

           const clarifaiResponse = await new Promise((resolve, reject) => {
                // --- START: FINAL CORRECTED LOGIC ---
                stub.PostWorkflowResults(
                    {
                        // The user_app_id object has been REMOVED.
                        // Your API key in the metadata handles authentication.
                        // workflow_id: "General",
                        workflow_id: "tag-and-embed",
                        inputs: [{ data: { image: { url: response.url } } }],
                    },
                    metadata,
                    (err, res) => {
                        if (err) reject(err);
                        resolve(res);
                    }
                );
            });

            if (clarifaiResponse.status.code !== 10000) {
                throw new Error("Clarifai API Error: " + clarifaiResponse.status.description);
            }
            // --- THIS IS THE NEW PART ---
            // 1. Extract the vector embedding from the Clarifai response
            const embedding = clarifaiResponse.results?.[0]?.outputs?.[1]?.data?.embeddings?.[0];
            if (embedding) {
                imageVector = embedding.vector;
            }
            const concepts = clarifaiResponse.results?.[0]?.outputs?.[0]?.data?.concepts ?? [];
            if (concepts) {
                generatedAiTags = concepts
                .filter(concept => concept.value > 0.50)
                .map(concept => concept.name);
            }
        } catch (err) {
            console.error("AI Tagging Failed:", err);
        }
        // --- END: NEW CLARIFAI AI TAGGING LOGIC ---

        // Your existing logic for creating a new board
        let newBoardId;
        if (newBoard) {
            const res = await Board.create({
                title: newBoard,
                user: authenticatedUserId,
            });
            newBoardId = res._id;
        }

        // Your final logic to create the pin, now including the aiTags
        const newPin = await Pin.create({
            user: authenticatedUserId,
            title,
            description,
            link: link || null,
            board: newBoardId || board || null,
            tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
            media: response.filePath,
            width: response.width,
            height: response.height,
            aiTags: generatedAiTags // Save the new AI tags
        });

        // --- THIS IS ALSO NEW ---
        // 2. Save the vector to Pinecone if it exists
        if (imageVector.length > 0) {
            try {
                console.log("Attempting to save vector to Pinecone...");
                await pineconeIndex.upsert([{
                    id: newPin._id.toString(),
                    values: imageVector,
                }]);
                console.log("✅ Vector saved to Pinecone successfully!");
            } catch (pineconeError) {
                console.error("!!! Pinecone Save Failed:", pineconeError);
            }
        } else {
            console.log("Skipping Pinecone save because no vector was generated.");
        }
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



export const getPopularTags = async (req, res) => {
    try {
        // This pipeline finds the most frequently used tags across all pins
        const popularTags = await Pin.aggregate([
            // Step 1: Deconstruct the tags and aiTags arrays into individual documents
            { $unwind: { path: "$tags", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$aiTags", preserveNullAndEmptyArrays: true } },
            // Step 2: Combine user tags and AI tags into a single field
            { $project: { tag: { $ifNull: ["$tags", "$aiTags"] } } },
            // Step 3: Group by the tag name and count occurrences
            { $group: { _id: "$tag", count: { $sum: 1 } } },
            // Step 4: Sort by the most popular tags first
            { $sort: { count: -1 } },
            // Step 5: Limit to the top 10 results
            { $limit: 10 },
            // Step 6: Format the output
            { $project: { _id: 0, tag: "$_id" } }
        ]);

        res.status(200).json(popularTags.map(item => item.tag));

    } catch (error) {
        console.error("Error fetching popular tags:", error);
        res.status(500).json({ message: "Failed to fetch popular tags." });
    }
};



export const getTrendingPins = async (req, res) => {
    try {
        // Calculate the date 7 days ago to define our "trending" window
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendingPins = await Pin.aggregate([
            // Step 1: Only consider pins created in the last 7 days
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            
            // Step 2: Get the counts of likes and comments for each pin
            { $lookup: { from: "likes", localField: "_id", foreignField: "pin", as: "likeDocs" } },
            { $lookup: { from: "comments", localField: "_id", foreignField: "pin", as: "commentDocs" } },

            // Step 3: Calculate a "trendingScore"
            // We give more weight to comments than likes
            {
                $addFields: {
                    trendingScore: {
                        $add: [
                            { $size: "$likeDocs" }, // 1 point per like
                            { $multiply: [{ $size: "$commentDocs" }, 2] } // 2 points per comment
                        ]
                    }
                }
            },
            
            // Step 4: Sort by the highest score
            { $sort: { trendingScore: -1 } },
            
            // Step 5: Limit to the top 20 trending pins
            { $limit: 20 }
        ]);
        
        // Populate the user data for the frontend
        await Pin.populate(trendingPins, { path: "user", select: "username displayName img" });

        res.status(200).json({ pins: trendingPins });

    } catch (error) {
        console.error("Error fetching trending pins:", error);
        res.status(500).json({ message: "Failed to fetch trending pins." });
    }
};


export const getRelatedTags = async (req, res) => {
    try {
        const userId = req.user._id;

        // Step 1: Find all pins the user has liked or saved
        const likedPins = await Like.find({ user: userId }).select('pin');
        const savedPins = await Save.find({ user: userId }).select('pin');
        
        const pinIds = [
            ...likedPins.map(p => p.pin),
            ...savedPins.map(p => p.pin)
        ];

        if (pinIds.length === 0) {
            return res.status(200).json([]); // Return empty if user has no activity
        }

        // Step 2: Use aggregation to find the most common tags from those pins
        const relatedTags = await Pin.aggregate([
            { $match: { _id: { $in: pinIds } } },
            { $unwind: { path: "$tags", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$aiTags", preserveNullAndEmptyArrays: true } },
            { $project: { tag: { $ifNull: ["$tags", "$aiTags"] } } },
            { $group: { _id: "$tag", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, tag: "$_id" } }
        ]);

        res.status(200).json(relatedTags.map(item => item.tag).filter(Boolean)); // filter(Boolean) removes any nulls

    } catch (error) {
        console.error("Error fetching related tags:", error);
        res.status(500).json({ message: "Failed to fetch related tags." });
    }
};


export const getSimilarPins = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch the vector for the source pin from Pinecone using its ID
        const fetchResponse = await pineconeIndex.fetch([id]);
        const sourceVector = fetchResponse.records[id]?.values;

        if (!sourceVector) {
            return res.status(404).json({ message: "Vector for this pin not found. Please upload it again to generate one." });
        }

        // 2. Query Pinecone to find the 10 most similar vectors
        const queryResponse = await pineconeIndex.query({
            vector: sourceVector,
            topK: 2, 
        });

        // 3. Get the IDs of the similar pins, excluding the source pin itself
        const similarPinIds = queryResponse.matches
            .filter(match => match.id !== id)
            .map(match => match.id);

        if (similarPinIds.length === 0) {
            return res.status(200).json([]);
        }

        // 4. Fetch the full pin data for those IDs from MongoDB
        const similarPins = await Pin.find({ _id: { $in: similarPinIds } });
        
        res.status(200).json(similarPins);

    } catch (error) {
        console.error("Error fetching similar pins:", error);
        res.status(500).json({ message: "Failed to fetch similar pins." });
    }
};


export const searchByImage = async (req, res) => {
    try {
        if (!req.files || !req.files.media) {
            return res.status(400).json({ message: "No image file uploaded." });
        }

        const imageFile = req.files.media.data; // Image data from the upload

        // 1. Get the vector for the uploaded image from Clarifai
        let queryVector = [];
        const stub = ClarifaiStub.grpc();
        const metadata = new grpc.Metadata();
        metadata.set("authorization", "Key " + process.env.CLARIFAI_API_KEY);

        const clarifaiResponse = await new Promise((resolve, reject) => {
            stub.PostWorkflowResults(
                {
                    workflow_id: "tag-and-embed",
                    inputs: [{ data: { image: { base64: imageFile } } }], // Send image bytes
                },
                metadata,
                (err, response) => {
                    if (err) reject(err);
                    resolve(response);
                }
            );
        });

        if (clarifaiResponse.status.code !== 10000) {
            throw new Error("Clarifai API Error: " + clarifaiResponse.status.description);
        }

        const embedding = clarifaiResponse.results?.[0]?.outputs?.[1]?.data?.embeddings?.[0];
        if (embedding) {
            queryVector = embedding.vector;
        } else {
            throw new Error("Could not generate a vector for the uploaded image.");
        }

        // 2. Use the new vector to query Pinecone
        const queryResponse = await pineconeIndex.query({
            vector: queryVector,
            topK: 2,
        });

        const similarPinIds = queryResponse.matches.map(match => match.id);

        if (similarPinIds.length === 0) {
            return res.status(200).json([]);
        }

        // 3. Fetch the full pin data from MongoDB
        const similarPins = await Pin.find({ _id: { $in: similarPinIds } });
        
        res.status(200).json(similarPins);

    } catch (error) {
        console.error("Error in visual search:", error);
        res.status(500).json({ message: "Failed to perform visual search." });
    }
};