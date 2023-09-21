## Run The Project

    - npm install

    - npm run dev


## API Endpoints
    - base ulr - http://localhost:3000/api/v1


        -   Sample User Login
            -   "email_id": "demouser@demo.com",
            -   "password": "demo123"


    - User - Endpoints
        - GET       /public/signup
                    - payload:
                        {
                            "user_name": "Demo User",
                            "email_id": "demouser@demo.com",
                            "password": "demo123"
                        }

        - GET       /public/login
                    - payload:   
                        {
                            "email_id": "demouser@demo.com",
                            "password": "demo123"
                        }
                    
        - GET       /user/list
        - PUT       /user/update
        - GET       /user/view/{id}
        - DELETE    /user/delete/{id}


    - HR Profile - Endpoints
        - GET       /hrprofile/list
        - GET       /hrprofile/detail/{id}
        - POST      /hrprofile/add
                    - payload:   
                        {
                            "hr_profile_id": "1",
                            "contact_id": "1",
                            "first_name": "Firstname",
                            "last_name": "lastname",
                            "middle_name": "",
                            "position": "Junior Developer",
                            "gender": "M",
                            "date_of_birth": "",
                            "photo_url": "",
                            "skill": "Leadership, Problem Solving",
                            "resume_url": null,
                            "user_id": 1
                        }

        - PUT       /hrprofile/update
        - GET       /hrprofile/view/{id}
        - DELETE    /hrprofile/delete/{id}

    
    - Contact - Endpoints
        - GET       /contact/list
        - POST      /contact/add
                    - payload:   
                        {
                            "contact_id": "1",
                            "email_id": "test@test.com",
                            "alternate_email_id": null,
                            "mobile": "9874512300",
                            "alternate_mobile": "",
                            "phone": "",
                            "office_phone": "",
                            "website": "http://test.com",
                            "facebook_id": "",
                            "twitter_id": "",
                            "linkedin_id": "",
                            "skype_id": ""
                        }

        - PUT       /contact/update
        - GET       /contact/view/{id}
        - DELETE    /contact/delete/{id}


    - Address - Endpoints
        - GET       /address/list
        - POST      /address/add
                    - payload:   
                        {
                            "address_id": 1,
                            "contact_id": 1,
                            "buiding_number": "18/21",
                            "street_name": "North Street",
                            "city": "Chennai",
                            "state": "Tamil Nadu",
                            "country_id": null,
                            "postal_code": ""
                        }

        - PUT       /address/update
        - GET       /address/view/{id}
        - DELETE    /address/delete/{id}


    - Education - Endpoints
        - GET       /education/list
        - POST      /education/add
                    - payload:   
                        {
                            "education_id": "1",
                            "hr_profile_id": "1",
                            "degree": "BE",
                            "major": "Computer Science Engineering",
                            "university": "NIT",
                            "location": "",
                            "start_date": "",
                            "end_date": ""
                        }

        - PUT       /education/update
        - GET       /education/view/{id}
        - DELETE    /education/delete/{id}


    - Work Experience - Endpoints
        - GET       /workexperience/list
        - POST      /workexperience/add
                    - payload:   
                        {
                            "work_experience_id": "1",
                            "hr_profile_id": "1",
                            "short_name": "Test Info Tech",
                            "description": "TIT"
                        }
                    
        - PUT       /workexperience/update
        - GET       /workexperience/view/{id}
        - DELETE    /workexperience/delete/{id}

    
    - Project - Endpoints
        - GET       /project/list
        - POST      /project/add
                    - payload:   
                        {
                            "project_id": 1,
                            "hr_profile_id": 1,
                            "title": "Project Management",
                            "start_date": "2019-08-15",
                            "end_date": "2022-08-15",
                            "client": "Application Users",
                            "technology": "Java, Javascript, Vue Js, MySQL",
                            "description": "Created a Project Management Application",
                            "location": "Chennai"
                        }
                    
        - PUT       /project/update
        - GET       /project/view/{id}
        - DELETE    /project/delete/{id}