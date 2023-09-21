## Run The Project

    - npm run dev


## API Endpoints
    - base ulr - http://localhost:3000/api/v1
        - Example URL: http://localhost:3000/api/v1/hrprofile/list
    
        -   Default User Details
            -   "user_name": "Demo User",
            -   "password": "demo123", 
            -   "email_id": "demouser@demo.com",

    - User - Endpoints
        - GET       /public/login
        - GET       /public/signup

        - GET       /user/list
        - PUT       /user/update
        - GET       /user/view/{id}
        - DELETE    /user/delete/{id}


    - HR Profile - Endpoints
        - GET       /hrprofile/list
        - GET       /hrprofile/detail/{id}
        - POST      /hrprofile/add
        - PUT       /hrprofile/update
        - GET       /hrprofile/view/{id}
        - DELETE    /hrprofile/delete/{id}

    
    - Contact - Endpoints
        - GET       /contact/list
        - POST      /contact/add
        - PUT       /contact/update
        - GET       /contact/view/{id}
        - DELETE    /contact/delete/{id}


    - Address - Endpoints
        - GET       /address/list
        - POST      /address/add
        - PUT       /address/update
        - GET       /address/view/{id}
        - DELETE    /address/delete/{id}


    - Education - Endpoints
        - GET       /education/list
        - POST      /education/add
        - PUT       /education/update
        - GET       /education/view/{id}
        - DELETE    /education/delete/{id}


    - Work Experience - Endpoints
        - GET       /workexperience/list
        - POST      /workexperience/add
        - PUT       /workexperience/update
        - GET       /workexperience/view/{id}
        - DELETE    /workexperience/delete/{id}

    
    - Project - Endpoints
        - GET       /project/list
        - POST      /project/add
        - PUT       /project/update
        - GET       /project/view/{id}
        - DELETE    /project/delete/{id}