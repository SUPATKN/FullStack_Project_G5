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

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, refetch } = useAuth();

  // New states for free image, price, title, and description
  const [isFree, setIsFree] = useState<boolean>(true);
  const [price, setPrice] = useState<number | "">(0);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

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

  useEffect(() => {
    refetch();
    fetchImages();
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
      <h2 className="mb-4">Upload File</h2>
      <Form>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Select Image</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            data-cy="file-input"
          />
        </Form.Group>
        {selectedImage && (
          <div className="mb-3">
            <h3>Image Preview:</h3>
            <Image
              src={selectedImage}
              alt="Selected Image"
              width="200"
              thumbnail
              data-cy="image-preview"
            />
          </div>
        )}
        <Form.Group controlId="formTitle" className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-cy="title-input"
          />
        </Form.Group>
        <Form.Group controlId="formDescription" className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-cy="description-input"
          />
        </Form.Group>
        <Form.Group controlId="formIsFree" className="mb-3">
          <Form.Check
            type="checkbox"
            label="Free Image"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
          />
        </Form.Group>
        {!isFree && (
          <Form.Group controlId="formPrice" className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              data-cy="price-input"
            />
          </Form.Group>
        )}
        <Button
          variant="primary"
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
