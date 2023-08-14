import React, { useState, useEffect } from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import demo from './demo.jpg';

import './home.css';
// Import Swiper React components

//import Navbar from './Navbar'
/**

 * 
 */

const Account = () => {
  const [width, setWidth] = useState(window.innerWidth - 64);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = width <= 768;
  const isPhone = width <= 500;
  return (
    <>

      <div class="divisions division_1 flex_ padding_2x_">
        <section class="flex_content_ padding_2x_">
          <figure>
            <img src={demo} alt="" loading="lazy" />
          </figure>
        </section>
        <section class="flex_content_ padding_2x_">
          <article>
            <h2 class="medium_">Let's make your Interior better.</h2>
            <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration
              in some form, by injected humour, or randomised words which don't look even slightly believable. If you are
              going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the
              middle of text. </p>
            <aside class="fixed_flex_">
              <span>
                <h4 class="title small_">200+</h4>
                <p>New Furnitures</p>
              </span>
              <span>
                <h4 class="title small_">100+</h4>
                <p>Recycled Products</p>
              </span>
            </aside>
          </article>
        </section>
      </div>
      <div className={isMobile ? "" : 'flex'}>
        <div style={isMobile ? {} : { width: "50%" }}>






          <div class={isPhone ? "container mb-5 mt-5" : "container mb-5 mt-5 flex"}>
            <div class="card card-pricing text-center px-3 mb-4" style={isPhone ? {} : { width: "40%", marginLeft: "5%" }}>
              <span class="h6 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm" style={{ width: "90%" }}>Starter</span>
              <div class="bg-transparent card-header pt-4 border-0">
                <h1 class="h1 font-weight-normal text-primary text-center mb-0" data-pricing-value="15">$<span class="price">3</span><span class="h6 text-muted ml-2">/ per month</span></h1>
              </div>
              <div class="card-body pt-0">
                <ul class="list-unstyled mb-4">
                  <li>Up to 5 users</li>
                  <li>Basic support on Github</li>
                  <li>Monthly updates</li>
                  <li>Free cancelation</li>
                </ul>
                <button type="button" class="btn btn-outline-secondary mb-3">Order now</button>
              </div>
            </div>
            <div class="popular shadow card card-pricing text-center px-3 mb-4" style={isPhone ? {} : { width: "40%", marginLeft: "10%" }}>
              <span class="h6 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm" style={{ width: "90%" }}>Professional</span>
              <div class="bg-transparent card-header pt-4 border-0">
                <h1 class="h1 font-weight-normal text-primary text-center mb-0" data-pricing-value="30">$<span class="price">6</span><span class="h6 text-muted ml-2">/ per month</span></h1>
              </div>
              <div class="card-body pt-0">
                <ul class="list-unstyled mb-4">
                  <li>Up to 5 users</li>
                  <li>Basic support on Github</li>
                  <li>Monthly updates</li>
                  <li>Free cancelation</li>
                </ul>
                <a href="https://www.totoprayogo.com" target="_blank" class="btn btn-primary mb-3">Order Now</a>
              </div>
            </div>
          </div>


        </div>
        <div style={isMobile ? {} : { width: "50%" }}>
          <Carousel className="mx-auto" showThumbs={false} width={"none"} emulateTouch={true} showArrows={false} showStatus={false} showIndicators={false} swipeable={true} autoPlay infiniteLoop>
            <div className='mx-auto p-4 '>
              <div className='max-h-[400px] relative'>
                <div className='absolute  w-full h-full max-h-[500px] bg-black/40 text-gray-200 flex flex-col justify-center'>
                  <h1 className='!px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'>The <span className='text-orange-500'>Best</span></h1>
                  <h1 className='!px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'> <span className='text-orange-500'>Foods </span>Delivered</h1>
                </div>
                <img className='w-full max-h-[400px] object-cover' src="https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="#" />
              </div>
            </div>
            <div className='mx-auto p-4 '>
              <div className='max-h-[400px] relative'>
                <div className='absolute  w-full h-full max-h-[500px] bg-black/40 text-gray-200 flex flex-col justify-center'>
                  <h1 className='px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'>The <span className='text-orange-500'>Best</span></h1>
                  <h1 className='px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'> <span className='text-orange-500'>Foods </span>Delivered</h1>
                </div>
                <img className='w-full max-h-[400px] object-cover' src="https://images.unsplash.com/photo-1503767849114-976b67568b02?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="#" />
              </div>
            </div>
            <div className='mx-auto p-4 '>
              <div className='max-h-[400px] relative'>
                <div className='absolute  w-full h-full max-h-[500px] bg-black/40 text-gray-200 flex flex-col justify-center'>
                  <h1 className='px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'>The <span className='text-orange-500'>Best</span></h1>
                  <h1 className='px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'> <span className='text-orange-500'>Foods </span>Delivered</h1>
                </div>
                <img className='w-full max-h-[400px] object-cover' src="https://images.unsplash.com/photo-1516685018646-549198525c1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="#" />
              </div>
            </div>
          </Carousel>
        </div>
      </div>



      <div className='flex' >
        <div className style={{ marginLeft: "5%", width: "40%", marginRight: "5%" }}>
          <div className={'grid grid-cols-2 lg:grid-cols-4 gap-6 '}>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://image.ibb.co/cFV8mR/monitoring.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>云打印</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://image.ibb.co/cFV8mR/monitoring.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>云打印</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://image.ibb.co/cFV8mR/monitoring.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>云打印</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://image.ibb.co/cFV8mR/monitoring.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>云打印</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://image.ibb.co/cFV8mR/monitoring.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>云打印</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://image.ibb.co/cFV8mR/monitoring.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>云打印</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://image.ibb.co/cFV8mR/monitoring.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>云打印</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://image.ibb.co/cFV8mR/monitoring.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>云打印</span>
                </div>

              </div>

            </div>
          </div>

        </div>
        <div style={{ width: "50%" }}>
<div style={{ marginLeft: "5%", marginRight: "5%" }}>
<h2 class="medium_">
            Eatifydash is power by...
          </h2>
</div>

          <div class="mb-30" style={{ marginLeft: "5%", marginRight: "5%" }}>
            <div class="card_demo">

              <div className='flex'>
                <img class="" style={{
                  width: "200px",
                }} src={"https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png"} />
                 <img class="" style={{
                  width: "200px", 
                }} src={"https://static.wixstatic.com/media/0e0b22_c59900cb36a946aeb236abc7ae86559f~mv2.png/v1/fill/w_234,h_79,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/google-logo-9834.png"} />

              </div>

            </div>

          </div>

        </div>


      </div>

      <div class="col-md-4 col-sm-6">
        <div class="speaker">
          <div class="speaker-info">
            <div class="speaker-photo">
              <img src={"https://randomuser.me/api/portraits/women/58.jpg"} />
            </div>
          </div>
          <h3>Michele Doe</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
        </div>
      </div>









      <footer class="flex_">
        <section class="flex_content_">
          <a href="#">Home</a>
          <a href="#">About us</a>
          <a href="#">Career</a>
        </section>
        <section class="flex_content_ padding_1x" style={{ marginTop: "10px" }}>
          <p>© 2023 Eatifydash.com || All rights reserved</p>
        </section>
      </footer>



    </>
  )
}

export default Account