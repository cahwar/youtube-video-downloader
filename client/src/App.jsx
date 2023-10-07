import axios from "../utils/axios";
import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [downloadable, setDownloadable] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [videoData, setVideoData] = useState({});
  const [requiredFormat, setRequiredFormat] = useState("videoandaudio");

  useEffect(() => {
    if (downloadable) setDownloadable(false);
  }, [videoUrl]);

  const tryGetVideoInfo = async (e) => {
    e.preventDefault();

    if (processing) return;

    setDownloadable(false);
    setError("");

    try {
      setProcessing(true);
      const response = await axios.get(`/info?URL=${videoUrl}`);
      if (!(response && response.status >= 200 && response.status < 400 && response.data)) return;
      setVideoData(response.data);
      setDownloadable(true);
    } catch (error) {
      setError(error?.response?.data?.errorMessage || "");
    } finally {
      setProcessing(false);
    }
  };

  const tryDownloadVideo = async (e) => {
    e.preventDefault();

    if (processing) return;

    try {
      setProcessing(true);
      const response = await axios.get(`/download?URL=${videoUrl}&requiredFormat=${requiredFormat}`, { responseType: "blob" });
      if (!(response && response.status >= 200 && response.status < 400 && response.data)) return;

      const linkElement = document.createElement("a");
      linkElement.href = URL.createObjectURL(response.data);
      linkElement.download = `${videoData.title}.${requiredFormat == "videoandaudio" ? "mp4" : "mp3"}`;

      document.body.appendChild(linkElement);
      linkElement.click();

      document.removeChild(linkElement);
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.errorMessage || "");
    } finally {
      setProcessing(false);
    }
  };

  const toHMS = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    seconds = seconds % 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${hours}h:${minutes}m:${seconds}s`;
  };

  return (
    <div className="app">
      <div className="warning" style={error ? null : { display: "none" }}>
        <h2 className="title">Warning</h2>
        <p>{error}</p>
      </div>

      <h1>Get YouTube Video</h1>
      <form className="search-form" onSubmit={tryGetVideoInfo}>
        <input type="text" placeholder="YouTube Video Link" value={videoUrl} onChange={(e) => {
          if (!processing) setVideoUrl(e.target.value);
        }} />
        <button className="btn">{processing ? "Loading" : "Search"}</button>
      </form>

      <div className="download-info" style={downloadable ? null : { display: "none" }}>
        <h2 className="title">{videoData.title}</h2>
        <a target="_blank" href={videoData.authorUrl} className="author-name">{videoData.author}</a>
        <p className="time-display">{toHMS(videoData.length)}</p>
        <p className="views-display">{videoData.viewCount} views</p>

        <form onSubmit={tryDownloadVideo}>
          <select name="Format" value={requiredFormat} onChange={(e) => setRequiredFormat(e.target.value)}>
            <option value="videoandaudio">Video And Audio</option>
            <option value="audioonly">Audio</option>
          </select>
          <button className="btn download">{processing ? "Loading" : "Download"}</button>
        </form>
      </div>
    </div >
  );
}