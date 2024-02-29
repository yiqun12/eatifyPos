import React from 'react';
import './CareerPage.css'; // Importing the CSS file for styling
import { Link } from 'react-router-dom';

function CareerPage() {
  return (
    <div className="career-page">
      <section className="hero-section">
        <h1>Join Our Team</h1>
        <p>

        EatifyDash stands as the quintessential platform designed solely for the restaurant industry. 
        Our goal is to enhance the dining experience for everyone involved.
         By linking staff, processes, and patrons through a dependable and user-friendly platform.

At EatifyDash, collaboration is key. Our success hinges on collective problem-solving and the exchange of insights. We take personal responsibility for our actions, offer support and respect to our colleagues, and celebrate our diverse perspectives.
        </p>
      </section>

      <section className="open-positions">
        <h2>We are hiring:</h2>
        <div className="positions-list">
          <div className="position">
            <h3>Software Engineer Intern (0022)</h3>
            <p>Join our dynamic team as a Software Engineer Intern and work on the forefront of technology and innovation. You'll collaborate with senior engineers to design, develop, and implement software solutions that drive our business forward. This role offers a unique opportunity to gain hands-on experience with cutting-edge technologies in a real-world environment. Ideal for ambitious students or recent graduates eager to make an impact in the tech industry.</p>
            <h4>Qualification:</h4>
              <li>Basic understanding of programming languages and cloud infrastructure (e.g., JavaScript and GCP).</li>
              <li>Strong problem-solving skills and a willingness to learn.</li>
              <a href="mailto:admin@eatifydash.com?subject=Application for Sales Specialist (0025)" 
               style={{ textDecoration: 'none' }}>
              <button>Apply Now</button>
            </a>          </div>
          <div className="position">
            <h3>Product Specialist (0023)</h3>
            <p>As a Product Specialist, you'll be the cornerstone of our product development process, transforming ideas into market-leading products. This role involves market research, strategy formulation, and cross-functional collaboration to ensure our products meet and exceed customer expectations. If you're passionate about product innovation and have a knack for understanding consumer needs, we want you on our team.</p>
            <h4>Qualification:</h4>
              <li>Experience in product development or management.</li>
              <li>Excellent communication and teamwork skills.</li>
              <a href="mailto:admin@eatifydash.com?subject=Application for Sales Specialist (0025)" 
               style={{ textDecoration: 'none' }}>
              <button>Apply Now</button>
            </a>          </div>
          <div className="position">
            <h3>Public Relations Specialist (0024)</h3>
            <p>Seeking a creative and strategic Public Relations Specialist to elevate our brand's presence and reputation. You'll craft compelling narratives, manage media relations, and develop PR campaigns that resonate with our audience and align with our business goals. This role is perfect for someone who excels in storytelling, thrives in a fast-paced environment, and is keen to build meaningful relationships with the press and public.</p>
            <h4>Qualification:</h4>
              <li>Proven experience in media relations and PR campaigns.</li>
              <li>Exceptional writing and communication skills.</li>
              <a href="mailto:admin@eatifydash.com?subject=Application for Sales Specialist (0025)" 
               style={{ textDecoration: 'none' }}>
              <button>Apply Now</button>
            </a>          </div>
          <div className="position">
            <h3>Sales Specialist (0025)</h3>
            <p>As a Sales Specialist, you'll play a key role in driving our company's revenue growth by identifying and converting potential leads into loyal customers. You'll work closely with our marketing and product teams to develop sales strategies that align with our business goals. Your responsibilities will include conducting market research, reaching out to potential clients, negotiating contracts, and providing exceptional after-sales support. If you're results-driven and have a talent for communication and negotiation, join us to help expand our market presence and achieve sales targets.</p>
            <h4>Qualification:</h4>
              <li>Proven sales experience, preferably in the POS industry.</li>
              <li>Strong communication, negotiation, and interpersonal skills.</li>
              <li>Ability to work independently and as part of a team.</li>
              <a href="mailto:admin@eatifydash.com?subject=Application for Sales Specialist (0025)" 
               style={{ textDecoration: 'none' }}>
              <button>Apply Now</button>
            </a>
                      </div>
          </div>
      </section>
      <br></br>
      <footer class="flex_">
        <section class="flex_content_">
        <Link to="/">Home</Link>
      <Link to="/career">Career</Link>
        </section>
        <section class="flex_content_ padding_1x" style={{ marginTop: "10px" }}>
          <p>© 2023 Eatifydash LLC || All rights reserved</p>
        </section>
      </footer>
    </div>
  );
}

export default CareerPage;
