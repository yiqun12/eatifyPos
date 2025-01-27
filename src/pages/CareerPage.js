import React from 'react';
import './CareerPage.css'; // Importing the CSS file for styling
import { Link } from 'react-router-dom';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CareerPage() {

  return (
    <div className="career-page">
      <section className="flex flex-col md:flex-row items-center md:justify-center space-y-4 md:space-x-0">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">Join Our Team</h1>
          <p className="text-gray-600 mt-2">
            EatifyDash stands as the quintessential platform designed solely for the restaurant industry.
            Our goal is to enhance the dining experience for everyone involved.
            By linking staff, processes, and patrons through a dependable and user-friendly platform.

            At EatifyDash, collaboration is key. Our success hinges on collective problem-solving and the exchange of insights. We take personal responsibility for our actions, offer support and respect to our colleagues, and celebrate our diverse perspectives.
          </p>
        </div>
        <img
          className="w-72 h-72 md:w-80 md:h-80 object-cover"
          src="https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/76331d4b-ab1f-4979-acd1-3ed0db091300/public"
          alt="Descriptive text about the image"
        />
      </section>



      <section className="open-positions">
        <div className="positions-list">
          <div className="position">
            <h3 className="text-center font-bold my-4">Software Engineer Intern (0022)</h3>
            <p>Join our dynamic team as a Software Engineer Intern and work on the forefront of technology and innovation. You'll collaborate with senior engineers to design, develop, and implement software solutions that drive our business forward. This role offers a unique opportunity to gain hands-on experience with cutting-edge technologies in a real-world environment. Ideal for ambitious students or recent graduates eager to make an impact in the tech industry.</p>
            <h4>Qualification:</h4>
            <li>Basic understanding of programming languages and cloud infrastructure (e.g., JavaScript and GCP).</li>
            <li>Strong problem-solving skills and a willingness to learn.</li>
            <a href="mailto:admin@eatifydash.com?subject=Application for Software Engineer Intern (0022)"
              style={{ textDecoration: 'none' }}>
              <button>
                <FontAwesomeIcon icon={faEnvelope} />
                &nbsp;Apply Now</button>
            </a>
          </div>
          <div className="position">
            <h3
             className="text-center font-bold my-4"
            >Software Engineer (0023)</h3>
            <p>
              As a Software Engineer at our innovative company, you will be at the heart of our engineering process, building software that empowers our organization to deliver best-in-class products and services. This role involves working closely with cross-functional teams to conceptualize, design, and deliver high-quality software solutions. Whether you're refining existing systems or pioneering new projects, you'll play a critical role in driving our technological advancements.
              Our ideal candidate is a creative problem solver, passionate about developing scalable software solutions and eager to tackle complex challenges in a collaborative environment.

            </p>
            <h4>Qualification:</h4>
            <li>Proficiency in programming languages and cloud infrastructure (e.g., JavaScript and GCP).</li>
            <li>Experience with full-stack development, including front-end and back-end technologies.</li>
            <li>Strong understanding of software development methodologies and lifecycle.</li>
            <li>Excellent problem-solving, analytical, and communication skills.</li>
            <li>Strong problem-solving skills and a willingness to learn.</li>
            <a href="mailto:admin@eatifydash.com?subject=Application for Software Engineer Intern (0023)"
              style={{ textDecoration: 'none' }}>
              <button>
                <FontAwesomeIcon icon={faEnvelope} />
                &nbsp;Apply Now</button>
            </a>
          </div>
          <div className="position">
            <h3  className="text-center font-bold my-4">Product Specialist (0024)</h3>
            <p>As a Product Specialist, you'll be the cornerstone of our product development process, transforming ideas into market-leading products. This role involves market research, strategy formulation, and cross-functional collaboration to ensure our products meet and exceed customer expectations. If you're passionate about product innovation and have a knack for understanding consumer needs, we want you on our team.</p>
            <h4>Qualification:</h4>
            <li>Experience in product development or management.</li>
            <li>Excellent communication and teamwork skills.</li>
            <a href="mailto:admin@eatifydash.com?subject=Application for Product Specialist (0024)"
              style={{ textDecoration: 'none' }}>
              <button>
                <FontAwesomeIcon icon={faEnvelope} />
                &nbsp;Apply Now</button>
            </a>          </div>
          <div className="position">
            <h3 className="text-center font-bold my-4">Sales Specialist (0026)</h3>
            <p>As a Sales Specialist, you'll play a key role in driving our company's revenue growth by identifying and converting potential leads into loyal customers. You'll work closely with our marketing and product teams to develop sales strategies that align with our business goals. Your responsibilities will include conducting market research, reaching out to potential clients, negotiating contracts, and providing exceptional after-sales support. If you're results-driven and have a talent for communication and negotiation, join us to help expand our market presence and achieve sales targets.</p>
            <h4>Qualification:</h4>
            <li>Proven sales experience, preferably in the POS industry.</li>
            <li>Strong communication, negotiation, and interpersonal skills.</li>
            <li>Ability to work independently and as part of a team.</li>
            <a href="mailto:admin@eatifydash.com?subject=Application for Sales Specialist (0026)"
              style={{ textDecoration: 'none' }}>
              <button>
                <FontAwesomeIcon icon={faEnvelope} />
                &nbsp;Apply Now</button>
            </a>
          </div>
        </div>
      </section>
      <br></br>
      <footer class="bg-gray-800 text-white p-4">
        <div class="max-w-screen-xl mx-auto flex flex-wrap justify-between items-center">
          <section class="flex gap-4">
            <Link to="/" class="hover:text-gray-300">Home</Link>
            <Link to="/career" class="hover:text-gray-300">Career</Link>
          </section>
          <section class="text-sm mt-4 md:mt-0">
            <p>© 2024 Eatifydash LLC || All rights reserved</p>
          </section>
        </div>
      </footer>

    </div>
  );
}

export default CareerPage;
