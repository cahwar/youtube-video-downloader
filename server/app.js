const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const ytdl = require("ytdl-core");
const asyncHandler = require("express-async-handler");

dotenv.config();

const app = express();
app.use(cors());

app.get("/info", asyncHandler(async (req, res) => {
    const videoUrl = req.query.URL;
    if (!videoUrl) throw new Error("No video URL provided");

    const requiredFormat = req.query.requireFormat || "videoandaudio";

    const info = await ytdl.getInfo(videoUrl);
    if (!info) throw new Error("Can not fetch info");

    const requiredFormats = ytdl.filterFormats(info.formats, requiredFormat);
    if (!requiredFormats || requiredFormats.length <= 0) throw new Error("Video is not avaliable for downloading");

    res.json({
        title: info.videoDetails.title,
        author: info.videoDetails.author.name,
        authorUrl: info.videoDetails.author.channel_url,
        length: info.videoDetails.lengthSeconds,
        viewCount: info.videoDetails.viewCount,
    });
}));

app.get("/download", asyncHandler(async (req, res) => {
    const videoUrl = req.query.URL;
    if (!videoUrl) throw new Error("No video URL provided");

    const requiredFormat = req.query.requiredFormat || "videoandaudio";

    const info = await ytdl.getInfo(videoUrl);
    if (!info) throw new Error("Can not fetch info");

    const requiredFormats = ytdl.filterFormats(info.formats, requiredFormat);
    if (!requiredFormats || requiredFormats.length <= 0) throw new Error("Video is not avaliable for downloading");

    ytdl(videoUrl, { format: requiredFormats[0] }).pipe(res);
}));

app.use((err, req, res, next) => {
    res.status(400).json({
        errorMessage: err.message,
    });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});