import axios from "axios";

export default axios.create({
  baseURL: "https://netmovie.up.railway.app:8000",
});
