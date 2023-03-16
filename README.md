## EatifyPos:

Introducing EatifyPos - the ultimate online ordering platform for both diners and business owners. Our platform makes browsing menus, placing orders, and securely paying for your favorite meals hassle-free, whether you're dining in or ordering takeout.

For business owners, EatifyPos streamlines your ordering, payment, and kitchen processes, ensuring smoother operations. Our platform is responsive on PC and compatible with 95% of mobile devices. With real-time messaging and email confirmation systems, you can stay updated on any issues and faults, and even customize the app's administrative page with your logo, title, and food items.

We also offer the flexibility of in-person payment, allowing you to design and assign seats for your dine-in customers, charge them in person using our Stripe terminal, and remotely control the cash drawer with just one click. Online payments rates are 2.9% + 30¢ per successful card charge, and in-person payments by stripe terminal, it's 2.7% plus 5 cents per transaction.

As for diners, our platform offers a hassle-free experience for ordering food for delivery or takeout, with secure payment options powered by Stripe. Merchants receive digital and physical receipts, and you can track your order status in real-time. Saving your preferred orders makes reordering simpler.

Get started today by accessing our demo at https://eatify-22231.web.app/. We're continually improving and optimizing our platform to ensure commercial viability, so stay tuned for updates.
<br />

**Remote control cash draw functionality: by 02/24**
<br />

[![Cash Draw Demo](https://github.com/yiqun12/eatifyPos/blob/master/pictures/cash_drawer_video1.png)](https://youtu.be/KjKph0GSXjU "Cash Draw Demo")
<br />

**Remote control thermal printer functionality: by 02/24**
<br />

[![Thermal printer](https://github.com/yiqun12/eatifyPos/blob/master/pictures/thermal_printer_video.png)](https://youtu.be/IAa4_3I1Hgk "Thermal printer")
<br />

**Pre-test version demo: by early January.**
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
We welcome any contributions to the project. If you would like to contribute, please email me at yix223@lehigh.edu.


# Table of contents
### App_Overview
  * [Home_Page](#Home_Page)
  * [Admin_Page](#Admin_Page)
  * [Checkout_Page](#Checkout_Page)
  * [Translate_features](#Translate_features)
  * [Account_Page](#Account_Page)
  * [Authentication_Page](#Authentication_Page)
  * [SignIn_Page](#SignIn_Page)
  * [Reservation_Page](#Reservation_Page)


### Home_Page
This page displays all the available products on the Home Page.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image1.png" width="80%"></p>
This indicates how to display all the items on the shopping cart.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image2.png" width="80%"></p>
This indicates how to see all the available burgers on the Home Page.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image20.png" width="80%"></p>

### Admin_Page
The following showcases all the available features on the Admin Page.
Food item modification:
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/admin1.png" width="80%"></p>
Revenue chart in 31 days basis:
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/admin2.png" width="80%"></p>
Assign table by in person order
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/admin3.png" width="80%"></p>
Order history
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/admin4.png" width="80%"></p>
Other setting
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/admin5.png" width="80%"></p>

### Translate_features:
This page displays the translation features in my website
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/admin6.png" width="80%"></p>

### Income_management:
This page displays the income managment page from stripe:
Online: 2.9% + 30¢ per successful card charge
In person by terminal: 2.7% plus 5 cents per transaction
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/admin6.png" width="80%"></p>

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


### Reservation_Page
This page displays how to access our Reservation Page.
<p align="center"> <img src="https://github.com/yiqun12/eatifyPos/blob/master/pictures/image22.png" width="80%"></p>



