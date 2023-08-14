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
            <h2 class="medium_">Change, Starting with Scan-to-Order</h2>
            <p>
              Eatifydash is a digital solution platform
              that empowers restaurants with AI-driven
              digital tools for scan-to-order convenience.
              By leveraging advanced AI technologies from
              Google, we allow you to set up your
              bilingual image-integrated
              scan-to-order tools in less than 5 minutes.
              With multilingual support and instant bilingual
              receipt printing, Eatifydash effectively
              mitigates language barriers. We provide the most popular payment options:
              WeChat Pay, Ali Pay, Visa, Mastercard, Amex, Apple Pay, and Google Pay.
              We help you bypass 20% commision fees from  Uber and DoorDash.
            </p>
            <aside class="">
              <span>
                <h4 class="title small_">Available @ NY & SF </h4>
              </span>
            </aside>
          </article>
        </section>
      </div>
      <div className={isMobile ? "" : 'flex'}>
        <div style={isMobile ? {} : { width: "50%" }}>






          <div class={isPhone ? "container mb-5" : "container mb-5 flex"}>
            <div class="popular shadow card card-pricing text-center px-3 mb-4" style={isPhone ? {} : { width: "40%", marginLeft: "5%" }}>
              <span class="h6 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm" style={{ width: "90%" }}>Free Starter</span>
              <div class="bg-transparent card-header pt-4 border-0">
              </div>
              <div class="card-body pt-0">
                <ul class="list-unstyled mb-4">
                  <li>Billingual Menu Generation</li>
                  <li>Custom QR Code Creation</li>
                  <li>Cloud Data Sync</li>
                  <li>Cloud Printer</li>
                  <li>Remote Engineer Support</li>
                </ul>
                <a href="https://www.totoprayogo.com" target="_blank" class="btn btn-primary mb-3">Try Now</a>
              </div>
            </div>
            <div class="card card-pricing text-center px-3 mb-4" style={isPhone ? {} : { width: "40%", marginLeft: "10%" }}>
              <span class="h6 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm" style={{ width: "90%" }}>Professional</span>
              <div class="bg-transparent card-header pt-4 border-0">
              </div>
              <div class="card-body pt-0">
                <ul class="list-unstyled mb-4">
                  <li>Must Enroll in Starter Plan</li>
                  <li>We Provide Payment Support</li>
                  <li>+ ML based Fraud Protection</li>
                  <li>+ 24/7/365 Customer Care</li>
                  <li>(Bank Rate + 1% + $0.20 per Order)</li>
                </ul>
              </div>
            </div>
          </div>


        </div>
        <div style={isMobile ? {} : { width: "50%" }}>

        <div className={'grid grid-cols-2 lg:grid-cols-4 gap-6 m-3'}>

          <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://www.madiancan.com/images/mdcweb01/function-icon1.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>扫码点餐</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://www.madiancan.com/images/mdcweb01/function-icon7.png"} />
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
                  }} src={"https://www.madiancan.com/images/mdcweb01/function-icon2.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>全渠道收银</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://www.madiancan.com/images/mdcweb01/function-icon9.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>全天候客服</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://www.madiancan.com/images/mdcweb01/function-icon12.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>免费跌代</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://www.madiancan.com/images/mdcweb01/function-icon11.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>免费试用</span>
                </div>

              </div>

            </div>

            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://www.madiancan.com/images/mdcweb01/function-icon10.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>机器学习反欺诈</span>
                </div>

              </div>

            </div>
            <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://www.madiancan.com/images/mdcweb01/function-icon8.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>人工智能菜单创建</span>
                </div>

              </div>

            </div>
            </div>



        </div>
      </div>



      <div className='flex' >
        <div className style={{ marginLeft: "5%", width: "40%", marginRight: "5%" }}>
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
      <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 '}>

        <div class="">
          <div class="speaker">
            <div class="speaker-info">
              <div class="speaker-photo">
                <img src={"https://cdn.discordapp.com/attachments/759102082849833000/1140539212408573962/F8A37758-99C2-4718-B1D1-22E9653B78BA.jpg"} />
              </div>
            </div>
            <h3>Yiqun Xu</h3>
            <div>Co-founder @ New York</div>
            <div>Lehigh University Alumni</div>
          </div>
        </div>

        <div class="">
          <div class="speaker">
            <div class="speaker-info">
              <div class="speaker-photo">
                <img src={"https://cdn.discordapp.com/attachments/759102082849833000/1140521446972608573/goodLinkedInImage_-_Copy.jpg"} />
              </div>
            </div>
            <h3>Yutao Li</h3>
            <div>Co-founder @ San Francisco </div>
            <div>UC Davis Alumni</div>
          </div>
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