import "./Navbar.css";
import { Link } from "react-router-dom";
import Lists from "../data/Navbar.json";
import Logo from "../assets/artisanlogofinds.png";
import { useState } from "react";
import {FiSearch, FiUser} from "react-icons/fi"

export default function Navbar() {
    const [searchTerm, setsearchTerm] = useState("");

    const handlesearch = (e) => {
        setsearchTerm(e.target.value);
    };

    //filter navbar items based on search
    const filteredLists = Lists.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  return (
    <header className="nav-header">
      <div className="nav-bar">
        <Link to="/" className="logo-link">
          <img src={Logo} alt="logo" className="logo-img" />
        </Link>

        <nav className="nav-links">
          {filteredLists.length > 0 ? (filteredLists.map((List) => (
              <Link key={List.title} to={`/${List.title.toLowerCase()}`} className="nav-item">{List.title}</Link>
          ))
        ) : (
            <p className="no-results">No matches found</p>
        )}
        </nav>

        {/* search and profile */}
        <div className="nav-right">

            {/* searchbox */}
            <div className="search-box">
                <FiSearch className="search-icon" />
                <input type="text" placeholder="Search" value={searchTerm}onChange={handlesearch}/>
            </div>

            {/* profileicon */}
            <div className="profile-icon">
                <FiUser/>
            </div>

        </div>
      </div>
    </header>
  );
}
