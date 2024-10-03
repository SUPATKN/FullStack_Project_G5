import { useState, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { Form, Button, Image, Alert } from "react-bootstrap";
import Layout from "../Layout";
import useAuth from "../hook/useAuth";

interface Photo {
  id: string;
  user_id: string;
  path: string;
  price?: number;
  title: string;
  description: string;
}

interface Tag {
  tags_id: number;
  name: string;
}

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, refetch } = useAuth();

  // New states for free image, price, title, description, and max sales
  const [isFree, setIsFree] = useState<boolean>(true);
  const [price, setPrice] = useState<number | "">(0);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // New states for limiting sales
  const [limitSales, setLimitSales] = useState<boolean>(false);
  const [maxSales, setMaxSales] = useState<number>(0);
  const [tags, setTags] = useState<Tag[]>([]); // State for all tags
  const [selectedTags, setSelectedTags] = useState<number[]>([]); // State for selected tag IDs

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first!");
      return;
    }

    if (!isFree && (price === "" || price === undefined)) {
      setError("Please provide a price for the image.");
      return;
    }

    if (title.trim() === "") {
      setError("Please provide a title for the image.");
      return;
    }

    if (description.trim() === "") {
      setError("Please provide a description for the image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("user_id", user?.id?.toString() || "");
    formData.append("isFree", isFree.toString());
    formData.append("price", isFree ? "" : price.toString());
    formData.append("title", title);
    formData.append("description", description);
    formData.append("max_sales", maxSales.toString()); // Add max_sales to form data

    // Append selected tags to form data
    selectedTags.forEach((tagId) => {
      formData.append("tags", tagId.toString());
    });

    try {
      await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("File uploaded successfully!");
      setError(null);
      fetchImages();
      setSelectedImage("");
      setPrice(0); // Reset price after upload
      setTitle("");
      setDescription("");
      setMaxSales(0); // Reset max_sales after upload
      setSelectedTags([]); // Clear selected tags after upload
    } catch (error) {
      console.error("Error uploading file:", error);
      setSuccess(null);
      setError("Failed to upload file.");
    }
  };

  const fetchImages = async () => {
    try {
      const { data } = await axios.get<
        {
          id: string;
          path: string;
          user_id: string;
          price?: number;
          title: string;
          description: string;
        }[]
      >("/api/photo");
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const { data } = await axios.get<Tag[]>("/api/tag");
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    refetch();
    fetchImages();
    fetchTags();
  }, [refetch]);

  useEffect(() => {
    if (photos.length > 0) {
      photos.forEach((photo) => {
        console.log(photo);
      });
    }
  }, [photos]);

  return (
    <Layout>
      <h3 className="mt-3 mb-3 text-center text-[#ff8833] font-light letter-spacing-0-7px">UPLOAD FILE</h3>
      <Form>
        <Form.Group controlId="formFile" className="mb-3 text-[#ff8833] letter-spacing-0-7px">
          <Form.Label>◆ Select Image</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            data-cy="file-input"
          />
        </Form.Group>
        {selectedImage && (
          <div className="mt-3 mb-3 text-[#ff8833] letter-spacing-0-7px ">
            <Form.Label className="mb-3">◆ Image Preview</Form.Label>
            <Image
              src={selectedImage}
              alt="Selected Image"
              width="200"
              thumbnail
              data-cy="image-preview"
            />
          </div>
        )}
        <Form.Group controlId="formTitle" className="mb-3 text-[#ff8833] letter-spacing-0-7px">
          <Form.Label>◆ Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-cy="title-input"
          />
        </Form.Group>
        <Form.Group controlId="formDescription" className="mb-3 text-[#ff8833] letter-spacing-0-7px">
          <Form.Label>◆ Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-cy="description-input"
          />
        </Form.Group>

        <Form.Group controlId="formIsFree" className="mb-3 text-[#ffffff] letter-spacing-0-7px">
          <Form.Check
            type="checkbox"
            label="Free Image"
            checked={isFree}
            className="checkbox font-thin "
            onChange={(e) => setIsFree(e.target.checked)}
          />
        </Form.Group>
        {!isFree && (
          <Form.Group controlId="formPrice" className=" mb-3 text-white letter-spacing-0-7px ">
            <Form.Label className=" text-[#ff8833] letter-spacing-0-7px" >◆ Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter price"
              value={price}
              className="mb-3 letter-spacing-0-7px"
              onChange={(e) => setPrice(Number(e.target.value))}
              data-cy="price-input"
            />
            <Form.Check
              type="checkbox"
              label="Limit Sales"
              className="checkbox font-thin "
              checked={limitSales}
              onChange={(e) => setLimitSales(e.target.checked)}
            />
          </Form.Group>
        )}
        {/* <Form.Group controlId="formLimitSales" className="mb-3 text-white">
          <Form.Check
            type="checkbox"
            label="Limit Sales"
            checked={limitSales}
            onChange={(e) => setLimitSales(e.target.checked)}
          />
        </Form.Group> */}
        {limitSales && (
          <Form.Group controlId="formMaxSales" className="mb-3 text-white letter-spacing-0-7px">
            <Form.Label className=" text-[#ff8833] letter-spacing-0-7px">◆ Maximum Sales Allowed</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter maximum sales"
              value={maxSales}
              className="mb-3letter-spacing-0-7px"
              onChange={(e) => setMaxSales(Number(e.target.value))}
              data-cy="max-sales-input"
            />
          </Form.Group>
        )}
        <Form.Label className="mb-3 text-[#ff8833] letter-spacing-0-7px">◆ Select Tags</Form.Label>
        <Form.Group controlId="formTags" className="tagbox mb-4">
          
          {tags.map((tag) => (
            <Form.Check
              key={tag.tags_id}
              type="checkbox"
              label={tag.name}
              value={tag.tags_id}
              checked={selectedTags.includes(tag.tags_id)}
              className="checkbox font-thin text-[#ffffff] " 
              onChange={(e) => {
                const tagId = parseInt(e.target.value);
                if (e.target.checked) {
                  setSelectedTags([...selectedTags, tagId]);
                } else {
                  setSelectedTags(selectedTags.filter((id) => id !== tagId));
                }
              }}
            />
          ))}
        </Form.Group>

        <Button
          className="upload-b w-100 mb-2 "
          onClick={handleUpload}
          data-cy="upload-button"
        >
          Upload
        </Button>
      </Form>
      {error && (
        <Alert variant="danger" className="mt-3" data-cy="error-message">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mt-3" data-cy="success-message">
          {success}
        </Alert>
      )}
    </Layout>
  );
};

export default Upload;
