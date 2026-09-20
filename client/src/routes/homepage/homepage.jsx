
import './homepage.css'
import Gallery from "../../components/gallery/gallery";
import { useLocation } from "react-router-dom";

const Homepage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get("search");

  return (
    <Gallery search={searchParam} />
  )
}

export default Homepage