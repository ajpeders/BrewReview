var url = "//api.openbrewerydb.org/breweries";
var search_url = "//api.openbrewerydb.org/breweries/search?query=";
var search_btn = document.getElementById("search_btn");
var searchBar = document.getElementById("searchBar");
var brew_id = '';

//check for enter key pressed in search
//then fill page from search
searchBar.addEventListener("keyup", function(e){
    if(e.key == 'Enter')
        retrieveData();
});

//when search is init run data to fill page
search_btn.addEventListener("click", function(){
    retrieveData();
});

//check if review has been added to text area
review_data.addEventListener("keyup", function(){
    if(document.getElementById("review_data").value == ''){
        document.getElementById("review_btn").disabled = true;
    }else{
        document.getElementById("review_btn").disabled = false; 
    }
});

//get data from brewerydb for cards
function retrieveData(){
    var newRequest = new XMLHttpRequest();
    var brew_search = document.getElementById("searchBar").value;

    if(brew_search) url = search_url+brew_search;

    newRequest.open('GET', url);
    newRequest.onload = function(){
        var newData = JSON.parse(newRequest.responseText);
        renderPage(newData);
    };
    newRequest.send();
}

//create brewery cards
function renderPage(data){
    var brew_hold = document.getElementById("brew_hold");
    var card = '';
    var count = 0;
    
    brew_hold.innerHTML = "";

    data.forEach(item => {
        console.log(item);
        if (count == 0){//create new row
            card += '<div class = "row d-flex justify-content-around" style="margin-bottom: 2%">';
        }
        card += '<div class="col-md-3 card">'+
                    '<div class="card-body">'+
                        '<h5 class="card-title">'+
                            item.name+
                        '</h5>'+
                        '<div class="row card-text">'+
                            item.brewery_type+
                        '</div>'+
                        '<div style="margin-top: 2%;" class="row card-text">'+
                            item.street+
                        '</div></br>'+
                        '<div class="row">'+
                        '<a style="margin-bottom: 0;" href="#" type="button" onclick="reviewData(\''+item.id+'\'); return false;" class="btn btn-secondary" data-toggle="modal" data-target="#reviewModal">'+
                            'Add Review'+
                        '</a>'+
                        '</div>'+
                    '</div>'+
                '</div>';
                count++;
        if(count == 3){ //end row
            card +='</div>';
            count = 0;
        }
    });
    brew_hold.insertAdjacentHTML('beforeend',card);
}

//retrieve brewery data with id for brewery reviews
function reviewData(brew_id){
    var url = "//api.openbrewerydb.org/breweries/"+brew_id;
    var newRequest = new XMLHttpRequest();
    newRequest.open('GET',url);
    newRequest.onload = function(){
        var newData = JSON.parse(newRequest.responseText);
        document.getElementById("brew_name").setAttribute('value',newData.name);
    };
    newRequest.send();
}


