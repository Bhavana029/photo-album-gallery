import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import UploadForm from "./UploadForm";
import CreateAlbumForm from "./CreateAlbumForm";
import AlbumGallery from "./AlbumGallery"; // ✅ Import AlbumGallery
import { FaHeart, FaTrash, FaSave } from "react-icons/fa"; // Icons
import "./Home.css";
import { jwtDecode as jwt_decode } from 'jwt-decode';



function Home() {
  const [photos, setPhotos] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Search state
  const [selectedImage, setSelectedImage] = useState(null); // ✅ Modal state

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      fetchImages(storedUserId);
    }
  }, []);
  const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));
  if (storedUser) {
    setCurrentUser(storedUser);
  }
}, []);


  const fetchImages = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/images/user/${userId}`
      );
      setPhotos(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleSearchChange = (searchValue) => {
    setSearchTerm(searchValue); // ✅ Updates search state
  };

  const handleCloseForms = () => {
    setShowUploadForm(false);
    setShowAlbumForm(false);
  };

  // ✅ Filter photos based on search term
  const filteredPhotos = photos.filter(
    (photo) =>
      photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const handleFavoriteImage = async (imageId) => {
  try {
    const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const decodedToken = jwt_decode(token); // Decode token to get user info
    const userId = decodedToken.userId; // Assuming the token contains userId

    const data = {
      imageId: imageId,
      userId: userId,
    };

    console.log("Sending data:", data); // Log data to check if it's correct

    const response = await axios.post(
      "http://localhost:5000/api/favorites/save", 
      data, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 201) {
      alert("Image added to favorites!");
    } else {
      alert("Failed to add image to favorites.");
    }
  } catch (error) {
    console.error("Error adding to favorites:", error.response ? error.response.data : error); // More detailed error logging
    alert("Error adding to favorites.");
  }
};

  

  

  // ✅ Save Image Function (already present)
const handleSaveImage = async (imageUrl, title) => {
  const userId = localStorage.getItem("userId"); // Assuming userId is stored

  console.log("Sending request with:", { imageUrl, title, userId });

  if (!imageUrl || !title || !userId) {
    console.error("Missing required fields:", { imageUrl, title, userId });
    return alert("All fields are required!");
  }

  try {
    const response = await axios.post("http://localhost:5000/api/saved/save", {
      imageUrl,
      title,
      userId,
    });

    console.log("Response:", response.data);
    alert("Image saved successfully!");
  } catch (error) {
    console.error("Error saving image:", error.response ? error.response.data : error);
    alert("Failed to save image.");
  }
};

  
  
  // ✅ Delete Image
  const handleDeleteImage = async (photoId) => {
    try {
      await axios.delete(`http://localhost:5000/api/images/delete/${photoId}`);
      setPhotos(photos.filter((photo) => photo._id !== photoId));
      alert("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };


  return (
    <div className="home">
      <Navbar
        onUploadClick={() => setShowUploadForm(true)}
        onCreateAlbumClick={() => setShowAlbumForm(true)}
        onSearchChange={handleSearchChange} // ✅ Pass function to Navbar
      />

      {showUploadForm && <UploadForm onClose={handleCloseForms} userId={userId} />}
      {showAlbumForm && userId && <CreateAlbumForm onClose={handleCloseForms} userId={userId} />}

      {/* ✅ Pass searchTerm to AlbumGallery */}
      <AlbumGallery userId={userId} searchQuery={searchTerm} />


      {/* 🔹 Display Filtered Photos */}
      <h2 className="c"> Photos</h2>
      <div className="photo-gallery">
        {filteredPhotos.length > 0 ? (
          filteredPhotos.map((photo) => (
            <div className="photo-card" key={photo._id}>
              <img
                src={`http://localhost:5000/uploads/${photo.imageUrl}`}
                alt={photo.title}
              />
              <h3>Name:-{photo.title}</h3>
              <p>Description:- {photo.description}</p>
              <small>Tags:- {Array.isArray(photo.tags) ? photo.tags.join(", ") : photo.tags || "No Tags"}</small>
              <button
                className="save-button"
                onClick={() => setSelectedImage(photo.imageUrl)}
              >
                VIEW
              </button>
              <div className="photo-actions">
  <span className="icon" onClick={() => handleSaveImage(photo.imageUrl, photo.title)}>
    <FaSave />
  </span>
  <span className="icon" onClick={() => handleFavoriteImage(photo._id)}>
    <FaHeart />
  </span>
  <span className="icon" onClick={() => handleDeleteImage(photo._id)}>
    <FaTrash />
  </span>
</div>


            </div>
          ))
        ) : (
          <p>No photos found.</p>
        )}
      </div>

      {/* ✅ Image Modal */}
      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedImage(null)}>
              &times;
            </span>
            <img
              src={`http://localhost:5000/uploads/${selectedImage}`}
              alt="Selected"
              className="modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
