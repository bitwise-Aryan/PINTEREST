// TopBar.jsx
import { useNavigate } from "react-router-dom";
import Image from "../image/image";
import UserButton from "../userButton/userButton";
import "./topBar.css";

const TopBar = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchQuery = e.target[0].value.trim();
    if (searchQuery) {
      navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="topBar">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="search">
        <Image path="/general/search.svg" alt="Search Icon" />
        <input type="text" placeholder="Search" />
      </form>

      {/* User Profile */}
      <UserButton />
    </div>
  );
};

export default TopBar;
