## EatifyPos:

If you're an eater, welcome to EatifyPos - your go-to online ordering platform for both dine-in and takeout. With EatifyPos, you can easily browse menus, place orders, and securely pay online for all your favorite meals.

If you're a business owner, EatifyPos is designed to make your operations smoother by streamlining your ordering, payment, and kitchen processes. Our app can seamlessly send order information to the kitchen thermal printers in real-time to prepare your food. With real-time messaging, you'll be alerted if there are any issues and faults, and our email confirmation system will notify both you and your customers every time an order is successfully placed. You can even customize the logo, title, and food items on the app's administrative page. We're also working on a management app that will transform EatifyPos into a Platform as a Service, complete with a system for you to purchase, use, and deploy the app online. The application was designed to be responsive on PC and compatible with 95% of mobile devices.

## Features
You can peruse through menus and order food for delivery or takeout through our platform. Payment can be made securely using Stripe. The merchant will receive a digital receipt via email and a physical receipt from a thermal printer. The option to track your order status in real-time will be available from March onwards. To simplify reordering, you can save your preferred orders. To begin, please access the demo at https://eatify-22231.web.app/. The Beta version of EatifyPos is scheduled for release in March and will not only include all the features mentioned above but also the capability to process verbal orders, manage the cash drawer and POS terminal, and provide revenue, tip, and tax summaries on the data summary page. Our goal is to continue development and optimization to bring EatifyPos to commercial viability.
<br />

**Remote control cash draw functionality:**
<br />

[![Cash Draw Demo](https://github.com/yiqun12/eatifyPos/blob/master/pictures/cash_drawer_video1.png)](https://youtu.be/KjKph0GSXjU "Cash Draw Demo")
<br />

**Remote control thermal printer functionality:**
<br />

[![Thermal printer](https://github.com/yiqun12/eatifyPos/blob/master/pictures/thermal_printer_video.png)](https://youtu.be/IAa4_3I1Hgk "Thermal printer")
<br />

**Earlier version demo:**
<br />

[![Earlier version](https://github.com/yiqun12/eatifyPos/blob/master/pictures/first_round_video.png)](https://www.youtube.com/shorts/MqSUspurhw4 "Earlier version")

## Technical details && install instruction
The frontend of EatifyPos is developed using React.js, while the backend is built on Node.js. Firebase is utilized for authentication, database management, hosting, and cloud functions. Online payments are handled by Stripe, and thermal printers are utilized to generate receipts. 

 - Clone this repo: `git clone https://github.com/yiqun12/eatifyPos.git`.
 - Open this sample's directory: `cd eatifyPos`
 - Install dependencies in the functions directory `npm install`
 - run this project locally and see the demo: `npm start`
<br />
If you're interested in adding personalized features to my app, and wish to deploy and purchase it for your store or restaurant, please get in touch with me at yix223@lehigh.edu. 

## Contribution
We welcome any contributions to the project. If you would like to contribute, please email us at yix223@lehigh.edu.


# Table of contents
### App_Overview
  * [Home_Page](#Home_Page)
  * [Checkout_Page](#Checkout_Page)
  * [Account_Page](#Account_Page)
  * [Authentication_Page](#Authentication_Page)
  * [Admin_Page](#Admin_Page)
  * [SignIn_Page](#SignIn_Page)
  * [Reservation_Page](#Reservation_Page)


### Home_Page
This page displays all the available products on the Home Page.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image1.png" width="80%"></p>
This indicates how to display all the items on the shopping cart.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image2.png" width="80%"></p>
This indicates how to see all the available burgers on the Home Page.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image20.png" width="80%"></p>


### Checkout_Page
Once a user has saved a card in our system, they can simply click on the checkout button to make a payment.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image4.png" width="80%"></p>
This image displays how to add new credit card in the Checkout Page.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image5.1.png" width="80%"></p>
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image5.2.png" width="80%"></p>
The image demonstrate the promp after a new online card is placed.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image5.3.png" width="80%"></p>
When a payment is completed, the receipt page will appear.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image5.4.png" width="80%"></p>
This image displays the email receipt sent to the customer after checkout.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image8.4.png" width="80%"></p>
This image depicts the email receipt for the administrator.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image8.6.png" width="80%"></p>
If a user tries to checkout with an empty shopping cart or with no credit card information, a prompt will appear indicating that the checkout has failed.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image8.5.png" width="80%"></p>
This image portrays the email notification for fault detection sent to the customer.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image9.5.png" width="80%"></p>
This image portrays the email notification for fault detection sent to the administrator.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image9.6.png" width="80%"></p>
This image demonstrates the steps to delete a payment method.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image9.7.png" width="80%"></p>
This image displays the email notification sent to the administrator confirming that a credit card has been deleted.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image9.8.png" width="80%"></p>
This is the receipt from the thermal printer:
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/burger1.png" width="80%"></p>

### Account_Page
These two page exhibits the user's account information, comprising both their profile and billing details.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image9.png" width="80%"></p>
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image10.png" width="80%"></p>
This image illustrates the payment details stored in the transaction history.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image11.png" width="80%"></p>

### Authentication_Page
This page displays the Authentication Page on the website. 
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image14.png" width="80%"></p>
Google Signin
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image12.png" width="80%"></p>
Reset password
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image13.png" width="80%"></p>
Email for resetting password
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image14.5.png" width="80%"></p>


### Admin_Page
The following showcases all the available features on the Admin Page.
Input products by Json.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image16.png" width="80%"></p>
Examples are provided below for updating products and their corresponding pictures:
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image15.png" width="80%"></p>
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image18.png" width="80%"></p>
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image19.png" width="80%"></p>
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image17.png" width="80%"></p>

### Reservation_Page
This page displays how to access our Reservation Page.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image21.png" width="80%"></p>
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image22.png" width="80%"></p>


