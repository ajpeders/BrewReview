const server = require("../src/server");

const chai = require("chai");

const chaiHttp = require("chai-http");
const { response } = require("express");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe("Server Up!", () => {
    
    //test get for main page
    it("Test Main Page", (done) => {
        chai 
            .request(server)
            .get("/")
            .end((err,res) => {
                expect(res).to.have.status(201);
                expect(res.text).to.contain('title');
                expect(res.text).to.contain('Home');
                expect(res.text).to.contain('Brew Review');
                done();
            });
    });

    //test review post works when req full
    it("Test Review Post - Valid Review Entry", (done) => {
        
        const posReview = {
            brew_name: 'Test Brew',
            review_data: 'Test Review',
        };

        chai
            .request(server)
            .post("/reviews")
            .send(posReview)
            .end((err,res) => {
                expect(res).to.have.status(201);
                //displayed in review table
                expect(res.text).to.contain(posReview.brew_name);
                expect(res.text).to.contain(posReview.review_data);
                expect(res.text).to.contain("Review Posted");
                done();
            });
    });


    //test review post doesn't work when req empty
    it("Test Review Post - Invalid Review Entry (empty)", (done) => {
        
        const negReview = {
            brew_name: '',
            review_data: '',
        };

        chai
            .request(server)
            .post("/reviews")
            .send(negReview)
            .end((err,res) => {
                expect(res).to.have.status(401);
                expect(res.text).to.contain('Review Post Error');
                done();
            });
    });

    //test get reviews with valid filter
    it("Test Review Get - Reviews Present in Filter", (done) => {
        chai
            .request(server)
            .get("/reviews?filter=Test+Brew")
            .end((err,res) => {
                expect(res).to.have.status(201);
                expect(res.text).to.contain('Results matching (Test Brew)');
                expect(res.text).to.contain('Test Brew');
                expect(res.text).to.contain("Reviews Found");
                done();
            });
    });

    //test get reviews with non matching filter
    it("Test Review Get - No reviews in Filter", (done) => {
        var nullStr= 'zzzzzzzzzzzzzzzz';
        chai
            .request(server)
            .get("/reviews?filter="+nullStr)
            .end((err,res) => {
                expect(res).to.have.status(202);
                expect(res.text).to.contain('No Reviews Found');
                expect(res.text).to.contain('No Results for '+nullStr);
                done();
            })
    });

    //test get with no
    it("Test Review Get - No String For Filter", (done) => {
        chai
            .request(server)
            .get("/reviews?filter=")
            .end((err,res) => {
                expect(res).to.have.status(203);
                expect(res.text).to.contain('Reviews');
                done();
            })
    });
});