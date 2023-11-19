import React, { useState, useEffect } from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import demo from './demo.jpg';
import { useMemo } from 'react';
import { useMyHook } from '../pages/myHook';
import scroll from './scroll.png';
import intro_pic from './Best-Free-Online-Ordering-Systems-for-Restaurants.png';

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
	<section class = "header">	
		<div class = "header-text">
    		<h1 style= {{"font-size": "50px", "font-weight":"800", "margin-bottom": "2rem"}}>A Better Solution for Your Restaurants</h1>
    		<p>A digital platform that empowers restaurants 
    		with AI-driven digital tools for scan-to-order convenience</p>
    		<a href = "#about"><img src={scroll} style={{"padding-top": "10%", "margin-left": "auto","margin-right": "auto"}}/></a>
    	</div>	
    </section>
    
    <section class = "flex-item" id = "about" style={{"background-color":"#f2f2f2"}}> 
    	<div class = "grid-container">
    			<div class = "grid-item" style = {{"text-align": "left"}}>
    				<h1 style = {{"font-size": "40px", "font-weight":"600", "margin-bottom": "2rem"}}>About YumCha</h1>
    				<p style = {{"color: #525252; line-height": "1.5"}}>{t("By leveraging advanced AI technologies from Google, we allow you to set up your bilingual image-integrated scan-to-order tools in less than 5 minutes. With multilingual support and instant bilingual receipt printing, Eatifydash effectively mitigates language barriers. We provide the most popular payment options: WeChat Pay, AliPay, Visa, Mastercard, Amex, Apple Pay, and Google Pay. We help you bypass 20% commision fees from  Uber and DoorDash.")}</p>
    				 <p style = {{"color": "#525252", "border-top": "0.5px solid #919191", "padding-top": "2%"}}>Available @ NY & SF</p>
    				 <button className='button_demo' href ="" style={{"margin-top":"5%"}} onClick={() => window.location.href = "/account"}>Set it up in less than 5 minute</button>
    			</div>

    			<div class = "grid-item" style = {{"text-align": "center",  "padding": "5%"}}>
    				<img src ={intro_pic} style = {{"height": "auto", "max-width": "100%"}}/>
    			</div>
    	</div>

    </section>

    <section class = "flex-item" id = "functions">
			<div class ="grid-container">
				<div class="grid-item">
              <div class="card_demo">
                <div>
                  <img class="" style=
                    {{"height": "50px", "width": "50px", "margin":"auto"}}
                    src = {"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAABaElEQVR4nO2YQQ6DMAwE89r9A6/Ik+mtVXuoFa2TGJiRcqIQM7KN09YAAOCNjn7OXO2H6Pro71fHHwaIwI5AkYEXLuHwhgC3x2X3yFEQaIJAEwRWE5g952nyHDg7fjtAIRCBIgM/UMKLe+Tte6AQ2BFIBva6Z2FtHovc+P0bAhBoIjIQgXJKOHu1xRk/O/7tAQiBHYFkYM8r4dUo+aj2OIRADwSaPE6gO5Zo8ZiTHe/o/tMDEgK/QWAAGVj8KKdiK/KFwAOBJxl43KiEox5V7fru/UJ2CxICOwLJwETcHqHkkqx+//aAhMBvEEgG1kKDX+lyc95uhEAPBJrcTmAUsLuauf/l5jwEDoJAEwSaZPcEbf43ZnULQuCBwJMMvHMJz57TVKwHT99QCESgyMAHl7AWv+D0/RDYEfgPMvDqAqs9T+YgvPwjUu15QuAYCHyawOzVzHjsF5y9HwI7Ah3IQJPVLQMAoF2YF7iQWnrDYEt1AAAAAElFTkSuQmCC"}/>
                </div>

                <div class = "text">
                  <span>QR Code Ordering</span>
                </div>

              </div>

            </div>
            <div class="grid-item">
              <div class="card_demo">
                <div>
                  <img style=
                    {{"height": "50px", "width": "50px", "margin":"auto"}}
                    src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAACJElEQVR4nO3XP0vDQBgG8G5+CD9Odz+Cn8A6NkdWO0iClA52MDc4qOAqSEHwDzpUsdAuKhWHHKggEZGz4Hhy2KjF2qZe00vungeeqbWSH+/buxYKCGJEiE9FnlrIWkgGUIwAzHoAqBgAKgaAigGg7YDs4SnVGg9IUr6eGA9Y39pLtcYD6g4AFQNAxQBQMQBUDABtByS4BwIwlRDcAwE4lZRqtTniB8uOF5wTL+hN+7eo7kz8HewFPWnheLQkbUbiuWub88QLOmn+mNcdlWdzfNqWRn9PXh+vUt8Rx61rcff4IljEE5XkDDDpc0mDk9aNWN3Y/UIcOolybWO87v1z4n/ADAeMK02kzeffB0tDAOmFfFFO3qQfziwAlD26vOp/L9LmL0DHo2/yxUnWllkGKG36E8iHTeC/P5hZAvjzOQEYaQI8bXfFyvq2cdeYSn1HnHVu0wf8PonMAowRUwc0/SLNAJhzQJLzAtDPOOC4Q4TkuDM5RORRbyJiZVbXGNtLAMgByDCBXPsqYoUjAAorD5FFWja6DIDlfAAehIdGFYAhAAUmMNS/iljhEIBC9zTl4hAxtQyA5WwD2l4CQA5Ahgnk2lcRKxwBUOieJhwiEQCFddeYBXd/ZFnG398sFkcWgG5OAP3G60DHTUhW3h9DvVerAwVgA4ACE+hihXEKR7jGiEyfwraXAJADkGECufZVxApHABRGHiIoTWQAQH/KgAhS0JEPxlRwOLEAjQcAAAAASUVORK5CYII="}/>
                </div>

                <div class = "text">
                  <span>Cloud Printing</span>
                </div>

              </div>

            </div>

            <div class="grid-item">
              <div class="card_demo">
                <div>
                  <img style=
                    {{"height": "50px", "width": "50px", "margin":"auto"}}
                    src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB0ElEQVR4nO2aMUrEQBSG5x7aegXrXMATSAardAoWCWunWC5os1rEILa6COINtrRK4zUESTnNk7iJLCnUJdE3k/1++LsEZj7emzf5iTEIjU77ebYdF+k8vskqW2RSezfa+9btc0N7uYb08eA23THhwMveuhvRAvgFsl7T3fGW8V1xkc7rBR/Nz+Ti5VpmZf7pnwC2zw3teg2HD6dNNab3xnfFTduuwtMEuIR41VRh+m58l21aprsJTYC123UZ32UBqAuwKyqwBCAV+J+ym9rCk2khQ9h6DnCofQJw+kcAKye9bD2vwL77A6ADoFCBES3MGdgVQ0QYIjOmcM41xnIP5CJdcZHO+RJpxadcybcwYYIjTBDSmJI4S8gDCVSFQNURqAqBakSgSqDaFYGqEKjOQghUx/5nQgXAHICrogJLWnitM3ASuNXPwEngVv+5qBq5AegAKFSg029FWtgBULSriSHiACjaFcU1xgFQQjIXaQdAoQKdfivSwg6Aol1NDBHnIUBc/IoBAKcDA9RScnIptc+L57Xcvmc2XQkA+wmAPQXAngJgTwGwAyIUG9+UeABlFACfFq9eG4ALAAoVSAsPr8SDwTCKIZIEYm1eCCFkRqAPm3nT52VS1VQAAAAASUVORK5CYII="}/>
                </div>

                <div class = "text">
                  <span>Multiple Payment Options</span>
                </div>

              </div>

            </div>
            <div class="grid-item">
              <div class="card_demo">
                <div>
                  <img style=
                    {{"height": "50px", "width": "50px", "margin":"auto"}}
                    src={"data:image/png;base64,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"}/>
                </div>

                <div class = "text">
                  <span>24/7 Customer Service</span>
                </div>

              </div>

            </div>
            <div class="grid-item">
              <div class="card_demo">
                <div>
                  <img style=
                    {{"height": "50px", "width": "50px", "margin":"auto"}}
                  src={"data:image/png;base64,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"}/>
                </div>

                <div class = "text">
                  <span>Free Updates</span>
                </div>

              </div>

            </div>
            <div class="grid-item">
              <div class="card_demo">
                <div>
                  <img style=
                    {{"height": "50px", "width": "50px", "margin":"auto"}}
                    src={"data:image/png;base64,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"}/>
                </div>

                <div class = "text">
                  <span>Free Trial</span>
                </div>

              </div>

            </div>

            <div class="grid-item">
              <div class="card_demo">
                <div>
                  <img class="" style=
                    {{"height": "50px", "width": "50px", "margin":"auto"}}
                    src={"data:image/png;base64,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"}/>
                  </div>

                <div class = "text">
                  <span>ML Anti-Fraud</span>
                </div>

              </div>

            </div>
            <div class="grid-item">
              <div class="card_demo">
                <div>
                  <img class="" style=
                    {{"height": "50px", "width": "50px", "margin":"auto"}}
                     src={"data:image/png;base64,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"}/>
                </div>

                <div class = "text">
                  <span>AI menu creation</span>
                </div>

              </div>

            </div>

        
        </div>
            
    </section>

    <section class = "flex-item" id = "pricing" style={{"background-color":"#f2f2f2"}}>
    	
    	<div class = "flex-container">
    	<div class="flex-item-left">
  		<ul class="price"  style={{"border": "2px solid #cc9966"}}>
    		<li class="price-header">Free Starter</li>
    		<li >Custom QR Code Creation</li>
    		<li>Cloud Data Sync</li>
    		<li>Cloud Printer</li>
    		<li>Remote Engineer Support</li>
    		<li>(Basic Bank Rate)</li>
    		<li style = {{"border": "0px", "padding-bottom": "10%"}}><a href="#" class="button">Try Now</a></li>
  		</ul>
		</div>

		<div class="flex-item-right">
 		 <ul class="price">
    		<li class="price-header">Professional</li>
    		<li>Must Enroll in Starter Plan</li>
    		<li>We Provide Payment Support</li>
    		<li>+ ML based Fraud Protection</li>
    		<li>+ 24/7/365 Customer Care</li>
    		<li>(Bank Rate + 1% + $0.20 per Order)</li>
    		<li style = {{"border": "0px", "padding-bottom": "10%"}}><a href="#" class="button">Try Now</a></li>
  			</ul>
		</div>
		</div>
    	
    </section>
    	
    <section class="flex-item" id = "more"> 	
    	
    	<div class = "text-box"> 
    		<p style ={{"font-size":"20px", "color": "white", "margin-bottom":"0px"}}>Sponsored By:</p>
    		<div class = "sponsor-icons">
    		<img style = {{"height": "100px", "width":"100px", "margin":"5%"}} 
        src={"data:image/png;base64,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"}/>
    		<img style = {{"height": "100px", "width":"100px", "margin":"5%"}}
         src={"data:image/png;base64,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"}/>
        </div>
    		
    	</div>
    	
    </section>
    
    
     <section class="flex-item" id = "intro"  style={{"background-color":"#f2f2f2"}}>
     	<p style ={{"font-size":"20px", "text-align":"center"}}>Meet Our Team</p>
     	<div class = "grid-container">
          
          <div class="grid-item">
              <div class="speaker-photo">
                <img style = {{"height": "150px", "width": "150px", "margin":"auto"}}
                src="https://cdn.discordapp.com/attachments/759102082849833000/1140539212408573962/F8A37758-99C2-4718-B1D1-22E9653B78BA.jpg" />
              </div>
              
            <div class = "speaker-info">
            	<h3>Yiqun Xu</h3>
            	<div>Co-founder @ New York</div>
            	<div>Lehigh University Alumni</div>
            </div>
          </div>

          <div class="grid-item">
              <div class="speaker-photo">
                <img style = {{"height": "150px", "width": "150px", "margin":"auto"}}
                src={"https://cdn.discordapp.com/attachments/759102082849833000/1140521446972608573/goodLinkedInImage_-_Copy.jpg"} />
              </div>
            
       	 	<div class="speaker-info">
            	<h3>Yutao Li</h3>
            	<div>Co-founder @ San Francisco </div>
            	<div>UC Davis Alumni</div>
          	</div>
          </div>

          <div class="grid-item">
           
              <div class="speaker-photo">
                <img style = {{"height": "150px", "width": "150px", "margin":"auto"}}
                src={"https://media.discordapp.net/attachments/1127948915870814271/1140774753238528020/image.png?width=307&height=315"} />
              </div>

             <div class="speaker-info">
            <h3>Ryan Li</h3>
            <div>Financial Consultant @ New York</div>
            <div>Active Contributor</div>
          </div>
        </div>
        
        <div class="speaker">
           
              <div class="speaker-photo">
                <img style = {{"height": "150px", "width": "150px", "margin":"auto"}}
                src={"https://scontent-bos5-1.xx.fbcdn.net/v/t1.6435-1/82974134_1244012432652904_3597039280813244416_n.jpg?stp=dst-jpg_p480x480&_nc_cat=108&ccb=1-7&_nc_sid=7206a8&_nc_ohc=kkDisOmu4ZAAX-wBZF2&_nc_ht=scontent-bos5-1.xx&oh=00_AfDFSbcYqkdHeBKMj_n5X77nz99NiHf22t9hqWBgpbkHMQ&oe=651244DD"} />
              </div>

             <div class="speaker-info">
            <h3>Winnie Mei</h3>
            <div>Statistician @ Boston</div>
            <div>Active Contributor</div>
          </div>
          
        </div>
        </div>
          
     </section>


      <footer class="flex_">
        <section class="flex_content_">
          <a >Home</a>
          <a >About us</a>
          <a >Career</a>
        </section>
        <section class="flex_content_ padding_1x" style={{ marginTop: "10px" }}>
          <p>© 2023 Eatifydash LLC || All rights reserved</p>
        </section>
      </footer>
      
    </div>
  )
}

export default Account