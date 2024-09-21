import axios from "axios";
import { useState } from "react";
import { Alert, Form, ListGroup } from "react-bootstrap";
import { Button } from "react-bootstrap";

interface Tag {
    tags_id: number;
    name: string;
}

export default function Tag() {
    const [tagName, setTagName] = useState("");
    const [AllTag, setAllTag] = useState<Tag[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
    
        // Reset messages
        setMessage(null);
        setError(null);
    
        if (!tagName) {
          setError("Tag name is required!");
          return;
        }
    
        try {
          const response = await axios.post("/api/tag", { name: tagName });
          if (response.status === 200) {
            fetchTags();
            setMessage("Tag created successfully");
            setTagName(""); // Clear the input field after success
          }
        } catch (err: any) {
          if (err.response && err.response.status === 409) {
            setError("Tag already exists in this album");
          } else {
            setError("Error adding tag, please try again.");
          }
        }
    };

    const fetchTags = async () => {
        try {
          const { data } = await axios.get<Tag[]>("/api/tag");
          setAllTag(data);
        } catch (error) {
          console.error("Error fetching Tags:", error);
        }
      };
    

    const handleDeleteTag = async (tagId: number | undefined) => {
        try {
          const response = await axios.delete("/api/tag", {
            data: { tag_id: tagId },
          });
          if (response.status === 200) {
            setMessage("Tag removed successfully.");
            setAllTag(AllTag.filter((tag) => tag.tags_id !== tagId)); // Update the tags list in the frontend
          }
        } catch (error) {
          setError("Error deleting tag.");
        }
      };
  return (
    <div>
        <div>
              <h2>Add a Tag</h2>
              <Form onSubmit={handleAddTag}>
                <Form.Group controlId="tagName">
                  <Form.Label>Tag Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter tag name"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                  Add Tag
                </Button>
              </Form>

              {message && (
                <Alert variant="success" className="mt-3">
                  {message}
                </Alert>
              )}
              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}

              <h3 className="mt-4">All Tags</h3>
              {AllTag.length > 0 ? (
                <ListGroup className="mt-3">
                  {AllTag.map((tag) => (
                    <ListGroup.Item key={tag.tags_id}>
                      {" "}
                      {/* Fallback to index */}
                      {tag.name}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.tags_id)}
                      >
                        Delete
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>No tags found.</p>
              )}
            </div>
    </div>
  )
}
