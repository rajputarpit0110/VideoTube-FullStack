import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/").post(verifyJWT, createPlaylist)

router
    .route("/:playlistId")
    .get(optionalVerifyJWT, getPlaylistById)
    .patch(verifyJWT, updatePlaylist)
    .delete(verifyJWT, deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(verifyJWT, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);

router.route("/user/:userId").get(optionalVerifyJWT, getUserPlaylists);

export default router