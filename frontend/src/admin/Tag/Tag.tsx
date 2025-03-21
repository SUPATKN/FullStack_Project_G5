import axios from "axios";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Hexagon } from "lucide-react";

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

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div>
        <div className="flex flex-col items-center justify-start w-full h-full">
              <h4 className="flex items-center text-white text-2xl text-center font-light letter-spacing-0-7px mb-2">
            ◆ Tag Management
          </h4>
              <div className="mt-4 flex items-center justify-center flex-col bg-[#181818] border-[#ff8833] border-2 rounded-lg shadow-md w-[260px] h-full">
                <Form onSubmit={handleAddTag} className="flex items-center justify-center flex-col">
                  <Form.Group controlId="tagName">
                    <Form.Label className="mt-4 text-[#ff8833] font-normal letter-spacing-0-7px text-xl flex items-center justify-center">Add a tag name </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter tag name"
                      value={tagName}
                      onChange={(e) => setTagName(e.target.value)}
                      className="mt-4 "
                    />
                  </Form.Group>
                  <button
                    className="p-2  px-3 mt-4 mb-4 w-[fit-content] h-[fit-content] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-orange-500 flex items-center justify-center text-center no-underline hover:no-underline letter-spacing-0-7px"
                    type="submit"
                  >
                    Add Tag
                  </button>
                </Form>
              </div>

              <h4 className="mt-4 flex items-center text-white text-2xl text-center font-light letter-spacing-0-7px mb-2">
              ◆ All Tags
          </h4>

              
              {AllTag.length > 0 ? (
                <div className="mt-3 bg-[#181818] border-[#ff8833] border-2 rounded-lg p-3 w-[300px] h-[fit-content] overflow-y-auto mb-[70px]">
                  {AllTag.map((tag) => (
                    <div key={tag.tags_id} className="bg-none ">
                      {/* {" "} */}
                      {/* Fallback to index */}
                      <div className="flex items-center justify-between border-b-2 p-2 gap-2 mb-4" >
                        <span className="text-[#ff8833] ">
                          {tag.name} 
                        </span>
                        <button
                          className="w-[80px] h-[35px] gap-2 bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                          onClick={() => handleDeleteTag(tag.tags_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
        ) : (
          <p className="text-white mt-2 flex items-center justify-center">
            No tags found.
          </p>
        )}
      </div>
    </div>
  );
}
