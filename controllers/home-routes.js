const router = require('express').Router();
const sequelize = require('../config/connection');
const axios = require("axios");
const Handlebars = require('handlebars');
const {
    User,
    Post,
    Comment
} = require('../models');


Handlebars.registerHelper('getColorClass', function(changePercentage) {
    if (changePercentage[0] === "-") {
        return 'loser';
    } else {
        return 'gainer';
    }
});

router.get('/', (req, res) => {
    axios.get("https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo")
    .then(response => {
        const { most_actively_traded, top_gainers, top_losers } = response.data;
        
        const tickers = [
            ...most_actively_traded,
            ...top_gainers,
            ...top_losers
        ];
        
        res.render("homepage", {
            tickers,
            loggedIn: req.session.loggedIn
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });

    // fetch(
    //     "https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo"
    //   )
    //     .then((response) => response.json())
    //       .then((data) => {
    //           const { most_actively_traded, top_gainers, top_losers } = data;
    //           const tickers = [...most_actively_traded, ...top_gainers, ...top_losers]
    //           return tickers;
    //   });
    //     .then(dbPostData => {
    //         const posts = dbPostData.map(post => post.get({
    //             plain: true
    //         }));

    //         res.render('homepage', {
    //             posts,
    //             loggedIn: req.session.loggedIn
    //         });
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).json(err);
    //     });
});

router.get('/post/:id', (req, res) => {
    Post.findOne({
            where: {
                id: req.params.id
            },
            attributes: [
                'id',
                'title',
                'content',
                'created_at'
            ],
            include: [{
                    model: Comment,
                    attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                    include: {
                        model: User,
                        attributes: ['username']
                    }
                },
                {
                    model: User,
                    attributes: ['username']
                }
            ]
        })
        .then(dbPostData => {
            if (!dbPostData) {
                res.status(404).json({
                    message: 'No post found with this id'
                });
                return;
            }

            const post = dbPostData.get({
                plain: true
            });

            res.render('single-post', {
                post,
                loggedIn: req.session.loggedIn
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }

    res.render('login');
});

router.get('/signup', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }

    res.render('signup');
});


router.get('*', (req, res) => {
    res.status(404).send("Can't go there!");
    // res.redirect('/');
})


module.exports = router;