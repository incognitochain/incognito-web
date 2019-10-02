#!/bin/sh
​
V=$(date "+%Y%m%d_%H%M%S")
BUILDER_IMAGE="$NAME_SPACE-$REPO_NAME-builder"
NAME_IMAGE="$NAME_SPACE-$REPO_NAME"
CWD=$(pwd)

echo "{
  \"type\": \"$TYPE\",
  \"project_id\": \"$PROJECT_ID\",
  \"private_key_id\": \"$PRIVATE_KEY_ID\",
  \"private_key\": \"$PRIVATE_KEY\",
  \"client_email\": \"$CLIENT_EMAIL\",
  \"client_id\": \"$CLIENT_ID\",
  \"auth_uri\": \"$AUTH_URL\",
  \"token_uri\": \"$TOKEN_URL\",
  \"auth_provider_x509_cert_url\": \"$AUTH_PROVIDER_X509_CERT_URL\",
  \"client_x509_cert_url\": \"$CLIENT_X509_CERT_URL\"
}" > ./cash-prototype-4a2c9d4ce248.json

echo $CRT > ./incognito.org.crt
echo $CSR > ./incognito.org.csr
echo $PASS > ./incognito.org.pass
echo $KEY > ./incognito.org.key
gcloud auth activate-service-account --key-file ./cash-prototype-4a2c9d4ce248.json
gcloud container clusters get-credentials incognito-live-cluster --zone us-west1-a --project cash-prototype
docker login -u oauth2accesstoken -p "$(gcloud auth print-access-token)" https://gcr.io
​
builNumber=$V

curl -LO https://raw.githubusercontent.com/incognitochain/incognito-chain/master/bin/bridge/run.sh

docker build -t gcr.io/$PROJECT/$NAME_IMAGE:$builNumber .
docker tag gcr.io/$PROJECT/$NAME_IMAGE:$builNumber gcr.io/$PROJECT/$NAME_IMAGE:$builNumber
gcloud docker -- push gcr.io/$PROJECT/$NAME_IMAGE:$builNumber
kubectl set image deployment/incognito-landingpage incognito-landingpage=gcr.io/$PROJECT/$NAME_IMAGE:$builNumber
​