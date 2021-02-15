const express = require('express')

const db = require('../db/dbConfig')

const router = express.Router()


router.post('/', (req, res) => {
    try {
        if (!req.files) {
            return res.status(406).json({
                message: "No File attached"
            })
        } else {
            const file = req.files.file;
            const fileType = file.mimetype.split('/')[0];
            const newFileName = Date.now() + file.name;

            console.log(req.body)
            // check file type
            if (fileType !== 'video' && fileType !== "image") {
                return res.status(403).json({
                    message: "File attached is not accepted",
                    type: file.mimetype.split('/')[0]
                })
            }

            //to db
            const mediaUrl = '/uploads/' + newFileName;
            const userId = req.body.userId
            const projectId = req.body.projectId
            const mediaType = fileType
            const isSolution = req.body.isSolution
            const solutionId = req.body.solutionId || null

            if (!userId || !projectId || !isSolution) {
                return res.status(406).json({
                    message: "Please complete all require fields"
                })
            }

            file.mv('./public/uploads/' + newFileName);

            db.execute('INSERT INTO media (media_url, user_id, project_id, media_type, is_solution, solution_id) VALUES(?, ?, ? , ? , ? , ?)', [mediaUrl, userId, projectId, mediaType, isSolution, solutionId], (err, result) => {
                if (err) return res.status(500).json({
                    message: err
                })
                return res.status(200).json({
                    message: 'success',
                    info: {
                        id: result.insertId,
                        mediaUrl,
                        userId,
                        projectId,
                        mediaType,
                        isSolution,
                        solutionId,
                    },
                    fileData: {
                        name: file.name,
                        mimetype: file.mimetype,
                        size: file.size
                    }
                })
            })
        }
    } catch (err) {
        res.status(500).send(err);
    }
})

router.get('/solution/:id', (req, res) => {
    const id = req.params.id

    db.execute('SELECT * FROM media WHERE solution_id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there are no media'
        })

        return res.status(200).json(row)
    })
})


router.get('/project/:id', (req, res) => {
    const id = req.params.id

    db.execute('SELECT * FROM media WHERE project_id = ? AND is_solution = 0', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there are no media'
        })

        return res.status(200).json(row)
    })
})

module.exports = router