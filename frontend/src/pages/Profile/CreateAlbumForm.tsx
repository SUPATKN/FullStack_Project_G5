import React, { useState } from "react";
import { Form } from "react-bootstrap";
// import axios from "axios";

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
      <div className="flex items-center justify-center">
        <button 
          className="mt-3 w-[110px] h-[35px] bg-[#007bff] rounded-md text-white cursor-pointer hover:bg-blue-500 flex items-center justify-center text-center no-underline hover:no-underline"
          type="submit"
        >
          Create Album
        </button>

      </div>
    </Form>
  );
};

export default CreateAlbumForm;
