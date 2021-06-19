# Identiverse Privacy Demo

Use this application to configure your first OIDC application for client authentication. The application is built with Node.js and the [Verify SDK](https://www.npmjs.com/package/ibm-verify-sdk). All UI assets can be found under [views](/views) and [public](/public). All views are written using vanilla HTML and JS and templated using Handlebars.

In this app, you can do the following -

1. Authenticating the client using IBM Security Verify
2. Logging out of the client, which revokes the tokens
3. Viewing the authenticated user's profile by unpacking the id_token

## Pre-requisites

1. Install Node and Git on your machine
2. [Create a tenant on IBM Security Verify](https://docs.verify.ibm.com/verify/docs/signing-up-for-a-free-trial)
3. Clone this repo to your machine

## Setup

The demo introduces the use of the Verify Developer Portal to create the application as a developer, rather than create the application as an administrator.

### Admin: Create user with developer role

The developer portal is only accessible by a user who belongs to the Developer group.

1. Login to IBM Security Verify Admin Console (https://your-tenant.verify.ibm.com/ui/admin) using your admin credentials.
2. Go to `Users and Groups`
3. If you already have a user account created, switch to the Groups tab
4. Edit `Developer` group
5. Add your user to the members

### Admin: Create the developer portal application on IBM Security Verify

1. Login to IBM Security Verify Admin Console (https://your-tenant.verify.ibm.com/ui/admin) using your admin credentials.
2. Go to Applications and click Add
3. Search for and select "IBM Security Verify Developer Portal"
4. Configure the OIDC grants that should be allowed. For this demo app, ensure that authorization code is selected.
5. Save

### Developer: Access the developer portal

1. Login as the developer. If this is the same as the admin, you may need to re-login for group membership updates to take effect.
2. You should see the Developer Portal application on the launchpad.
3. Launch the developer portal

### Developer: Add a new application

1. Click on Add on the developer portal
2. Choose "Authorization Code" as the grant type. Fill in the other fields as desired.
3. You should now see a code snippet. Note the `client_id` and `client_secret`.
4. Open the cloned Github repository on your machine
5. Copy the `dotenv` file and name it `.env`
6. Enter `TENANT_URL` as your tenant hostname (your-tenant.verify.ibm.com)
7. Enter `CLIENT_ID` and `CLIENT_SECRET` based on step 3
8. Save the file

### Configure for self-registration

1. Login to IBM Security Verify Admin Console
2. In the navigation menu, click on "User Flows"
3. Create a new registration flow and publish
4. Set `USER_REGISTRATION_LINK` in the .env file to the static link to the flow

### Run the application

1. Install node dependencies

    ```bash
    npm install
    ```

2. Run the application. You should see `Server started and listening on port 3000` after executing the command below.

    ```bash
    npm start
    ```

3. Open the browser and go to http://localhost:3000 and you should be able to use the application