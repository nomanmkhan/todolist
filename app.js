

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-noman:admin@cluster0.jrszv.mongodb.net/todolistDB", {useUnifiedTopology: true, useNewUrlParser: true});
// mongoose.set('useFindAndModify', false);
// SCHEMA
const itemsSchema =  {
  name: String
};
// MODEL
const Item = mongoose.model("Item", itemsSchema);

// ADDING ITEMS
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

// CUSTOM LIST SCHEMA
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

  if(foundItems.length === 0 ){
    // INSERTING MANY DATA
    Item.insertMany(defaultItems, function(err){
    if(err){
    consolue.log(err);
    }else{
    console.log("Successfully saved default items to DB.");
  }
});
res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  });
});

// CUSTOM LIST
app.get("/:customListName", function(req, res){
const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}, function(err, foundList){
  if(!err){
    if(!foundList){
      // Create a new List
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else{
      // Show an existing List
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      
    });
    res.redirect("/" + listName);
    
  }
});

app.post("/delete", function(req, res){
  const checkItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findOneAndDelete(checkItemID, function(err){
      if(!err){
        console.log("Successfully Deleted selected Item.");
        res.redirect("/");
      }
    });

  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
