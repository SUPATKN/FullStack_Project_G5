import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, ListGroup, InputGroup, Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa"; // ใช้ไอคอน
import "./searchbar.css";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      try {
        const response = await axios.get(`/api/photos/search?title=${term}`);
        setSuggestions(response.data || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      try {
        const response = await axios.get(
          `/api/photos/search?title=${searchTerm}`
        );
        if (response.data) {
          const photoId = response.data[0].id; // ใช้ id ของรูปภาพตัวแรก
          navigate(`/photo/${photoId}`);
        } else {
          alert("ไม่พบรูปภาพที่ตรงกัน");
        }
      } catch (error) {
        console.error("Error searching for photo:", error);
        alert("ไม่พบรูปภาพที่ตรงกัน");
      }
    }
  };

  const handleSuggestionClick = (id: number) => {
    navigate(`/photo/${id}`);
    setSearchTerm("");
    setSuggestions([]);
  };

  return (
    <div className="search-container">
      <Form onSubmit={handleSearch}>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="search..."
            value={searchTerm}
            onChange={handleInputChange}
            className="search-input"
          />
          <Button type="submit" variant="outline-secondary">
            <FaSearch />
          </Button>
        </InputGroup>
      </Form>
      {suggestions.length > 0 && (
        <ListGroup>
          {suggestions.map((photo: { id: number; title: string }) => (
            <ListGroup.Item
              key={photo.id}
              onClick={() => handleSuggestionClick(photo.id)}
            >
              {photo.title}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default SearchBar;
