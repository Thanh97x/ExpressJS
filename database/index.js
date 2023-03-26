const { request, router } = require("express");
const { Client } = require("pg");

let client;
(async function () {
    try {
        client = new Client({
            connectionString: "postgresql://postgres:123123@localhost:5432/posts",
            // ssl: {
            //     rejectUnauthorized: false,
            // },
        });
        await client.connect();
        // console.log('client', client)
        console.log('Connected to database');

        //tao bang
        await client.query(`CREATE SEQUENCE IF NOT EXISTS posts_id_seq;`);
        await client.query(
            `
                    CREATE TABLE IF NOT EXISTS "public"."posts" (
                        "id" int4 NOT NULL DEFAULT nextval('posts_id_seq' ::regclass),
                        "created_at" timestamptz NOT NULL,
                        "updated_at" timestamptz NOT NULL,
                        "deleted_at" timestamptz,
                        "title" varchar,
                        "content" text,
                        PRIMARY KEY ("id")
                        );
                `
        );

        // createPost POST
        (async function createPost(title, content) {
            const query = {
                text: `INSERT INTO posts (created_at, updated_at, title, content) 
      VALUES (NOW(), NOW(), $1, $2) RETURNING *`,
                values: [title, content]
            };
            const result = await client.query(query);
            return result.rows;
        })()


        //lay danh sách bài viết
        const result = await client.query('SELECT *FROM posts');
        return result.rows;

    } catch (err) {
        console.error(err);
    }
})()


module.exports = client;