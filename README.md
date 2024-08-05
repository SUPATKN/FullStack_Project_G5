# FullStack_Project_G5

# Containerization
- frontend & database
    - `docker compose --env-file ./.env.test up -d --force-recreate --build`
- backend
    - `docker compose -f docker-compose-backend.yml --env-file ./.env.test up -d --force-recreate --build`