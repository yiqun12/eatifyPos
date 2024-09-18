import React, { useState, useEffect } from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import demo from './demo.jpg';
import { useMemo } from 'react';
import { useMyHook } from '../pages/myHook';
import scroll from './scroll.png';
import intro_pic from './Best-Free-Online-Ordering-Systems-for-Restaurants.png';
import { Link } from 'react-router-dom';

import './home.css';

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
    <div>
      <section class="header">
        <div class="header-text">
          <h1 style={{ "font-size": "50px", "font-weight": "800", "margin-bottom": "2rem" }}>A Better Solution for Your Restaurants</h1>
          <p>We put our heart into every little detail of our products, going above and beyond to make things easier for our customers, whether it's through our POS system or service.</p>
          <a ><img src={scroll} style={{ "padding-top": "10%", "margin-left": "auto", "margin-right": "auto" }} /></a>
        </div>
      </section>
      <section class="flex-item" id="pricing" style={{ "background-color": "#f2f2f2" }}>

        <div class="flex-container">
          <div class="flex-item-right">
            <ul class="price">
              {/* <li class="price-header">Professional</li> */}
              <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%', // This creates a square aspect ratio
              }}>
                <img
                  src="https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/1bc8bcd0-5e7b-409f-6f07-cde3f3bc2200/public"

                  alt="Description" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' // Optional, to cover the area without losing aspect ratio
                  }} />
              </div>
              <li>Choose your own handheld kit</li>
              <li>Installation & Network Configuration</li>
              <li>Order & Table Management</li>
              <li>Gratuity Management Tools</li>
              <li>Simple, flat rate (Bank Rate + 1% per Order)</li>
            </ul>
          </div>
          <div class="flex-item-right">
            <ul class="price">
              <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%', // This creates a square aspect ratio
              }}>
                <img src="https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/160b451c-e42c-43a0-dea1-43cb504f6e00/public"

                  alt="Description" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' // Optional, to cover the area without losing aspect ratio
                  }} />
              </div>
              <li>Reporting & Analytics</li>
              <li>Mobile Management Tools</li>
              <li>Real-time fraud monitoring</li>
              <li>Generative AI Menu Management</li>
              <li>24/7/365 Availability</li>
            </ul>
          </div>


          <div class="flex-item-right">
            <ul class="price">
              <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%', // This creates a square aspect ratio
              }}>
                <img
                  src="https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/2474a6cc-db01-485d-af4a-d6345609ed00/public"

                  alt="Description" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' // Optional, to cover the area without losing aspect ratio
                  }} />
              </div>
              <li>Online Ordering</li>
              <li>InStore Kiosk Ordering</li>
              <li>Third Party Delivery Integrations</li>
              <li>TakeOut Ordering</li>
            </ul>
          </div>
          <div class="flex-item-left">
            <ul class="price" >
              <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%', // This creates a square aspect ratio
              }}>
                <img src="https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/7444a388-1610-475b-b5b2-b0c556bd8d00/public"
                  alt="Description" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' // Optional, to cover the area without losing aspect ratio
                  }} />
              </div>
              <li>Digital Menus</li>
              <li>Mobile Payments</li>
              <li>QR code/NFC ordering</li>
            </ul>
          </div>
        </div>

      </section>
      <section class="flex-item" id="about" style={{ "background-color": "#f2f2f2" }}>
        <div class="grid-container">
          <div class="grid-item" style={{ "text-align": "left" }}>
            <h1 style={{ "font-size": "40px", "font-weight": "600", "margin-bottom": "2rem" }}>About Eatifydash</h1>
            <p style={{ "color: #525252; line-height": "1.5" }}>
              With latest AI tech at our fingertips, setting up your bilingual, picture-powered ordering tools takes no more than five minutes. Eatifydash brings down language walls with support for several languages and quick printing of bilingual receipts. You can choose from a variety of popular payment methods, including WeChat Pay, AliPay, Visa, Mastercard, Amex, Apple Pay, and Google Pay. Say goodbye to the steep 10%-30% fees that platforms like Uber and DoorDash charge. With us, you're looking at a fixed fee of $4 for each delivery that's successfully made.
            </p>
            <p style={{ "color": "#525252", "border-top": "0.5px solid #919191", "padding-top": "2%" }}>Contact us for sales at admin@eatifydash.com</p>
            <button className='button_demo' style={{ "margin-top": "5%" }} onClick={() => window.location.href = "/account"}>Set up your account right now</button>
          </div>

          <div class="grid-item" style={{ "text-align": "center", "padding": "5%" }}>
            <img src={intro_pic} style={{ "height": "auto", "max-width": "100%" }} />
          </div>
        </div>

      </section>

      <section class="flex-item" id="functions">
        <div class="grid-container">
          <div class="grid-item">
            <div class="card_demo">
              <div>
                <img class="" style=
                  {{ "height": "50px", "width": "50px", "margin": "auto" }}
                  src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAABaElEQVR4nO2YQQ6DMAwE89r9A6/Ik+mtVXuoFa2TGJiRcqIQM7KN09YAAOCNjn7OXO2H6Pro71fHHwaIwI5AkYEXLuHwhgC3x2X3yFEQaIJAEwRWE5g952nyHDg7fjtAIRCBIgM/UMKLe+Tte6AQ2BFIBva6Z2FtHovc+P0bAhBoIjIQgXJKOHu1xRk/O/7tAQiBHYFkYM8r4dUo+aj2OIRADwSaPE6gO5Zo8ZiTHe/o/tMDEgK/QWAAGVj8KKdiK/KFwAOBJxl43KiEox5V7fru/UJ2CxICOwLJwETcHqHkkqx+//aAhMBvEEgG1kKDX+lyc95uhEAPBJrcTmAUsLuauf/l5jwEDoJAEwSaZPcEbf43ZnULQuCBwJMMvHMJz57TVKwHT99QCESgyMAHl7AWv+D0/RDYEfgPMvDqAqs9T+YgvPwjUu15QuAYCHyawOzVzHjsF5y9HwI7Ah3IQJPVLQMAoF2YF7iQWnrDYEt1AAAAAElFTkSuQmCC"} />
              </div>

              <div class="text">
                <span>QR Code Ordering</span>
              </div>

            </div>

          </div>
          <div class="grid-item">
            <div class="card_demo">
              <div>
                <img style=
                  {{ "height": "50px", "width": "50px", "margin": "auto" }}
                  src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAACJElEQVR4nO3XP0vDQBgG8G5+CD9Odz+Cn8A6NkdWO0iClA52MDc4qOAqSEHwDzpUsdAuKhWHHKggEZGz4Hhy2KjF2qZe00vungeeqbWSH+/buxYKCGJEiE9FnlrIWkgGUIwAzHoAqBgAKgaAigGg7YDs4SnVGg9IUr6eGA9Y39pLtcYD6g4AFQNAxQBQMQBUDABtByS4BwIwlRDcAwE4lZRqtTniB8uOF5wTL+hN+7eo7kz8HewFPWnheLQkbUbiuWub88QLOmn+mNcdlWdzfNqWRn9PXh+vUt8Rx61rcff4IljEE5XkDDDpc0mDk9aNWN3Y/UIcOolybWO87v1z4n/ADAeMK02kzeffB0tDAOmFfFFO3qQfziwAlD26vOp/L9LmL0DHo2/yxUnWllkGKG36E8iHTeC/P5hZAvjzOQEYaQI8bXfFyvq2cdeYSn1HnHVu0wf8PonMAowRUwc0/SLNAJhzQJLzAtDPOOC4Q4TkuDM5RORRbyJiZVbXGNtLAMgByDCBXPsqYoUjAAorD5FFWja6DIDlfAAehIdGFYAhAAUmMNS/iljhEIBC9zTl4hAxtQyA5WwD2l4CQA5Ahgnk2lcRKxwBUOieJhwiEQCFddeYBXd/ZFnG398sFkcWgG5OAP3G60DHTUhW3h9DvVerAwVgA4ACE+hihXEKR7jGiEyfwraXAJADkGECufZVxApHABRGHiIoTWQAQH/KgAhS0JEPxlRwOLEAjQcAAAAASUVORK5CYII="} />
              </div>

              <div class="text">
                <span>Cloud Printing</span>
              </div>

            </div>

          </div>

          <div class="grid-item">
            <div class="card_demo">
              <div>
                <img style=
                  {{ "height": "50px", "width": "50px", "margin": "auto" }}
                  src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB0ElEQVR4nO2aMUrEQBSG5x7aegXrXMATSAardAoWCWunWC5os1rEILa6COINtrRK4zUESTnNk7iJLCnUJdE3k/1++LsEZj7emzf5iTEIjU77ebYdF+k8vskqW2RSezfa+9btc0N7uYb08eA23THhwMveuhvRAvgFsl7T3fGW8V1xkc7rBR/Nz+Ti5VpmZf7pnwC2zw3teg2HD6dNNab3xnfFTduuwtMEuIR41VRh+m58l21aprsJTYC123UZ32UBqAuwKyqwBCAV+J+ym9rCk2khQ9h6DnCofQJw+kcAKye9bD2vwL77A6ADoFCBES3MGdgVQ0QYIjOmcM41xnIP5CJdcZHO+RJpxadcybcwYYIjTBDSmJI4S8gDCVSFQNURqAqBakSgSqDaFYGqEKjOQghUx/5nQgXAHICrogJLWnitM3ASuNXPwEngVv+5qBq5AegAKFSg029FWtgBULSriSHiACjaFcU1xgFQQjIXaQdAoQKdfivSwg6Aol1NDBHnIUBc/IoBAKcDA9RScnIptc+L57Xcvmc2XQkA+wmAPQXAngJgTwGwAyIUG9+UeABlFACfFq9eG4ALAAoVSAsPr8SDwTCKIZIEYm1eCCFkRqAPm3nT52VS1VQAAAAASUVORK5CYII="} />
              </div>

              <div class="text">
                <span>Multiple Payment Options</span>
              </div>

            </div>

          </div>
          <div class="grid-item">
            <div class="card_demo">
              <div>
                <img style=
                  {{ "height": "50px", "width": "50px", "margin": "auto" }}
                  src={"data:image/png;base64,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"} />
              </div>

              <div class="text">
                <span>24/7 Customer Service</span>
              </div>

            </div>

          </div>

          <div class="grid-item">
            <div class="card_demo">
              <div>
                <img class="" style=
                  {{ "height": "50px", "width": "50px", "margin": "auto" }}
                  src={"data:image/png;base64,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"} />
              </div>

              <div class="text">
                <span>ML Anti-Fraud</span>
              </div>

            </div>

          </div>
          <div class="grid-item">
            <div class="card_demo">
              <div>
                <img class="" style=
                  {{ "height": "50px", "width": "50px", "margin": "auto" }}
                  src={"data:image/png;base64,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"} />
              </div>

              <div class="text">
                <span>AI menu creation</span>
              </div>

            </div>

          </div>
          <div class="grid-item">
            <div class="card_demo">
              <div>
                <img class="" style=
                  {{ "height": "50px", "width": "50px", "margin": "auto" }}
                  src={"https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/dc910a39-79fd-410e-2cb9-0921ccb6ad00/public"} />
              </div>

              <div class="text">
                <span>Accessible From Anywhere</span>
              </div>

            </div>

          </div>
          <div class="grid-item">
            <div class="card_demo">
              <div>
                <img class="" style=
                  {{ "height": "50px", "width": "50px", "margin": "auto" }}
                  src={"https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/2f77e6b1-d54b-40de-43df-61f90d52e200/public"} />
              </div>

              <div class="text">
                <span>Offline Mode</span>
              </div>

            </div>

          </div>

        </div>

      </section>



      <section class="flex-item" id="more">

        <div class="text-box">
          <p style={{ "font-size": "20px", "color": "white", "margin-bottom": "0px" }}>Partnered With:</p>
          <div class="sponsor-icons">
            <img style={{ "height": "100px", "width": "150px", "margin": "5%" }}
              src={"https://images.ctfassets.net/2chiqpnroeav/55efPb9sVKCMjW5jARpYHI/4f80cec40d9dd0bc71e207809d4c1201/company892-google-cloud.png"} />
            <img style={{ "height": "100px", "width": "100px", "margin": "5%" }}
              src={"data:image/png;base64,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"} />
          </div>

        </div>

      </section>


      <section class="flex-item" id="intro" style={{ "background-color": "#f2f2f2" }}>
        <p style={{ "font-size": "20px", "text-align": "center" }}>Meet Our Team</p>
        <div class="grid-container">

          <div class="grid-item">
            <div class="speaker-photo">
              <img style={{ "height": "150px", "width": "150px", "margin": "auto" }}
                src="https://media.licdn.com/dms/image/D4E03AQEBLv9FyUs_nA/profile-displayphoto-shrink_800_800/0/1691732209318?e=1714608000&v=beta&t=IMu8cJGDMZm3c1z1Sk45id0vptHwGmVsI_eYDXwpvpw" />
            </div>

            <div class="speaker-info notranslate">
              <h3>Yiqun Xu</h3>
              <div>Co-founder @ New York</div>
            </div>
          </div>

          <div class="grid-item">
            <div class="speaker-photo">
              <img style={{ "height": "150px", "width": "150px", "margin": "auto" }}
                src={"https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/5881e432-dcec-434b-bba3-5a6e7b971a00/public"} />
            </div>

            <div class="speaker-info notranslate">
              <h3>Yutao Li</h3>
              <div>Co-founder @ San Francisco </div>
            </div>
          </div>

          <div class="grid-item">
            <div class="speaker-photo">
              <img style={{ "height": "150px", "width": "150px", "margin": "auto" }}
                src={"https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/aa3ee33c-e717-41a8-daaa-dcb18268ea00/public"} />
            </div>

            <div class="speaker-info notranslate">
              <h3>Yimei Wen</h3>
              <div>Active Contributor @ Boston </div>
              <div>Clemson University Ph.D.</div>
            </div>
          </div>
          <div class="grid-item">
            <div class="speaker-photo">
              <img style={{ "height": "150px", "width": "150px", "margin": "auto" }}
                src={"https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/03a895d4-0b79-47fe-9319-fa4b7a089500/public"} />
            </div>

            <div class="speaker-info notranslate">
              <h3>Jessica Jiang</h3>
              <div>Active Contributor @ New York </div>
            </div>
          </div>
          <div class="speaker">

            <div class="speaker-photo">
              <img style={{ "height": "150px", "width": "150px", "margin": "auto" }}
                src={"https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/be0bbc41-1ee1-4a29-50a4-f9fb085bc800/public"} />
            </div>

            <div class="speaker-info notranslate">
              <h3>Winnie Mei</h3>
              <div>Active Contributor @ Boston</div>
            </div>

          </div>
        </div>

      </section>


      <footer class="flex_">
        <section class="flex_content_">
          <Link to="/">Home</Link>
          <Link to="/career">Career</Link>
        </section>
        <section class="flex_content_ padding_1x" style={{ marginTop: "10px" }}>
          <p>© 2024 Eatifydash LLC || All rights reserved</p>
        </section>
      </footer>

    </div>
  )
}

export default Account