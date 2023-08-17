import React, { useState, useEffect } from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import demo from './demo.jpg';
import { useMemo } from 'react';
import { useMyHook } from '../pages/myHook';

import './home.css';
// Import Swiper React components

//import Navbar from './Navbar'
/**

 * 
 */

const Account = () => {
  const [width, setWidth] = useState(window.innerWidth - 64);
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);


  useEffect(() => {
    saveId(Math.random());
  }, []);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = width <= 768;
  const isPhone = width <= 500;
    // for translations sake
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const t = useMemo(() => {
      const trans = JSON.parse(sessionStorage.getItem("translations"))
      const translationsMode = sessionStorage.getItem("translationsMode")
  
      return (text) => {
        if (trans != null && translationsMode != null) {
          if (trans[text] != null && trans[text][translationsMode] != null) {
            return trans[text][translationsMode];
          }
        }
  
        return text;
      };
    }, [sessionStorage.getItem("translations"), sessionStorage.getItem("translationsMode")]);
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
            <h2 class="medium_">{t("Change, Starting with Scan-to-Order")}</h2>
            <p>
            {t("Eatifydash is a digital solution platform that empowers restaurants with AI-driven digital tools for scan-to-order convenience. By leveraging advanced AI technologies from Google, we allow you to set up your bilingual image-integrated scan-to-order tools in less than 5 minutes. With multilingual support and instant bilingual receipt printing, Eatifydash effectively mitigates language barriers. We provide the most popular payment options: WeChat Pay, AliPay, Visa, Mastercard, Amex, Apple Pay, and Google Pay. We help you bypass 20% commision fees from  Uber and DoorDash.")}
            </p>
            <button
              className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3.5 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => window.location.href = "/DemoCreateStore"}
              >
              {t("Set it up in less than 5 minutes")}
            </button>
            <aside class="">
              <span>
                <h4 class="title small_">{t("Available @ NY & SF")}</h4>
              </span>
            </aside>
          </article>
        </section>
      </div>
      <div className={isMobile ? "" : 'flex'}>
        <div style={isMobile ? {} : { width: "50%" }}>






          <div class={isPhone ? "container mb-5" : " container mb-5 flex"}>
            <div class="popular shadow card card-pricing text-center px-3 mb-4 ml-3 mr-3" style={isPhone ? {} : { width: "40%", marginLeft: "5%" }}>
              <span class="h6 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm" style={{ width: "90%" }}>{t("Free Starter")}</span>
              <div class="bg-transparent card-header pt-4 border-0">
              </div>
              <div class="card-body pt-0">
                <ul class="list-unstyled mb-4">
                  <li>{t("Bilingual Menu Generation")}</li>
                  <li>{t("Custom QR Code Creation")}</li>
                  <li>{t("Cloud Data Sync")}</li>
                  <li>{t("Cloud Printer")}</li>
                  <li>{t("Remote Engineer Support")}</li>
                </ul>
                <a href="/DemoCreateStore" target="_blank" class="btn btn-primary mb-3">{t("Try Now")}</a>
              </div>
            </div>
            <div class="card card-pricing text-center px-3 mb-4 ml-3 mr-3" style={isPhone ? {} : { width: "40%", marginLeft: "10%" }}>
              <span class="h6 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm" style={{ width: "90%" }}>{t("Professional")}</span>
              <div class="bg-transparent card-header pt-4 border-0">
              </div>
              <div class="card-body pt-0">
                <ul class="list-unstyled mb-4">
                  <li>{t("Must Enroll in Starter Plan")}</li>
                  <li>{t("We Provide Payment Support")}</li>
                  <li>{t("+ ML based Fraud Protection")}</li>
                  <li>{t("+ 24/7/365 Customer Care")}</li>
                  <li>{t("(Bank Rate + 1% + $0.20 per Order)")}</li>
                </ul>
              </div>
            </div>
          </div>


        </div>
        <div style={isMobile ? {} : { width: "50%" }}>

        <div className={'grid grid-cols-2 lg:grid-cols-4 gap-6 ml-6 mr-16'}>

          <div class="mb-30">
              <div class="card_demo">
                <div>
                  <img class="" style={{
                    height: "50px",
                    width: "50px", "margin": "auto"
                  }} src={"https://www.madiancan.com/images/mdcweb01/function-icon1.png"} />
                </div>

                <div style={{ "margin": "auto", "text-align": "center" }}>
                  <span>{t("QR Code Ordering")}</span>
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
                  <span>{t("Cloud Printing")}</span>
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
                  <span>{t("Multiple Payment Options")}</span>
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
                  <span>{t("24/7 Customer Service")}</span>
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
                  <span>{t("Free Updates")}</span>
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
                  <span>{t("Free Trial")}</span>
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
                  <span>{t("ML Anti-Fraud")}</span>
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
                  <span>{t("AI menu creation")}</span>
                </div>

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

        <div class="">
          <div class="speaker">
            <div class="speaker-info">
              <div class="speaker-photo">
                <img src={"https://media.discordapp.net/attachments/1127948915870814271/1140774753238528020/image.png?width=307&height=315"} />
              </div>
            </div>
            <h3>Ryan Li</h3>
            <div>Financial Consultant @ New York</div>
            <div>Active Contributor</div>
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
          <p>© 2023 Eatifydash LLC || All rights reserved</p>
        </section>
      </footer>



    </>
  )
}

export default Account