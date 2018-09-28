var express = require('express');
var router = express.Router();
const sqlite = require('sqlite3').verbose();
var models = require('../models');
const auth = require("../config/auth");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//module.exports = router;

router.get("/signup", function (req, res, next) {
  res.render('signup')
});

router.post('/signup', function (req, res, next) {
  const hashedPassword = auth.hashPassword(req.body.password);
  models.users
    .findOne({
      where: {
        Username: req.body.username
      }
    })
    .then(user => {
      if (user) {
        res.send('this user already exists');
      } else {
        models.users
          .create({
            FirstName: req.body.firstName,
            LastName: req.body.lastName,
            Email: req.body.email,
            Username: req.body.username,
            Password: hashedPassword
          })
          .then(createdUser => {
            const isMatch = createdUser.comparePassword(req.body.password);

            if (isMatch) {
              const userId = createdUser.UserId;
              console.log(userId);
              const token = auth.signUser(createdUser);
              res.cookie('jwt', token);
              res.redirect('profile/' + userId);
            } else {
              console.error('not a match');
            }
          });
      }
    });
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  const hashedPassword = auth.hashPassword(req.body.password);
  models.users.findOne({
    where: {
      Username: req.body.username
    }
  }).then(user => {
    const isMatch = user.comparePassword(req.body.password)
    if (user.Deleted) {
      res.redirect('login')
    }
    if (!user) {
      return res.status(401).json({
        message: "Login Failed"
      });
    }
    if (isMatch) {
      const userId = user.UserId
      const token = auth.signUser(user);
      res.cookie('jwt', token);
      if (user.Admin) {
        res.redirect('admin')
      } else {
        res.redirect('profile/' + userId)
      }

    } else {
      console.log(req.body.password);
      res.redirect('login')
    }

  });
});

router.get('/profile/:id', auth.verifyUser, function (req, res, next) {
  if (req.params.id !== String(req.user.UserId)) {
    res.send('This is not your profile')
  } else {
    models.posts.findAll({
      where: {
        [Op.and]: {
          Deleted: null,
          UserId: req.user.UserId
        }
      },
      include: [models.users]
    }).then(post => {

      res.render('profile', {
        FirstName: req.user.FirstName,
        LastName: req.user.LastName,
        Email: req.user.Email,
        UserId: req.user.UserId,
        Username: req.user.Username,
        posts: post
      });
    })

  }
});

router.post('/profile/:id', function (req, res) {
  const userId = parseInt(req.params.id);
  // console.log(req.body.postBody)
  models.posts.findOrCreate({
    where: {
      PostTitle: req.body.postTitle,
      PostBody: req.body.postBody,
      UserId: req.params.id
    }
  }).then(post => {
    // console.log(post)
    res.redirect(req.originalUrl)
  })
})

router.get('/admin', function (req, res) {
  models.users.findAll({
    where: {
      [Op.and]: {
        Deleted: null,
        Admin: false
      }
    },
  }).then(users => {
    res.render('adminProfile', {
      users: users
    })
  })

})

router.get('/admin/editUser/:id', function (req, res) {
  let userId = parseInt(req.params.id);
  models.users
    .find({
      where: {
        UserId: userId
      }
    })
    .then(user => {
      res.render('editUser', {
        UserId: user.UserId,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Username: user.Username,
        Email: user.Email,
        createdAt: user.createdAt
      });
    });
})


router.get('/logout', function (req, res) {
  res.cookie('jwt', null);
  res.redirect('/users/login');
});

router.get("/editPost/:id", function (req, res, next) {
  models.posts
    .findOne({
      where: {
        PostId: req.params.id
      }
    })
    .then(post => {
      res.render('editPost', post.dataValues);
    });
});

router.put('/editPost/:id', function(req, res) {
  models.posts.update({
      PostTitle: req.body.postTitle,
      PostBody: req.body.postBody
    }, {
    where: {
      PostId:  (parseInt(req.params.id) || 0)
    }
  })
  .then(() => {
    res.end();
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(500);
  });
});

router.delete('/editPost/:id/delete', function(req, res) {
  models.posts.destroy({
    where: {
      PostId:  (parseInt(req.params.id) || 0)
    }
  })
  .then(() => {
    res.end();
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(500);
  });
});





module.exports = router;