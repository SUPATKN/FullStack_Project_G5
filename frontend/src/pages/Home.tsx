import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Image, Row, Col, Button} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../LOGOArtandCommunity.png";
import Layout from "../Layout";
import useAuth from "../hook/useAuth";
import { shuffle } from "lodash";


const Home = () => {
  const [photos, setPhotos] = useState<
    {
      id: string;
      path: string;
      user_id: string;
      price: number;
      title: string;
    }[]
  >([]);
  const [users, setUsers] = useState<
    { id: string; username: string; avatarURL?: string }[]
  >([]);

  const { user: me, refetch } = useAuth();
  // const [error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState<string | null>(null);

  const [cartItems, setCartItems] = useState<
    { id: string; path: string; user_id: string; price: number }[]
  >([]);

  const navigate = useNavigate();

  const handlePhotoClick = (photoId: string) => {
    navigate(`/photo/${photoId}`);
  };

  const handlePhotoContextMenu = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    photoId: string
  ) => {
    e.preventDefault(); // Prevent the default context menu
    // Implement your custom behavior here
    console.log(`Right-clicked on photo with ID: ${photoId}`);
    // For example, you might show a modal or perform another action
  };

  const fetchImages = async () => {
    try {
      const { data } = await axios.get<
        { id: string; path: string; user_id: string; price: number }[]
      >("/api/photo");
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get<{ id: string; username: string }[]>(
        "/api/allusers"
      );
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    refetch();
    fetchUsers();
    fetchImages();
  }, [me]);

  const fetchCartItems = async () => {
    if (me) {
      try {
        const { data } = await axios.get<
          { id: string; path: string; user_id: string; price: number }[]
        >(`/api/cart/${me.id}`);
        setCartItems(data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    }
  };

  useEffect(() => {
    if (me) {
      fetchCartItems(); // Fetch cart items when the user profile is available
    }
  }, [me]);

  const getUsername = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.username : "Unknown User";
  };

  const handleUsernameClick = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      navigate(`/profile/${userId}`, { state: { user } });
    }
  };

  const handleAddToCart = async (photoId: string) => {
    if (!me) {
      console.error("User is not logged in");
      return;
    }

    const photo = photos.find((photo) => photo.id === photoId);

    if (!photo) {
      return;
    }

    // Check if the photo is already in the cart
    const alreadyInCart = cartItems.some((item) => item.id === photoId);

    if (alreadyInCart) {
      alert("This item is already in your cart.");
      return;
    }

    if (photo.user_id === me.id.toString()) {
      alert("You cannot add your own photo to the cart.");
      return;
    }

    try {
      const response = await axios.post("/api/cart/add", {
        user_id: me.id,
        photo_id: photoId,
      });

      alert(response.data.message); // Display success message
      fetchCartItems(); // Refresh cart items after successful addition
    } catch (error) {
      console.error("Error adding photo to cart:", error);
    }
  };
  
  return (
    <Layout>
      <div className="Home">
        <div className="header-home">
          <img src={Logo} alt="My Photo App Logo" className="Logo" />
          <div className="header-text">
            <h5 className="text-center text-[#ffffff] " >W</h5>
            <h5 className="text-center text-[#ffffff] " >E</h5>
            <h5 className="text-center text-[#ffffff] " >L</h5>
            <h5 className="text-center text-[#ffffff] " >C</h5>
            <h5 className="text-center text-[#ffffff] " >O</h5>
            <h5 className="text-center text-[#ffffff] " >M</h5>
            <h5 className="text-center text-[#ffffff] " >E</h5>

            <div className="TO"> 
              <h5 className="text-center text-[#ffffff] " >T</h5>
              <h5 className="text-center text-[#ffffff] " >O</h5>
            </div>

            <h5 className="text-center text-[#ff8833] BordershowY" >A</h5>
            <h5 className="text-center text-[#ff8833] " >R</h5>
            <h5 className="text-center text-[#ff8833] " >T</h5>
            
            <div className="TO">
              <h5 className="text-center text-[#ff8833] " >A</h5>
              <h5 className="text-center text-[#ff8833] " >N</h5>
              <h5 className="text-center text-[#ff8833] " >D</h5>
            </div>

            <h5 className="text-center text-[#ff8833] Bordershow" >C</h5>
            <h5 className="text-center text-[#ff8833] " >O</h5>
            <h5 className="text-center text-[#ff8833] " >M</h5>
            <h5 className="text-center text-[#ff8833] " >M</h5>
            <h5 className="text-center text-[#ff8833] " >U</h5>
            <h5 className="text-center text-[#ff8833] " >N</h5>
            <h5 className="text-center text-[#ff8833] " >I</h5>
            <h5 className="text-center text-[#ff8833] " >T</h5>
            <h5 className="text-center text-[#ff8833] BordershowX" >Y</h5>
        
          </div>
        </div>
        <div className="description-home">
          <h5 className="text-center text-[#ffffff] ">A website that will make your</h5>
          <h5 className="text-center  text-[#ff8833]" >  “photos”</h5>
          <h5 className="display-flex text-center text-[#ffffff] ">more valuable than they are.</h5>
        </div>
      </div>

      <Link to="/login" className={`start-uploadHome ${location.pathname === '' ? 'active' : ''}`}>
              <FontAwesomeIcon icon={faUpload}/>  
              <div className={`pl-2${location.pathname === '' ? 'active' : ''}`} > You can now upload your photos </div>
      </Link>

      <div className="photo-container">
        <div className="photo-box">
          <div className="photo-box-inner">
          <Row className="rowpic">
              {shuffle(photos.slice()).slice(0, 4).map((photo) =>(
                <Col key={photo.id} xs={12} md={4} lg={3} className="mb-2">
                  <div
                    className="pict relative"
                  >
                    <div className="relative flex flex-col items-center justify-center">
                      <Image
                        crossOrigin="anonymous"
                        src={`/api/${photo.path}`}
                        alt={`Image ${photo.id}`}
                        className="w-full h-fit rounded-md cursor-pointer"
                        onClick={() => handlePhotoClick(photo.id)}
                        onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}
                      />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>
     
    </Layout> 

    
  );
};

export default Home;