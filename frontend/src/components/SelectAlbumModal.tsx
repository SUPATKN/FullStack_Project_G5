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

const SelectAlbumModal: React.FC< SelectAlbumModalProps> = ({
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
    <Modal show onHide={onClose} className="SelectAlbumModal">
      <Modal.Header closeButton className="SelectAlbumModal-header">
        <Modal.Title className="SelectAlbumModal-title">Select an Album ✦</Modal.Title>
      </Modal.Header>
      <Modal.Body className="SelectAlbumModal-body" >
        <ListGroup className="SelectAlbumModal-list">
          {albums.map((album) => (
            <ListGroup.Item
              key={album.album_id}
              className="SelectAlbumModal-list-item"
              action
              onClick={() => setSelectedAlbumId(album.album_id.toString())}

            >
              {album.title}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer className="SelectAlbumModal-footer">
        <Button className="SelectAlbumModal-footer-button" onClick={handleSelect}>
          Add Photo
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectAlbumModal;
