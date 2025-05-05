# CONTAINERS:

## CONTAINER_NAME: auth

### DESCRIPTION:
The "auth" container hosts the microservice responsible for the authentication and management of user and Admin accounts within the platform. It allows users and Admins to register and log in.

### USER STORIES:
1, 2, 4, 23, 24

### PORTS:
8000:8000

### PERSISTENCE EVALUATION:
This container uses a PostgreSQL database to persist user account information. All registered user data, including login credentials and personal data, are stored persistently. JWT Tokens are stateless, so they don't get saved in the database, but they are created and validated at the moment. (Logout handled client-side).

### EXTERNAL SERVICES CONNECTIONS:
- Connects to the PostgreSQL database for storing user information.
- Every microservice which requires authentication imports the get_current_user function from this microservice.

### MICROSERVICES:

#### MICROSERVICE: Authentication Service
- TYPE: backend
- DESCRIPTION: Manages user registration, login, and login persistance.
- PORTS: 8000
- TECHNOLOGICAL SPECIFICATION:
  - Framework: FastAPI  
  - Language: Python  
  - Authentication: JWT (via python-jose)  
  - Hashing: bcrypt via passlib  
  - Database: PostgreSQL via SQLAlchemy ORM

- SERVICE ARCHITECTURE:
  The service follows a RESTful architecture. JWT tokens are issued upon successful login and must be included in the headers of protected requests. Middleware HTTPBearer handles token validation and extracts the current user.

- ENDPOINTS:

    | HTTP METHOD | URL              | Description                                              | User Stories |
    |-------------|------------------|----------------------------------------------------------|--------------|
    | POST        | /auth/register   | Register a new user                                      | 1            |
    | POST        | /auth/login      | Log in and receive an access token                       | 2, 4, 23, 24 |
- DB STRUCTURE: 

	**_users_** :	
	| **_id_** (PK) | email | hashed_password | is_admin | first_name | last_name | birth_date | city | faculty_id (FK) |
	| ------------- | ----- | ---------------- | -------- | ----------- | ---------- | ----------- | ---- | --------------- |
#### MICROSERVICE: db
- TYPE: database
- DESCRIPTION: Manages persistent storage of data.
- PORTS: 5432:5432








# CONTAINERS:

## CONTAINER_NAME: user

### DESCRIPTION: 
This container manages user-related operations including profile viewing, profile updates, password changes, and account deletion. It ensures secure handling of user information via JWT authentication and provides personalized data access for authenticated users.

### USER STORIES:
3,6,7

### PORTS: 
- 8001:8001

### PERSISTENCE EVALUATION
This microservice uses a PostgreSQL database for storing user data. When a user account is deleted, the corresponding row is removed and the primary key sequence is reset to maintain consistency. All data changes are committed to persistent storage.

### EXTERNAL SERVICES CONNECTIONS
- Connects to the **Auth** microservice to validate JWT tokens and identify the currently logged-in user.
- Connects to the PostgreSQL database for storing user information.

### MICROSERVICES:

#### MICROSERVICE: Users Management
- TYPE: backend
- DESCRIPTION: Handles operations related to user profile updates, password management, and account deletion. Accessible only to authenticated users via JWT tokens.
- PORTS: 8001

- TECHNOLOGICAL SPECIFICATION:
  - Framework: FastAPI  
  - Language: Python  
  - Authentication: JWT (via python-jose)  
  - Hashing: bcrypt via passlib  
  - Database: PostgreSQL via SQLAlchemy ORM

- SERVICE ARCHITECTURE: 
  The service follows a RESTful architecture. JWT tokens are issued upon successful login and must be included in the headers of protected requests. Middleware HTTPBearer handles token validation and extracts the current user.

- ENDPOINTS:

	| HTTP METHOD | URL              | Description                                                            | User Stories |
	| ----------- | ---------------- | ---------------------------------------------------------------------- | ------------ |
	| PUT         | /update          | Update current user profile excluding email, password, and faculty_id  | 7            |
	| PUT         | /update-password | Change current password after verifying old password                   | 7            |
	| DELETE      | /delete          | Delete the current user's account and reset ID sequence                | 3            |
  | GET         | /me              | Retrieves current user's personal details                              | 6            |

- DB STRUCTURE: 

	**_users_** :	
	| **_id_** (PK) | email | hashed_password | is_admin | first_name | last_name | birth_date | city | faculty_id (FK) |
	| ------------- | ----- | ---------------- | -------- | ----------- | ---------- | ----------- | ---- | --------------- |
#### MICROSERVICE: db
- TYPE: database
- DESCRIPTION: Manages persistent storage of data.
- PORTS: 5432:5432










# CONTAINERS:

## CONTAINER_NAME: faculty

### DESCRIPTION: 
This container manages the faculty-related logic of the system. It provides functionality for users to enroll in, view, and change their faculty.

### USER STORIES:
8,9
### PORTS: 
- 8002:8002

### PERSISTENCE EVALUATION
Faculty data is persisted in a PostgreSQL database. Each faculty is stored with a unique ID and name. Deleting a faculty cascades deletion to its related courses, while users referencing it are left with a null `faculty_id`.

### EXTERNAL SERVICES CONNECTIONS
- Communicates with the **Users Management** microservice to link a user to a selected faculty.
- Uses the shared **Auth** service to authorize admin access and identify authenticated users.
- Connects to the PostgreSQL database for storing user information.

### MICROSERVICES:

#### MICROSERVICE: Faculty Management
- TYPE: backend
- DESCRIPTION: Handles operations for retrieving faculties and allowing users to enroll in or change their faculty.
- PORTS: 8002

- TECHNOLOGICAL SPECIFICATION:
  - Framework: FastAPI  
  - Language: Python  
  - Authentication: JWT (via python-jose)  
  - Hashing: bcrypt via passlib  
  - Database: PostgreSQL via SQLAlchemy ORM

- SERVICE ARCHITECTURE: 
  The service follows a RESTful architecture. JWT tokens are issued upon successful login and must be included in the headers of protected requests. Middleware HTTPBearer handles token validation and extracts the current user. Faculty information is retrieved and modified directly through SQLAlchemy models

- ENDPOINTS:

	| HTTP METHOD | URL                            | Description                                                      | User Stories |
	| ----------- | ------------------------------ | ---------------------------------------------------------------- | ------------ |
	| GET         | /                              | Retrieve list of all faculties                                   | 9            |
	| POST        | /enroll/{faculty_id}           | Enroll current user in a faculty                                 | 8            |
	| GET         | /my-faculty                    | Get the faculty of the authenticated user                        | 8            |
	| PUT         | /change-faculty/{faculty_id}   | Change the faculty of the authenticated user                     | 8            |

- DB STRUCTURE:

	**_faculties_** :  
	| **_id_** (PK) | name       |
	| ------------- | ---------- |
#### MICROSERVICE: db
- TYPE: database
- DESCRIPTION: Manages persistent storage of data.
- PORTS: 5432:5432




# CONTAINERS:

## CONTAINER_NAME: course

### DESCRIPTION: 
This container manages all operations related to academic courses. It enables students to view available courses by faculty, access teacher information, submit and manage course reviews, and report inappropriate content.

### USER STORIES:
9,10,11,12,13,14,15,22

### PORTS: 
- 8003:8003

### PERSISTENCE EVALUATION
Course data is stored persistently in a PostgreSQL database. Courses are linked to faculties and optionally to teachers. Reviews and Notes are deleted along with the course. Sequence resets are handled manually to maintain database consistency.

### EXTERNAL SERVICES CONNECTIONS
- Interacts with **Faculties** and **Teachers** via foreign keys.
- Connects with **Users** to handle student reviews and report ownership.
- Collaborates with **Notes**, **Reviews**, and **Reports** through course IDs and user actions.

### MICROSERVICES:

#### MICROSERVICE: Course Management
- TYPE: backend
- DESCRIPTION: Handles course viewing and reviewing functionalities, teacher association, and report management. Enables students to review and report offensive/inappropriate content
- PORTS: 8003
- TECHNOLOGICAL SPECIFICATION:
  - Framework: FastAPI  
  - Language: Python  
  - Authentication: JWT (via python-jose)  
  - Hashing: bcrypt via passlib  
  - Database: PostgreSQL via SQLAlchemy ORM

- SERVICE ARCHITECTURE:
  The service follows a RESTful architecture. JWT tokens are issued upon successful login and must be included in the headers of protected requests. Middleware HTTPBearer handles token validation and extracts the current user. Cascade DB policy is applied, so whenever a course gets deleted, every review and note connected to it get deleted aswell.

- ENDPOINTS:

	| HTTP METHOD | URL                         | Description                                                        | User Stories |
	| ----------- | --------------------------- | ------------------------------------------------------------------ | ------------ |
	| GET         | /                           | Get all courses                                                    | 9            |
	| GET         | /faculty/{faculty_id}       | Get all courses of a specific faculty                              | 9            |
	| GET         | /{course_id}/teacher        | Get the teacher of a course                                        | 10           |
	| POST        | /{course_id}/reviews        | Add or update a review for a course                                | 11, 13       |
	| GET         | /{course_id}/reviews        | Get all reviews for a course                                       | 12           |
	| GET         | /{course_id}/ratings        | Get average ratings (clarity, feasibility, availability)           | 12           |
	| GET         | /my-reviews                 | Get all reviews submitted by the current user                      | 12           |
	| PUT         | /reviews/{review_id}        | Edit a review                                                      | 14, 15       |
	| DELETE      | /reviews/{review_id}        | Delete a review                                                    | 14           |
	| POST        | /reports                    | Submit a report (for a course review)                              | 22           |

- DB STRUCTURE:

	**_courses_** :  
	| **_id_** (PK) | name | faculty_id (FK) | teacher_id (FK, nullable) |
	| ------------- | ---- | ---------------- | -------------------------- |

	

	**_reviews_** :  
	| **_id_** (PK) | course_id (FK) | student_id (FK) | rating_clarity | rating_feasibility | rating_availability | comment | created_at |
	

	**_reports_** :  
	| **_id_report_** (PK) | id_review (FK, nullable) | id_note (FK, nullable) | id_user (FK) | reason  | datetime  |
	| -------------------- | ------------------------ | ---------------------- | ------------ | ------- | --------- |

#### MICROSERVICE: db
- TYPE: database
- DESCRIPTION: Manages persistent storage of data.
- PORTS: 5432:5432





# CONTAINERS:

## CONTAINER_NAME: notes

### DESCRIPTION: 
This container handles all operations related to course notes. Students can upload, view, download, rate, and manage notes. Notes are stored in MongoDB GridFS, and metadata is saved in PostgreSQL.

### USER STORIES:
16,17,18,19,20,21,22

### PORTS:
- 8004:8004

### PERSISTENCE EVALUATION
- Metadata for notes and ratings is stored in PostgreSQL.
- Actual note files are stored in MongoDB using GridFS.
- Notes and associated ratings or reports are deleted in cascade.

### EXTERNAL SERVICES CONNECTIONS
- Connected with **Users**, **Courses**, and **Reports** microservices.
- Uses JWT authentication to enforce ownership and access rights.
- Integrates both relational and NoSQL databases.

### MICROSERVICES:

#### MICROSERVICE: Notes Management
- TYPE: backend
- DESCRIPTION: Enables students to upload and rate course materials, and allows admins to monitor reported notes or reviews.
- PORTS: 8004

- TECHNOLOGICAL SPECIFICATION:
  - Framework: FastAPI  
  - Language: Python  
  - Authentication: JWT (via python-jose)  
  - Hashing: bcrypt via passlib  
  - Database: PostgreSQL via SQLAlchemy ORM and MongoDB with GridFS for file storage
  - File streaming and average rating calculations via SQL functions

- SERVICE ARCHITECTURE:
  The service follows a RESTful architecture. JWT tokens are issued upon successful login and must be included in the headers of protected requests. Middleware HTTPBearer handles token validation and extracts the current user. Cascade DB policy is applied, so whenever a note gets deleted, every note rating and note report connected to it get deleted aswell.

- ENDPOINTS:

	| HTTP METHOD | URL                                 | Description                                                       | User Stories |
	| ----------- | ----------------------------------- | ----------------------------------------------------------------- | ------------ |
	| GET         | /{course_id}                        | Get all notes of a course                                         | 16           |
	| POST        | /                                   | Upload a new note (file + description)                            | 18, 19       |
	| PUT         | /{note_id}                          | Update note description                                           | 20           |
	| DELETE      | /{note_id}                          | Delete a note and its file                                        | 20           |
	| GET         | /download/{note_id}                 | Download the note file                                            | 16           |
	| GET         | /usr/my-notes                       | View your uploaded notes                                          | 16           |
	| GET         | /{course_id}/notes-sorted           | Get notes of a course ordered by average rating                   | 17           |
	| POST        | /ratings                            | Rate a note                                                       | 21           |
	| PUT         | /ratings/{rating_id}                | Update a rating                                                   | 21           |
	| DELETE      | /ratings/{rating_id}                | Delete a rating                                                   | 21           |
	| GET         | /usr/my-reviews                     | Get all your ratings                                              | 21           |
	| GET         | /{course_id}/average-rating         | Get average note rating for a course                              | 17           |
	| GET         | /notes/{note_id}/reviews            | Get all ratings of a note                                         | 17           |
	| GET         | /notes/{note_id}/average-rating     | Get average rating of a note                                      | 17           |
	| GET         | /notes/{note_id}/reviews-sorted     | Get sorted ratings of a note                                      | 17           |
	| POST        | /reports                            | Report a note                                                     | 22           |
 

- DB STRUCTURE:

	**_notes_** :  
	| **_id_** (PK) | course_id (FK) | student_id (FK) | file_id (GridFS ID) | description | created_at |
	| ------------- | -------------- | ---------------- | ------------------- | ----------- | ----------- |

	**_note_ratings_** :  
	| **_id_** (PK) | note_id (FK) | student_id (FK) | rating | comment | created_at |
	| ------------- | ------------ | ---------------- | ------ | ------- | ----------- |

	**_reports_** :  
	| **_id_report_** (PK) | id_note (FK) | id_review (FK) | id_user (FK) | reason | datetime |
	| -------------------- | ------------ | -------------- | ------------ | ------ | -------- |

#### MICROSERVICE: db
- TYPE: database
- DESCRIPTION: Manages persistent storage of data.
- PORTS: 5432:5432

#### MICROSERVICE: mongodb
- TYPE: database
- DESCRIPTION: Manages persistent storage of uploaded documents related to notes.
- PORTS: 27017:27017




# CONTAINERS:

## CONTAINER_NAME: admin

### DESCRIPTION: 
This container provides privileged access for administrators to manage users, courses, faculties, teachers, notes, reviews, ratings, and reports. All endpoints are protected and accessible only to authenticated administrators.

### USER STORIES:
26,27,28,29,30,31

### PORTS:
- 8005:8005

### PERSISTENCE EVALUATION
The admin service performs write operations on persistent PostgreSQL storage, and handles GridFS cleanup for deleted files. Sequences are manually reset upon deletion to maintain integrity.

### EXTERNAL SERVICES CONNECTIONS
- Relies on **Auth** for JWT validation and admin identification.
- Directly manages data across tables used by Users, Courses, Teachers, Notes, Reviews, and Reports microservices.
- Uses MongoDB GridFS for file deletion (notes).

### MICROSERVICES:

#### MICROSERVICE: Admin Management
- TYPE: backend
- DESCRIPTION: Provides full administrative control over core platform entities, ensuring content quality and system maintenance.
- PORTS: 8005

- TECHNOLOGICAL SPECIFICATION:
  - Framework: FastAPI  
  - Language: Python  
  - Authentication: JWT (via python-jose)  
  - Hashing: bcrypt via passlib  
  - Database: PostgreSQL via SQLAlchemy ORM and MongoDB with GridFS for file storage

- SERVICE ARCHITECTURE:
  The service follows a RESTful architecture. JWT tokens are issued upon successful login and must be included in the headers of protected requests. Middleware HTTPBearer handles token validation and extracts the current user. MongoDB is used for cleanup: whenever a note gets deleted, MongoDB deletes the uploaded file related to the note.

- ENDPOINTS:

	| HTTP METHOD | URL                                 | Description                                              | User Stories |
	| ----------- | ----------------------------------- | -------------------------------------------------------- | ------------ |
	| GET         | /users/{user_id}                    | Get details of a specific user                           | 26           |
	| DELETE      | /users/{user_id}                    | Delete a user                                            | 26           |
	| GET         | /notes                              | Get all uploaded notes                                   | 28           |
	| DELETE      | /notes/{note_id}                    | Delete a note (file + DB entry)                          | 28           |
	| GET         | /reviews                            | Get all course reviews                                   | 27           |
	| DELETE      | /reviews/{review_id}                | Delete a review                                          | 27           |
	| GET         | /faculties                          | List all faculties                                       | 30           |
	| POST        | /faculties                          | Add a new faculty                                        | 30           |
	| DELETE      | /faculties/{faculty_id}             | Delete a faculty                                         | 30           |
	| GET         | /teachers                           | Get all teachers                                         | 31           |
	| GET         | /courses/{course_id}/teachers       | Get teachers of a specific course                        | 31           |
	| POST        | /teachers                           | Add a new teacher                                        | 31           |
	| DELETE      | /teachers/{teacher_id}              | Delete a teacher                                         | 31           |  
	| GET         | /courses                            | Get all courses                                          | 30           |
	| POST        | /courses                            | Add a new course                                         | 30           |
	| DELETE      | /courses/{course_id}                | Delete a course                                          | 30           |
	| GET         | /faculties/{faculty_id}/courses     | Get courses by faculty                                   | 30           |
	| GET         | /note-ratings                       | Get all ratings of notes                                 | 27           |
	| DELETE      | /note-ratings/{rating_id}           | Delete a note rating                                     | 27           |
	| GET         | /reports                            | Get all reported notes or reviews                        | 29           |
	| DELETE      | /reports/{report_id}                | Delete a specific report                                 | 29           |

- DB STRUCTURE:
(Admin Management uses existing tables from Users, Faculties, Courses, Teachers, Notes, Reviews, NoteRatings, and Reports. See respective microservices for table structures.)

#### MICROSERVICE: db
- TYPE: database
- DESCRIPTION: Manages persistent storage of data.
- PORTS: 5432:5432

#### MICROSERVICE: mongodb
- TYPE: database
- DESCRIPTION: Manages persistent storage of uploaded documents related to notes.
- PORTS: 27017:27017



