"use strict";
"use client";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const axios_1 = __importDefault(require("axios"));
const react_1 = require("react");
function Home() {
    const [file, setFile] = (0, react_1.useState)(null);
    const [images, setImages] = (0, react_1.useState)([]);
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        console.log(event.target.files[0]);
    };
    const handleUpload = () => __awaiter(this, void 0, void 0, function* () {
        if (!file) {
            alert("Please select a file first!");
            return;
        }
        const formData = new FormData();
        formData.append("image", file);
        try {
            const response = yield axios_1.default.post("http://localhost:3000/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(response.data);
            alert("File uploaded successfully!");
            fetchImages(); // Fetch images after successful upload
        }
        catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to upload file.");
        }
    });
    const fetchImages = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get("http://localhost:3000/api/images");
            setImages(response.data);
        }
        catch (error) {
            console.error("Error fetching images:", error);
        }
    });
    (0, react_1.useEffect)(() => {
        fetchImages();
    }, []);
    return (<div>
      <h2>Upload File</h2>
      <input type="file" onChange={handleFileChange}/>
      <button onClick={handleUpload}>Upload</button>
      <div>
        <h3>Uploaded Images</h3>
        {images.map((image) => (<div key={image.id}>
            <img src={image.path} alt={`Image ${image.id}`} width="200"/>
          </div>))}
      </div>
    </div>);
}
