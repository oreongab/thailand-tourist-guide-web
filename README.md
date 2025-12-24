# Aow Ngai Dee Wa (Where Should We Go?) - Thailand Travel Guide Web

> **Final Project for Web Programming 1 (CSS233)**




##  Overview
**"Aow Ngai Dee Wa"** is a full-stack web application designed to recommend and search for tourist attractions across Thailand. It aims to solve the common problem of travelers not knowing "where to visit" by streamlining the decision-making process through filtering, ranking, and providing essential travel information in one place.

**Objectives:**
* To facilitate finding tourist attractions based on provinces and categories.
* To provide a ranking system for interesting places to aid decision-making.
* To reduce the time spent searching for information across multiple sources.

---

## Key Features
The system consists of the following core features:

* **Search & Filter:**
    * Search for places by **Name** or **Province**.
    * **Dynamic Filtering** by categories (e.g., Temple, Cafe, Nature) and opening status (Open Now/24 Hours).
* **Ranking System:**
    * Displays top-rated destinations based on the **Place Score** algorithm.
* **User Management:**
    * Secure **Registration** and **Login** functionality.
    * **Profile Management** allowing users to edit personal details and passwords.
* **Favorites:**
    * Users can **Add to Favorites** to save places for future visits.
    * Real-time management of the favorite list.
* **Place Details:**
    * Comprehensive view of location details: Images, Address, Opening Hours, and Review Scores.

---

##  Tech Stack
* **Frontend:** HTML5, CSS, JavaScript (Vanilla)
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Tools:** GitHub, VS Code, Figma, DBdiagram.io

---

##  Database Structure
The relational database consists of the following key tables :
* `user`: Stores user account information.
* `place`: Stores details of tourist attractions.
* `category`: Defines place categories.
* `favorite`: Stores user's saved places (Many-to-Many relationship).
* `place_images`: Manages multiple images for each location.





