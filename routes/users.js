const express = require('express')
const router = express.Router()

const db = require('../db/dbConfig')


//1 == child
//2 == parents 
//3 == teacher
//4 == admin
//DONE


//get user info
//tested 
router.get('/info/:id', (req, res) => {
    const id = req.params.id

    db.execute('SELECT * FROM users WHERE id=? LIMIT 1;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'user does not exist'
        })

        return res.status(200).json(row[0])
    })
})

//get lis of approved child by parent
//done by shahd 
//tested
router.get('/children/:parentId', (req, res) => {
    const parentId = req.params.parentId

    //TO-DO get all users linked to parent from db
    db.execute('SELECT parent_linked_child.child_id,parent_linked_child.parent_id,users.first_name,users.last_name,users.email,users.country,users.avatar_id FROM parent_linked_child JOIN users WHERE parent_id=? AND approved=1 AND users.id = child_id ORDER BY parent_linked_child.created_at DESC ;;', [parentId], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'parent has no children'
        })

        return res.status(200).json(row)
    })

    // res.status(200).json({
    //     message: 'list of children',
    //     parentId
    //})
})

//edit user info
//done by shahd 
router.put('/info/:id', (req, res) => {
    const id = req.params.id

    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const school = req.body.school
    const country = req.body.country
    const avatarId = req.body.avatarId
    const gender = req.body.gender
    const userType = req.body.userType


    // if (!firstName || !lastName || !email || !country || !gender || !userType) {
    //     return res.status(406).json({
    //         message: "Please complete all require fields"
    //     })
    // }
    //TO-DO edit user data from db
    db.execute('UPDATE users SET first_name= ?,last_name=?,school=?,country=?,avatar_id=? WHERE id=?  LIMIT 1;', [firstName, lastName, school, country, avatarId, id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'user does not exist'
        })

        //return res.status(200).json(row[0])

        return res.status(200).json({
            info: {
                id,
                firstName,
                lastName,
                school,
                country,
                avatarId,
            }
        })
    })
    // res.send('TO DO')
})


//edit notification status
//done by shahd
router.put('/notification/:id', (req, res) => {
    const id = req.params.id

    //TO DO return not allowed if no token

    const notificationToken = req.body.notificationToken //TO CHECK if we can get it agien and send it
    const feedbackNotification = req.body.feedbackNotification || 0
    const requestRespondNotification = req.body.requestRespondNotification || 0
    const requestNotification = req.body.requestNotification || 0


    //TO-DO edit user data to allow notification from db
    db.execute('UPDATE users SET notification_token=?,feedback_notification=?,request_respond_notification=?, request_notification=? WHERE id=?  LIMIT 1;', [notificationToken, feedbackNotification, requestRespondNotification, requestNotification, id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'user does not exist'
        })

        //return res.status(200).json(row[0])

        return res.status(200).json({
            info: {
                notificationToken,
                feedbackNotification,
                requestRespondNotification,
                requestNotification,

            }
        })
    })
    // res.send('TO DO')
})

//DONE
//save user data
router.post('/signup', (req, res) => {
    //firstName, lastName, email, school, country, points, avatarId, gender, userType, isItFirstTime, createdAt
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const school = req.body.school || null
    const country = req.body.country
    const userType = req.body.userType
    const notificationToken = req.body.notificationToken || null
    const feedbackNotification = req.body.feedbackNotification || 0
    const requestRespondNotification = req.body.requestRespondNotification || 0
    const requestNotification = req.body.requestNotification || 0
    const createdAt = new Date().toLocaleString()

    if (!firstName || !lastName || !email || !country || !userType) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

    //TO DO save data to db
    db.execute('INSERT INTO users(first_name, last_name, email, school, country, user_type, notification_token, feedback_notification, request_respond_notification, request_notification) VALUES(?,?,?,?,?,?,?,?,?,?);', [firstName, lastName, email, school, country, userType, notificationToken, feedbackNotification, requestRespondNotification, requestNotification], (err, result) => {
        if (err) return res.status(500).json({
            message: err
        })

        return res.status(200).json({
            message: 'success',
            info: {
                id: result.insertId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                school: school,
                country: country,
                points: 0,
                avatarId: 1,
                userType: userType,
                createdAt: createdAt
            }
        })

    })


})

//leaderboard
//done by shahd 
//tested
router.get('/leaderboard/:id', (req, res) => {
    //To DO get top 10 childern points from db
    db.execute('SELECT first_name, last_name,country,points,avatar_id FROM users WHERE user_type=1 ORDER BY points DESC LIMIT 10;', (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        return res.status(200).json(row)
    })
    // res.status(200).send('ok')
})

//user trophies 
//done by shahd 
//tested
router.get('/trophy/:id', (req, res) => { //as an array in the user table 
    const id = req.params.id
    //To DO get list of cild tophies as array   

    db.execute('SELECT * FROM trophy WHERE user_id=? ;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'there are no trophy'
        })

        return res.status(200).json(row)
    })
})



//REQUESTS

//DONE
//send requist to join class
router.post('/request/:id', (req, res) => {
    const id = req.params.id //parentId

    const childId = req.body.childId //child id
    const parentId = id
    const approved = false

    if (!childId) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

    db.execute('INSERT INTO parent_linked_child (child_id,parent_id) VALUES(?,?);', [childId, parentId], (err, result) => {
        if (err) return res.status(500).json({
            message: err
        })

        return res.status(200).json({
            message: 'parent request sent',
            id: result.insertId
        })

    })
})

//get all request not approved in observer side
//done by shahd 
//tested
router.get('/request/:id', (req, res) => {
    const id = req.params.id //observerId

    //TO DO get all not apprved join requests for the observer
    db.execute('SELECT parent_linked_child.child_id,parent_linked_child.parent_id,users.first_name,users.last_name,users.email,users.country,users.avatar_id FROM parent_linked_child JOIN users WHERE parent_id=? AND approved=0 AND users.id = child_id ORDER BY parent_linked_child.created_at DESC ;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })

        if (row < 1) return res.status(404).json({
            message: 'parent has no children'
        })

        return res.status(200).json(row)
    })
    // res.status(200).json({
    //     message: 'list of requests',
    //     id
    // })
})

//aprove a request
//done by shahd 
router.put('/request/:requestId', (req, res) => {
    const requestId = req.params.requestId

    const approved = req.body.approved //TRUE or FALSE

    //check data
    if (approved == undefined) {
        return res.status(406).json({
            message: "Please complete all require fields"
        })
    }

    //approved
    if (approved) {
        //TO DO update db to be approved
        //test 
        db.execute('UPDATE parent_linked_child SET approved=1 WHERE id=? ;', [requestId], (err, row) => {
            if (err) return res.status(500).json({
                message: err
            })

            if (row < 1) return res.status(404).json({
                message: 'reqest does not exist'
            })

            return res.status(200).json(row)
        })
        //end test 
        // return res.status(200).json({
        //     message: 'request approved',
        //     requestId
        // })
    }

    //not approved
    if (!approved) {
        //TO DO delete request
        db.execute('DELETE FROM parent_linked_child WHERE id=? ;', [requestId], (err, row) => {
            if (err) return res.status(500).json({
                message: err
            })
            return res.status(200).json(row)
        })

        // return res.status(200).json({
        //     message: 'request deleted',
        //     requestId
        // })
    }

})


//----------------------------------------------------added by shahd

//done by shahd
//delete user 
router.delete("/delete/:id", (req, res) => {

    const id = req.params.id

    db.execute('DELETE FROM users WHERE id=? ;', [id], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })
        return res.status(200).json(row)
    })

})

//done by shahd
//remove from parents 
router.delete("/removechild/:childId", (req, res) => {

    const childId = req.params.childId
    const userId = req.body.userId

    db.execute('DELETE FROM parent_linked_child WHERE  child_id=? AND parent_id=?;', [childId, userId], (err, row) => {
        if (err) return res.status(500).json({
            message: err
        })
        return res.status(200).json(row)
    })

})


module.exports = router