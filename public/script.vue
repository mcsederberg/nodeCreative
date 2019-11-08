/*global Vue*/
/*global fetch*/
/*global axios*/

var app = new Vue({
  el: '#app',
  data: {
    items: [],
    text: '',
    show: 'all',
    movies: [],
    viewInfo: false,
    selectedMovie: {},
    noGroup: false,
    page: 1,
    displayingMovies: [],
    removedMovies: [],
    newGroupName: '',
    joinGroupName: '',
    id: '',
    invalidJoinID: false,
    invalidCreateID: false,
    groupName: ""
  },
  created: function() {
	this.noGroup = true;
	this.selectedMovie = {};
	this.page = 1;
	this.viewInfo = false;
  },
  computed: {
    
  },
  methods: {
  	resetIDs(){
  		this.groupName = "";
    	this.joinGroupName = "";
    	this.newGroupName = "";
  	},
    async register(){
    	var vue = this;
    	try {
	        const response = await axios.get("/api/groups/"+this.newGroupName, {
	          group: this.joinGroupName
	        });
	        var data = response.data;
	        if (this.newGroupName == data.id){
		        this.invalidCreateID = true;
		        this.resetIDs();
	        } else {
	        	this.groupName = this.newGroupName;
	    		var sendData = async function(){
			      try {
			        const response = await axios.post("/api/groups", {
			          group: vue.newGroupName,
			          movies: vue.movies,
			          removedMovies: vue.removedMovies
			        });
			        vue.text = "";
			        vue.noGroup = false;
			        vue.id = vue.newGroupName;
			      } catch (error){
			        console.log(error);
			      }
		    	}
		        this.getMovies(sendData);
	        }
	      } catch (error){
	        console.log(error);
	      }
    	
    },
    async join(){
      try {
        const response = await axios.get("/api/groups/"+this.joinGroupName, {
          group: this.joinGroupName
        });
        var data = response.data;
        if (this.joinGroupName == data.id){
        	this.groupName = this.joinGroupName;
	        this.movies = data.movies;
	        this.page = this.movies.length/20 + 1;
	        this.removedMovies = data.removedMovies;
	        this.text = "";
	        this.noGroup = false;
	        this.resetDisplayedMovies();
	        this.id = this.joinGroupName;
        } else {
    		this.invalidJoinID = true;
    		this.resetIDs();
        }
      } catch (error){
        console.log(error);
      }
    },
    returnToLogin(){
    	this.noGroup = true;
    	this.resetIDs();
    },
    openInfo(){
    	this.viewInfo = true;	
    },
    closeInfo(){
    	this.viewInfo = false;
    },
    selectMovie(movie){
    	this.selectedMovie = movie;
    },
    unselectMovie(){
    	this.selectedMovie = {};
    },
    removeMovie(movie){
    	var vue = this;
    	this.removedMovies.push({id:movie.id});
    	var updateServer = async function(){
	      try {
	        const response = await axios.put("/api/groups", {
	          group: vue.id,
	          movies: vue.movies,
	          removedMovies: vue.removedMovies
	        });
	      } catch (error){
	        console.log(error);
	      }
    	}
    	this.resetDisplayedMovies(updateServer);
    },
    resetDisplayedMovies(callback) {
    	var vue = this;
	   //Find values that are in vue.removedMovies but not in vue.movies
		var uniqueResultOne = vue.removedMovies.filter(function(obj) {
		    return !vue.movies.some(function(obj2) {
		        return obj.id == obj2.id;
		    });
		});
		
		//Find values that are in vue.movies but not in vue.removedMovies
		var uniqueResultTwo = vue.movies.filter(function(obj) {
		    return !vue.removedMovies.some(function(obj2) {
		        return obj.id == obj2.id;
		    });
		});
		
		//Combine the two arrays of unique entries
		var newMovies = uniqueResultOne.concat(uniqueResultTwo);
		
		//Make sure there's no duplicates displayed
		function getUnique(arr, comp) {
		  const unique = arr
		    .map(e => e[comp])
		    .map((e, i, final) => final.indexOf(e) === i && i)
		    .filter(e => arr[e]).map(e => arr[e]);
		   return unique;
		}
		newMovies = getUnique(newMovies,"id");
		
		this.displayingMovies = newMovies.slice(0,15);
		if (callback){
			callback();
		}
		if (newMovies.length < 17){
			this.getMovies();
		}
	},
    async getMovies(callback){
    	var vue = this;
    	var url = "https://api.themoviedb.org/3/discover/movie?api_key=3d4555d8c823ae1ca96284b6e93398ee&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=" + this.page;
        // var url = "https://api.themoviedb.org/3/trending/movie/week?api_key=3d4555d8c823ae1ca96284b6e93398ee";
        fetch(url, {mode: 'cors'})
        	.then(function(response) {
        	return response.json();
        }).then(function(json) {
        	console.log(json);
        	var temp = json.results;
        	temp.forEach(function(movie, index, array){
        		if (movie.adult){
        			 array.splice(index,1);
        		} else {
	        		delete movie.adult;
	        		delete movie.genre_ids;
	        		delete movie.original_language;
	        		delete movie.original_title;
	        		delete movie.popularity;
	        		delete movie.video;
	        		delete movie.vote_count;
        		}
        	});
        	var results = temp;
        	vue.movies = vue.movies.concat(results);
        	vue.displayingMovies = results.slice(0,15);
        	vue.page++;
        	if (callback){
        		callback();
        	}
        	vue.resetDisplayedMovies();
        });
    },
    async addItem() {
      try {
        const response = await axios.post("/api/items", {
          text: this.text,
          completed: false
        });
        this.text = "";
        this.getItems();
      } catch (error){
        console.log(error);
      }
      this.items.push({
        text: this.text,
        completed: false
      });
      this.text = '';
    },
    deleteItem(item) {
      var index = this.items.indexOf(item);
      if (index > -1)
        this.items.splice(index, 1);
    },
    showAll() {
      this.show = 'all';
    },
    showActive() {
      this.show = 'active';
    },
    showCompleted() {
      this.show = 'completed';
    },
    deleteCompleted() {
      this.items.forEach(item => {
        if (item.completed)
          this.deleteItem(item);
      });
    },
    async getItems() {
      try {
        const response = await axios.get("/api/items");
        this.items = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async completeItem(item) {
      try {
        const response = axios.put("/api/items/" + item.id, {
          text: item.text,
          completed: !item.completed,
        });
        this.getItems();
      } catch (error) {
        console.log(error);
      }
    },
    async deleteItem(item) {
      try {
        const response = await axios.delete("/api/items/" + item.id);
        this.getItems();
      } catch (error) {
        console.log(error);
      }
    },
  }
});