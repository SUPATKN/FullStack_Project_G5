This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

docker compose -f docker-compose-backend.yml --env-file ./.env.test up -d --force-recreate --build
docker compose --env-file ./.env.test up -d --force-recreate --build
npm run db:generate
เปิด cmd
    docker exec -it pf-img-db bash
    psql -U postgres -d mydb
        REVOKE CONNECT ON DATABASE mydb FROM public;
        REVOKE ALL ON SCHEMA public FROM PUBLIC;
        CREATE USER appuser WITH PASSWORD '1234';
        CREATE SCHEMA drizzle;
        GRANT ALL ON DATABASE mydb TO appuser;
        GRANT ALL ON SCHEMA public TO appuser;
        GRANT ALL ON SCHEMA drizzle TO appuser;
npm run db:push
npm run db:reset