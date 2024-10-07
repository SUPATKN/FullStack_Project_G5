import React, { useState } from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";
import { Album } from "../types/api";
import axios from "axios";

interface SelectAlbumModalProps {
  albums: Album[];
  photo_id: string;
  onClose: () => void;
}

const handleAddPhotoToAlbum = async (albumId: string, photoId: string) => {
  try {
    await axios.post("/api/album/add_photo", {
      album_id: albumId,
      photo_id: photoId,
    });
    console.log("Photo added to album");
  } catch (error) {
    console.error("Error adding photo to album:", error);
  }
};

const SelectAlbumModal: React.FC<SelectAlbumModalProps> = ({
  albums,
  photo_id,
  onClose,
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  const handleSelect = () => {
    if (selectedAlbumId) {
      console.log(photo_id);
      console.log(selectedAlbumId);
      handleAddPhotoToAlbum(selectedAlbumId, photo_id);
      onClose();
    }
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton className="flex items-center justify-center w-full h-full">
        <Modal.Title>Select an Album</Modal.Title>
      </Modal.Header>

      <Modal.Body className="flex items-center justify-center w-full h-full">
        <ListGroup>
          {albums.map((album) => (
            <ListGroup.Item
              key={album.album_id}
              action
              onClick={() => setSelectedAlbumId(album.album_id.toString())}
            >
              {album.title}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer className="flex items-center justify-center w-full h-full">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSelect}>
          Add Photo
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectAlbumModal;
