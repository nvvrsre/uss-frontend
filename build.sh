docker build -t nvvrsre/usindus-frontend .
docker push nvvrsre/usindus-frontend
kubectl rollout restart deployment/frontend
