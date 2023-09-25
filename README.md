## Run The Project

    - npm install

    - npm run dev


## API Endpoints
    - base ulr - http://localhost:3000/api/v1


        -   Sample User Login
            -   "email_id": "demouser@demo.com",
            -   "password": "demo123"


### User - Endpoints
    - POST       /user/signup
                - payload:
                    {
                        "user_name": "Demo User",
                        "email_id": "demouser@demo.com",
                        "password": "demo123"
                    }

    - POST       /user/login
                - payload:   
                    {
                        "email_id": "demouser@demo.com",
                        "password": "demo123"
                    }
                
    - GET       /user/list
    - PUT       /user/update
    - GET       /user/view/{id}
    - DELETE    /user/delete/{id}


### HR Profile - Endpoints
    - GET       /hrprofile/list
    - POST      /hrprofile/add
                - payload:   
                    {
                        "hr_profile_id": "1",
                        "hr_profile_type_id": null,
                        "first_name": "FirstName",
                        "last_name": "LastName",
                        "middle_name": "",
                        "position": "Senior Developer",
                        "email_id": "demouser@demo.com",
                        "alternate_email_id": null,
                        "mobile": "9874512300",
                        "alternate_mobile": "",
                        "phone": "",
                        "office_phone": "",
                        "gender": "M",
                        "date_of_birth": "",
                        "photo_url": "",
                        "website": "http://test.com",
                        "facebook_id": "",
                        "twitter_id": "",
                        "linkedin_id": "",
                        "skype_id": "",
                        "buiding_number": "18/21",
                        "street_name": "North Street",
                        "city": "Chennai",
                        "state": "Tamil Nadu",
                        "country": "India",
                        "postal_code": "",
                        "status_id": 1,
                        "resume_url": null,
                        "user_id": 1,
                        "active": 1,
                        "created_by_id": null,
                        "created_dt": null,
                        "last_updated_dt": null,
                        "work_experience": [
                            {
                                "company": "Test IT",
                                "location": "Chennai",
                                "start_date": "2019-08-15",
                                "end_date": null,
                                "description": "TIT"
                            }
                        ],
                        "project": [
                            {
                                "title": "Project Management",
                                "start_date": "2019-08-15",
                                "end_date": "2022-08-15",
                                "client": "Application Users",
                                "technology": "Java, Javascript, Vue Js, MySQL",
                                "description": "Created a Project Management Application",
                                "location": "Chennai"
                            }
                        ],
                        "education": [
                            {
                                "degree": "BE",
                                "major": "Computer Science Engineering",
                                "university": "VIT",
                                "location": "Chennai",
                                "start_date": "",
                                "end_date": ""
                            }
                        ],
                        "skills": ["Java", "JavaScript"]
                    }

    - PUT       /hrprofile/update
    - GET       /hrprofile/view/{id}
    - DELETE    /hrprofile/delete/{id}