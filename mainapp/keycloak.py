import requests
import config.settings
import json
def create_keycloak_record(email, password, first_name, last_name):
    # Get token first
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    TOKEN_URL = config.settings.TOKEN_URL # 'http://20.55.232.109:8080/auth/realms/yettihealthcare/protocol/openid-connect/token'
    NEWUSER_URL = config.settings.NEWUSER_URL #'http://20.55.232.109:8080/auth/admin/realms/yettihealthcare/users'

    param = {"grant_type":"client_credentials",
             "client_id": config.settings.CLIENT_ID,
             "client_secret": config.settings.SECRET}

    r = requests.post(TOKEN_URL, data=param, headers=headers)
    print("responce access token ",r)
    if r.status_code == 200:
        token_resp = r.json()
        print("responce access token ",token_resp)
        bearer_token = token_resp["access_token"]
        print("bearer_token",bearer_token)

        #Send request to create user
        user_payload = {"enabled":True ,"emailVerified" : True, "username":email,"email":email,"firstName":first_name,
                        "lastName":last_name,"credentials":[{"type":"password","value":password,"temporary":False}]}
        
        headers = {
            'Authorization': f'Bearer {bearer_token}',
            'Content-Type': 'application/json'
        }

        response = requests.post(
            NEWUSER_URL,
            data=json.dumps(user_payload),
            headers=headers,
            timeout=30
        )

        if response.status_code == 201:
            return True
        else:
            print(response.content)
    else:
        print(r.content)
    return False
