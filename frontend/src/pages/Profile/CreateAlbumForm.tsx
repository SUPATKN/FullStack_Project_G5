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
      <Form.Group controlId="formTitle" className="mb-3">
        <Form.Label >Title</Form.Label>
        <Form.Control
          type="text"
          value={title}
          placeholder="Enter album title"
          onChange={(e) => setTitle(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formDescription" className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          type="text"
          value={description}
          placeholder="Enter album description"
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>

      <div className="flex items-center justify-center">
        <button 
          className="p-2 px-3 w-[fit-content] h-[fit-content] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-[#ff6600] flex items-center justify-center text-center no-underline hover:no-underline"
          type="submit"
        >
          Create Album
        </button>

      </div>
    </Form>
  );
};

export default CreateAlbumForm;
