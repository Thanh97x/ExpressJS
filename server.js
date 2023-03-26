const express = require('express');
const app = express();
const router = express.Router();
const db = require('./database');
var cors = require('cors')

app.use(express.json());

router.get('/posts', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM posts WHERE deleted_at IS NULL');
        //`SELECT * FROM posts WHERE deleted_at IS NULL`,
        return res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).send('lỗi máy chủ');
    }
});


//tao moi
router.post('/posts', async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        res.status(500).send("title hoặc content không có giá trị")
        //errr
        /**
         * title = 1
         * title = 'asdasdas'
         * title = false
         * title = undefined
         * title = null
         */
    } else {
        try {
            const query = {
                text: `INSERT INTO posts (created_at, updated_at, title, content) 
          VALUES (NOW(), NOW(), $1, $2) RETURNING *`,
                values: [title, content]
            };
            const result = await db.query(query);
            res.status(200).json(result.rows);
        } catch (err) {
            console.error(err);
        }
    }
})

//update
router.put('/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(500).send("title hoặc content không có giá trị")

        } else {
            const { rows } = await db.query(
                'SELECT id FROM posts WHERE id = $1',
                [id]
            );
            if (rows.length === 0) {
                res.status(404).json({
                    error: 'Không tìm thấy bài viết với id tương ứng',
                });
            } else {
                const result = await db.query(
                    'UPDATE posts SET updated_at = NOW(), title = $1, content = $2 WHERE id = $3',
                    [title, content, id]
                );
                res.status(200).json('thành công');
            }
        }
    } catch (err) {
        res.send({
            data: null,
            error: err.message,
        });
    }

})

//delete
router.delete('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(500).send("Id không có giá trị")
        } else {
            const { rows } = await db.query(
                'SELECT id FROM posts WHERE id = $1',
                [id]
            );
            if (rows.length === 0) {
                res.status(404).json({
                    error: 'Không tìm thấy bài viết với id tương ứng',
                });
            } else {
                const result = await db.query(
                    `UPDATE posts SET deleted_at = NOW() WHERE id = ${id} RETURNING *`,
                    //`UPDATE posts SET deleted_at = NOW() WHERE id = ${id} RETURNING *`
                );

                res.status(200).json('thành công');
            }
        }
    } catch (err) {
        console.error(err);
        res.send({
            data: null,
            error: err.message,
        });
    }

})

//get 
router.get('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.send({
                data: null,
                error: "Id không tồn tại.",
            })
        } else {

            const { rows } = await db.query(
                'SELECT id FROM posts WHERE id = $1',
                [id]
            );
            if (rows.length === 0) {
                return res.send({

                    data: null,
                    error: "lỗi Id .",
                })
            } else {
                const result = await db.query('SELECT * FROM posts  WHERE id = $1', [id]);
                res.json(result.rows);
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('lỗi máy chủ');
    }
});

router.get('/', async (req, res) => {
    res.send('Home')
})



app.use(cors());

app.use("/", router)

app.listen(4000, () => {
    console.log(`Example app listening on port 4000`)
})