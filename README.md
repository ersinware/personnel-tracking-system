# Personnel Tracking System

It is a is a web application built using Node.js, SvelteKit, and SQLite, designed to allow high-authority administrators and department managers to track the work of the personnel they are responsible for. Through application's management panel, departments, users, and work entries can be added, edited, and deleted. Departments and users can be searched by name, and work entries can be filtered by personnel, department, and date. The system includes three user roles: high-authority administrator, department manager, and personnel. When a user is created, an automatically generated password is sent to the new user's email address. Users also have the ability to change their passwords. Additionally, if users forget their passwords, they can recover them using a feature that sends a link to their email with a token that expires in 5 minutes.

# Notes

To access the application, please go to the /giriş-yap page and use the following credentials:
<br/>
Email address: ekaraer97@gmail.com
<br/>
Password: Pass1234

The application's language is Turkish. Please use Google Translate to translate the content into English.

The system is currently under development. A calendar view linked to personnel will be implemented, and a calendar component will be integrated into date input fields.

Creating a new user does not work because an e-mail address and Gmail API credentials needed in .env file.

# Version

node version: v18.20.4 
npm version : v10.7.0
