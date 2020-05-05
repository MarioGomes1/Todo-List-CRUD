//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Mario:test123@cluster0-m9rtb.mongodb.net/todoListDB", {
  useNewUrlParser: true});


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todoList"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<--- Hit this to delete an item"
});

const defaultItem = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, results) {

    if (results.length === 0) {
      Item.insertMany(defaultItem, function(err) {
        console.log("Items saved to database");
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today",newListItems: results});

    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today"){

    Item.findByIdAndRemove(checkedItemId, function(err) {
    console.log(err);
    res.redirect("/");
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}}, function(err, result){
    if(!err){
      res.redirect("/" + listName);
      }
    });
  }

});




app.get("/:newCategory", function(req, res) {
  const customListName = _.capitalize(req.params.newCategory);

  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {

        const list = new List({
          name: customListName,
          items: defaultItem
        });

        list.save();
        res.redirect("/"+customListName)

      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }

  });

});


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}



app.listen(port, function() {
  console.log("Server started ");
});
