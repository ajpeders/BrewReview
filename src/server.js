var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());             
app.use(bodyParser.urlencoded({ extended: true }));

var pgp = require('pg-promise')();

const dev_dbConfig = {
	host: 'db',
	port: 5432,
	database: process.env.POSTGRES_DB,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD
};

const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

if (isProduction) {
	pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}

const db = pgp(dbConfig);

// set the view engine to ejs
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs');
app.use(express.static('resources/css'));
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/'));

//render home page
app.get('/', function(req, res) {
    res.status(201).render('pages/main.ejs',{
        title: "Home"
    })
});

//render review
//Case 1: Filtered List
//Case 2: Null Filter 
//Case 3: No filter

app.get('/reviews', function(req,res){
    var filter_info =req.query.filter;
    

    var get_reviews = '';
    
    if(filter_info){
        get_reviews = "SELECT * FROM reviews WHERE UPPER(brewery_name) LIKE";
        if(filter_info.length > 2)//look for substring in name
            get_reviews += " '%"+filter_info.toUpperCase()+"%';";
        else //show breweries matching on first 1-2 chars 
            get_reviews += " '"+filter_info.toUpperCase()+"%';";
    }

    var all_reviews = "SELECT * FROM reviews;";

    db.task('get-everything', task => {
        if(get_reviews){
            return task.batch([
                task.any(all_reviews),
                task.any(get_reviews)
           ])
        }else{
            return task.batch([
                task.any(all_reviews),
            ])
        }
    }) 
    .then(info => {
        //filter entered
        if(filter_info){
            //results received
            if(info[1].length > 0){
                res.status(201).render('pages/reviews.ejs',{
                    title: 'Reviews Found',
                    disReviews: info[1],
                    numFreviews: info[1].length,
                    numAllRev: info[0].length,
                    filterStr: filter_info
                })
            //no filter results
            }else{
                res.status(202).render('pages/reviews.ejs',{
                    title: 'No Reviews Found',
                    disReviews: info[0],
                    numFreviews: '',
                    numAllRev: info[0].length,
                    filterStr: filter_info
                })
            }
        //no filter
        }else{
            res.status(203).render('pages/reviews.ejs',{
                title: 'Reviews',
                disReviews: info[0],
                numFreviews: '',
                numAllRev: info[0].length,
                filterStr: ''
            })
        }
    })
    .catch(err => {
        res.status(401).render('pages/reviews.ejs', {
            title: 'Filtered Reviews Error',
            disReviews: '',
            numFreviews: '',
            numAllRev: '',
            filterStr: ''
        })
    });
});

//when posting a review, render review page
app.post('/reviews', function(req, res){

    const review = {
        brew_name: req.body.brew_name,
        review_data: req.body.review_data,
    };
    var post_review = '';

    if(review.brew_name && review.review_data)
        post_review = "INSERT INTO reviews (brewery_name,review,review_date) VALUES ('"+
            review.brew_name+"','"+review.review_data+"',NOW())";    
    
        
    var get_reviews = "SELECT * FROM reviews;";

    db.task('get-everything', task => {
        return task.batch([
            task.any(post_review),
            task.any(get_reviews)
        ])
    }) 
    .then(info => {
    	res.status(201).render('pages/reviews.ejs',{
            title: 'Review Posted',
            disReviews: info[1],
            numFreviews: '',
            numAllRev: info[1].length,
            filterStr: ''
        });
    })
    .catch(err => {
        res.status(401).render('pages/reviews.ejs', {
            title: 'Review Post Error',
            disReviews: '',
            numFreviews: '',
            numAllRev: '',
            filterStr: ''
        })
    })
});

//module.exports = app.listen(3000);

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });
  

module.exports = server;
