import { useState, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { Form, Button, Image, Row, Col, Alert } from "react-bootstrap";
import Layout from "./Layout";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [photos, setPhotos] = useState<{ id: string; path: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    const formData = new FormData();
    formData.append("image", file);

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
    } catch (error) {
      console.error("Error uploading file:", error);
      setSuccess(null);
      setError("Failed to upload file.");
    }
  };

  const fetchImages = async () => {
    try {
      const { data } = await axios.get<{ id: string; path: string }[]>(
        "/api/photo"
      );
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Failed to fetch images.");
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(`/api/photo/${filename}`);
      setSuccess("File deleted successfully!");
      setError(null);

      const updatedPhotos = photos.filter(
        (photo) => photo.path.split("/").pop() !== filename
      );
      setPhotos(updatedPhotos);
    } catch (error) {
      console.error("Error deleting file:", error);
      setSuccess(null);
      setError("Failed to delete file.");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

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
      <h3 className="my-4">Uploaded Images</h3>
      <Row>
        {photos.map((photo) => (
          <Col key={photo.id} xs={12} md={4} lg={3} className="mb-4">
            <div className="position-relative">
              <Image
                crossOrigin="anonymous"
                src={`/api/${photo.path}`}
                alt={`Image ${photo.id}`}
                thumbnail
                className="w-100"
                data-cy={`photo-${photo.id}`}
              />
              <Button
                variant="danger"
                className="position-absolute top-0 end-0 m-2"
                onClick={() => handleDelete(photo.path.split("/").pop()!)}
                data-cy={`delete-button-${photo.id}`}
              >
                Delete
              </Button>
            </div>
          </Col>
        ))}
      </Row>
    </Layout>
  );
};

export default Upload;
