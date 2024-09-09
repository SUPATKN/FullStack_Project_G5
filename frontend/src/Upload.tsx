import { useState, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { Form, Button, Image, Alert } from "react-bootstrap";
import Layout from "./Layout";
import useAuth from "./hook/useAuth";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [photos, setPhotos] = useState<
    { id: string; path: string; user_id: string; price?: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, refetch } = useAuth();

  // New state for free image and price
  const [isFree, setIsFree] = useState<boolean>(true);
  const [price, setPrice] = useState<number | "">(0);

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

    const formData = new FormData();
    formData.append("image", file);
    formData.append("user_id", user?.id?.toString() || "");
    formData.append("isFree", isFree.toString());
    formData.append("price", isFree ? "" : price.toString());

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
    } catch (error) {
      console.error("Error uploading file:", error);
      setSuccess(null);
      setError("Failed to upload file.");
    }
  };

  const fetchImages = async () => {
    try {
      const { data } = await axios.get<
        { id: string; path: string; user_id: string; price?: number }[]
      >("/api/photo");
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    refetch();
    fetchImages();
  }, []);

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
      {/* Uncomment and adjust the following if you have a deletion feature */}
      {/* <h3 className="my-4">Uploaded Images</h3>
      <Row>
        {photos
          .filter((photo) => photo.user_id === user?.id?.toString())
          .map((photo) => (
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
      </Row> */}
    </Layout>
  );
};

export default Upload;
