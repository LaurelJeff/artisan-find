import { Link } from "react-router-dom";
import "./Home.css";
import Step from "../data/homes.json"
import { useState,useEffect } from "react";
import Image1 from "../assets/macbookpro.jpg";
import Image2 from "../assets/supportimg.jpg";
import Image3 from "../assets/servicelogo.png";
export default function Home () {
    const images = [Image1,Image2,Image3];
    const [ratings, setRatings] = useState({});

  const handleRating = (chefId, value) => {
    setRatings((prev) => ({
      ...prev,
      [chefId]: value
    }));
  };


 const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("reviews");
    return saved ? JSON.parse(saved) : Step.reviews;
  });

  const [newText, setNewText] = useState("");

  // save to localStorage whenever reviews change
  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }, [reviews]);

  // add review
  const addReview = () => {
    if (!newText.trim()) return;

    const newReview = {
      text: newText,
      name: "Anonymous",
      profileImg: "https://randomuser.me/api/portraits/lego/1.jpg",
      profileLink: "#"
    };

    setReviews([newReview, ...reviews]);
    setNewText("");
  };


    return(
        <section className="container">
            <h1>Skilled Artisans.Right Around You</h1>
            <p>Find and book trusted local professional for any job <br/>
             from plumbing to catering. Vetted,rated, and ready</p>
            <Link to="/bookings">
            <button className="hire-btn">Hire an Artisan</button>
            </Link>


            <div className="gallery">
                {images.map((img, index) =>(
                    <img key={index} src={img} alt={`img-${index}`} />
                ))}
            </div>

            {/* steps */}
            <div className="how-it-works">
                <h1>How it Works</h1>
                <div className="steps">
                    {Step.steps.map((step, index) => (
                        <div className="step" key={index}>
                            <div className="circle">{index + 1}</div>
                            <p>{step}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* third part */}
            <div className="NearYou">
                <h1>Artisans Near You</h1>
                <div className="chef-maindiv">
                    {Step.chefs.map((chef) => (
                        <div className="chef-card" key={chef.id}>
                            <img src={chef.image} alt={chef.name} />
                            <h2>{chef.name}</h2>
                            <h3>{chef.text}</h3>
                            {/* <p>{"⭐".repeat(chef.rating)}</p>*/}
                            <div>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} onClick={() => handleRating(chef.id, star)}>
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* why choose artisan finds */}
            <div className="services">
                {Step.services.map((item, index) => (
                    <div className="service-card" key={index}>
                        <img src={item.logo} alt={item.title} />
                        <h1>{item.title}</h1>
                        <p>{item.text}</p>
                    </div>
                ))}
            </div>

            {/* reviews */}
            <div className="testimonals">
                <h4>Testimonals</h4>
                <h1>What our Customers Say</h1>

                {/* Add Review */}
                <div className="add-review">
                    <input type="text" placeholder="Write your review..." value={newText} onChange={(e) => setNewText(e.target.value)}/>
                    <button onClick={addReview}>Post</button>
                </div>

                {/* Reviews */}
                <div className="reviews">
                    {reviews.map((review, index) => (
                        <a key={index} href={review.profileLink} target="_blank" rel="noopener noreferrer" className="testimonial" >
                            <p>{review.text}</p>
                            <div>
                                <img src={review.profileImg ||"https://randomuser.me/api/portraits/lego/1.jpg"} alt={review.name || "User"} />
                                <h3>{review.name || "Anonymous"}</h3>
                                <h4>{review.info}</h4>
                            </div>
                        </a>
                    ))}
                </div> 
            </div>


        </section>
    );
}
