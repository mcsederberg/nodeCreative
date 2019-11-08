const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));

// parse application/json
app.use(bodyParser.json());
app.use(express.static('public'));

let groups = {};

app.post('/api/groups/', (req, res) => {
  let id = req.body.group;
  let group = {
    id: req.body.group,
    movies: req.body.movies,
    removedMovies: req.body.removedMovies
  };
  console.log("post ID: "+ id);
  groups[id] = group;
  res.send(group);
});

app.get('/api/groups/:id', (req, res) => {
  var id = req.params.id;
  console.log("Get ID: " + id);
  res.send(groups[id]);
});

app.put('/api/groups/', (req, res) => {
  var id = req.body.group;
  var removedMovies = req.body.removedMovies;
  var movies = req.body.movies;
  var group = groups[id];
  group.removedMovies = removedMovies;
  group.movies = movies;
  groups[id] = group;
  res.send(group);
});
app.delete('/api/groups/:id', (req, res) => {
  let id = parseInt(req.params.id);
  let removeIndex = items.map(item => {
      return item.id;
    })
    .indexOf(id);
  if (removeIndex === -1) {
    res.status(404)
      .send("Sorry, that item doesn't exist");
    return;
  }
  items.splice(removeIndex, 1);
  res.sendStatus(200);
});

app.listen(4200, () => console.log('Server listening on port 4200!'));