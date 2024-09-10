import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import axios from "axios";

interface CreateAlbumFormProps {
  onCreateAlbum: (title: string, description: string) => void;
}

const CreateAlbumForm: React.FC<CreateAlbumFormProps> = ({ onCreateAlbum }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreateAlbum(title, description); // Call the function passed from Profile
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formTitle">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formDescription">
        <Form.Label>Description</Form.Label>
        <Form.Control
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Create Album
      </Button>
    </Form>
  );
};

export default CreateAlbumForm;
