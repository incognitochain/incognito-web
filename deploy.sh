#!/bin/sh
V=$(date "+%Y%m%d_%H%M%S")
BUILDER_IMAGE="$NAME_SPACE-$REPO_NAME-builder"
NAME_IMAGE="$NAME_SPACE-$REPO_NAME"
CWD=$(pwd)
echo $GOOGLE_CLOUD > ./cash-prototype-4a2c9d4ce248.json
echo $CRT > ./incognito.org.crt
echo $CSR > ./incognito.org.csr
echo $PASS > ./incognito.org.pass
echo $KEY > ./incognito.org.key
gcloud auth activate-service-account --key-file ./cash-prototype-4a2c9d4ce248.json
gcloud container clusters get-credentials incognito-live-cluster --zone us-west1-a --project cash-prototype
docker login -u oauth2accesstoken -p "$(gcloud auth print-access-token)" https://gcr.io
builNumber=$V
curl -L https://raw.githubusercontent.com/incognitochain/incognito-chain/master/bin/bridge/mainnet-run.sh -o run.sh
docker build -t gcr.io/$PROJECT/$NAME_IMAGE:$builNumber .
result=$(echo $?)
if [ $result != 0 ] ; then
  echo "Failed docker build -t gcr.io/$PROJECT/$NAME_IMAGE:$builNumber"
  curl -X POST -H 'Content-type: application/json' --data '{"text":"Deploy failed incognito-landing-page (docker build)"}' $SLACK_HOOK
  exit 1;
else
  echo "Done: docker build -t gcr.io/$PROJECT/$NAME_IMAGE:$builNumber";
fi
docker tag gcr.io/$PROJECT/$NAME_IMAGE:$builNumber gcr.io/$PROJECT/$NAME_IMAGE:$builNumber
gcloud docker -- push gcr.io/$PROJECT/$NAME_IMAGE:$builNumber
kubectl set image deployment/incognito-landingpage incognito-landingpage=gcr.io/$PROJECT/$NAME_IMAGE:$builNumber
result=$(echo $?)
if [ $result != 0 ] ; then
  echo "Failed docker build -t gcr.io/$PROJECT/$NAME_IMAGE:$builNumber"
  curl -X POST -H 'Content-type: application/json' --data '{"text":"Deploy failed incognito-landing-page (kubectl)"}' $SLACK_HOOK
  exit 1;
else
  echo "Done: docker build -t gcr.io/$PROJECT/$NAME_IMAGE:$builNumber";
  curl -X POST -H 'Content-type: application/json' --data '{"text":"Deploy successfully incognito-landing-page"}' $SLACK_HOOK
fi
